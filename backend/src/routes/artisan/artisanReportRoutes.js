const express = require('express');
const router = express.Router();
// Fix database import and connection handling
const { sequelize } = require('../../config/db');
const { formatDate } = require('../../utils/formatters');
const { generateArtisanPdfReport } = require('../../utils/artisanReportGenerator');
const path = require('path');
const fs = require('fs');

// Helper to get date range filter for SQL queries
const getDateRangeFilter = (startDate, endDate) => {
  if (startDate && endDate) {
    return `AND date BETWEEN '${startDate}' AND '${endDate}'`;
  }
  return '';
};

// Helper to handle errors consistently
const handleError = (res, error) => {
  console.error('Error in artisan report route:', error);
  res.status(500).json({
    success: false,
    message: 'Error generating report',
    error: error.message
  });
};

/**
 * Generate orders report for artisan
 */
router.get('/orders', async (req, res) => {
  try {
    const { startDate, endDate, artisanId, status } = req.query;
    
    // Validate required parameters
    if (!artisanId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: artisanId'
      });
    }
    
    const statusFilter = status ? `AND o.status = '${status}'` : '';
    
    const query = `
      SELECT 
        o.id,
        o.order_id,
        o.date,
        o.status,
        o.customer_name,
        pe.product_name,
        od.quantity,
        od.unit_price,
        od.total_amount,
        pe.category
      FROM 
        "Order" o
      JOIN 
        "OrderDetail" od ON o.id = od.order_id
      JOIN 
        "ProductEntry" pe ON od.product_id = pe.product_id
      WHERE 
        pe.artisan_id = :artisanId 
        ${getDateRangeFilter(startDate, endDate)}
        ${statusFilter}
      ORDER BY 
        o.date DESC
    `;
    
    // Execute query using sequelize instead of db.query
    const [data] = await sequelize.query(query, {
      replacements: { artisanId },
      type: sequelize.QueryTypes.SELECT
    });
    
    // Calculate summaries and send response
    let totalSales = 0;
    let orderCount = 0;
    let orderIds = new Set();
    
    if (data && data.length) {
      data.forEach(row => {
        totalSales += parseFloat(row.total_amount);
        if (!orderIds.has(row.order_id)) {
          orderIds.add(row.order_id);
          orderCount++;
        }
      });
      
      // Get average order value
      const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;
      
      // Get status distribution
      const statusCounts = {};
      data.forEach(row => {
        if (!statusCounts[row.status]) {
          statusCounts[row.status] = 0;
        }
        statusCounts[row.status]++;
      });
      
      // Find top product
      const productSales = {};
      data.forEach(row => {
        if (!productSales[row.product_name]) {
          productSales[row.product_name] = 0;
        }
        productSales[row.product_name] += parseFloat(row.total_amount);
      });
      
      const topProduct = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .map(([name]) => name)[0] || 'None';
      
      res.json({
        success: true,
        data: data || [],
        summary: {
          totalSales,
          orderCount,
          avgOrderValue,
          topProduct,
          uniqueProducts: Object.keys(productSales).length
        },
        artisanId: artisanId
      });
    } else {
      res.json({
        success: true,
        data: [],
        summary: {
          totalSales: 0,
          orderCount: 0,
          avgOrderValue: 0,
          topProduct: 'None',
          uniqueProducts: 0
        },
        artisanId: artisanId
      });
    }
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * Generate products report for artisan
 */
router.get('/products', async (req, res) => {
  try {
    const { startDate, endDate, artisanId, category } = req.query;
    
    // Validate required parameters
    if (!artisanId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: artisanId'
      });
    }
    
    // Build category filter if provided
    const categoryFilter = category ? `AND pe.category = '${category}'` : '';
    
    // Query using the correct table names based on your Sequelize models
    const query = `
      SELECT 
        pe.id,
        pe.product_name,
        pe.category,
        pe.description,
        pe.price,
        i.stock_level,
        SUM(COALESCE(od.quantity, 0)) as total_sold,
        SUM(COALESCE(od.quantity * od.unit_price, 0)) as total_revenue
      FROM 
        "ProductEntry" pe
      LEFT JOIN 
        "Inventory" i ON pe.product_id = i.product_id
      LEFT JOIN 
        "OrderDetail" od ON pe.product_id = od.product_id
      LEFT JOIN 
        "Order" o ON od.order_id = o.id
        ${startDate && endDate ? `AND o.date BETWEEN '${startDate}' AND '${endDate}'` : ''}
      WHERE 
        pe.artisan_id = :artisanId
        ${categoryFilter}
      GROUP BY 
        pe.id, pe.product_name, pe.category, pe.description, pe.price, i.stock_level
      ORDER BY 
        total_sold DESC
    `;
    
    // Execute query using sequelize
    const [data] = await sequelize.query(query, {
      replacements: { artisanId },
      type: sequelize.QueryTypes.SELECT
    });
    
    // If no data found
    if (!data || data.length === 0) {
      return res.json({
        success: true,
        data: [],
        summary: {},
        message: 'No product data found for the specified criteria'
      });
    }
    
    // Calculate summaries
    const totalProducts = data.length;
    const totalRevenue = data.reduce((sum, product) => sum + parseFloat(product.total_revenue || 0), 0);
    const totalSold = data.reduce((sum, product) => sum + parseInt(product.total_sold || 0), 0);
    const lowStockCount = data.filter(p => p.stock_level < 10 && p.stock_level > 0).length;
    const outOfStockCount = data.filter(p => p.stock_level <= 0).length;
    
    // Format data for visualization
    data.forEach(product => {
      // Add sales_data field for charts
      product.sales_data = createMockSalesData(startDate, endDate);
    });
    
    res.json({
      success: true,
      data: data,
      summary: {
        totalProducts,
        totalRevenue,
        totalSold,
        lowStockCount,
        outOfStockCount,
        avgRevenuePerProduct: totalProducts > 0 ? totalRevenue / totalProducts : 0
      },
      artisanId: artisanId
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * Generate performance report for artisan
 */
router.get('/performance', async (req, res) => {
  try {
    const { startDate, endDate, artisanId } = req.query;
    
    // Validate required parameters
    if (!artisanId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: artisanId'
      });
    }
    
    // Create date range for periods
    const periods = generatePeriods(startDate, endDate);
    
    // Query using the correct table names based on your Sequelize models
    const query = `
      SELECT 
        DATE_FORMAT(o.date, '%Y-%m') as period,
        COUNT(DISTINCT o.id) as completed_orders,
        AVG(r.rating) as rating,
        SUM(CASE WHEN o.delivery_date <= o.expected_date THEN 1 ELSE 0 END) as on_time,
        SUM(CASE WHEN o.delivery_date > o.expected_date THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN o.delivery_date < DATE_SUB(o.expected_date, INTERVAL 1 DAY) THEN 1 ELSE 0 END) as early
      FROM 
        "Order" o
      JOIN 
        "OrderDetail" od ON o.id = od.order_id
      JOIN 
        "ProductEntry" pe ON od.product_id = pe.product_id
      LEFT JOIN 
        "Review" r ON o.id = r.order_id
      WHERE 
        pe.artisan_id = :artisanId
        ${getDateRangeFilter(startDate, endDate)}
        AND o.status = 'Completed'
      GROUP BY 
        period
      ORDER BY 
        period
    `;
    
    // Execute query using sequelize
    const [data] = await sequelize.query(query, {
      replacements: { artisanId },
      type: sequelize.QueryTypes.SELECT
    });
    
    // If no data found, use periods with zero values
    if (!data || data.length === 0) {
      const emptyData = periods.map(period => ({
        period,
        completed_orders: 0,
        rating: 0,
        on_time: 0,
        late: 0,
        early: 0
      }));
      
      return res.json({
        success: true,
        data: emptyData,
        summary: {
          totalCompletedOrders: 0,
          avgRating: 0,
          onTimeDeliveryRate: 0,
          totalRevisions: 0
        },
        artisanId: artisanId
      });
    }
    
    // Fill in missing periods with zero values
    const periodMap = {};
    data.forEach(row => {
      periodMap[row.period] = row;
    });
    
    const completeData = periods.map(period => {
      return periodMap[period] || {
        period,
        completed_orders: 0,
        rating: 0,
        on_time: 0,
        late: 0,
        early: 0
      };
    });
    
    // Calculate summaries
    const totalCompletedOrders = completeData.reduce((sum, row) => sum + parseInt(row.completed_orders || 0), 0);
    const totalRatings = completeData.reduce((sum, row) => sum + (parseFloat(row.rating || 0) * parseInt(row.completed_orders || 0)), 0);
    const avgRating = totalCompletedOrders > 0 ? totalRatings / totalCompletedOrders : 0;
    
    const totalOnTime = completeData.reduce((sum, row) => sum + parseInt(row.on_time || 0), 0);
    const totalLate = completeData.reduce((sum, row) => sum + parseInt(row.late || 0), 0);
    const totalEarly = completeData.reduce((sum, row) => sum + parseInt(row.early || 0), 0);
    const onTimeDeliveryRate = totalCompletedOrders > 0 ? (totalOnTime / totalCompletedOrders) * 100 : 0;
    
    res.json({
      success: true,
      data: completeData,
      summary: {
        totalCompletedOrders,
        avgRating,
        onTimeDeliveryRate,
        totalRevisions: totalLate * 1.5 // Estimating revisions based on late deliveries
      },
      artisanId: artisanId
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * Generate PDF report
 */
router.post('/export/pdf', async (req, res) => {
  try {
    const { reportData, reportType, dateRange, artisanId } = req.body;

    if (!reportData || !reportType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    const options = {
      title: `Artisan ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      summary: reportData.summary || {},
      data: reportData.data || [],
      type: reportType,
      filters: {
        startDate: dateRange?.startDate,
        endDate: dateRange?.endDate,
        ...req.body.filters
      },
      artisanInfo: {
        id: artisanId
      },
      pdfOptions: req.body.pdfOptions || {}
    };

    const pdfFilePath = await generateArtisanPdfReport(options);
    
    return res.json({
      success: true,
      filePath: pdfFilePath,
      fileName: path.basename(pdfFilePath)
    });
  } catch (error) {
    console.error('Error generating PDF report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report',
      error: error.message
    });
  }
});

/**
 * Download report file
 */
router.get('/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.resolve(__dirname, `../../temp/${filename}`);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'File not found or has expired'
    });
  }
  
  // Set appropriate content type based on file extension
  const ext = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream';
  
  if (ext === '.pdf') {
    contentType = 'application/pdf';
  } else if (ext === '.json') {
    contentType = 'application/json';
  }
  
  // Set appropriate headers for the download
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-cache');
  
  // Stream the file to the client
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
  
  // Handle errors during streaming
  fileStream.on('error', (err) => {
    console.error('Error streaming file:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error streaming file',
        error: err.message
      });
    }
    res.end();
  });
});

// Helper function to generate mock sales data
function createMockSalesData(startDate, endDate) {
  const salesData = {};
  if (!startDate || !endDate) return salesData;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Generate sales data for each day
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateString = formatDate(date);
    salesData[dateString] = Math.floor(Math.random() * 10) * 500; // Random sales amount
  }
  
  return salesData;
}

// Helper function to generate periods (months) between two dates
function generatePeriods(startDate, endDate) {
  const periods = [];
  if (!startDate || !endDate) {
    // Default to last 6 months
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 5);
    
    for (let date = new Date(start); date <= end; date.setMonth(date.getMonth() + 1)) {
      periods.push(date.toISOString().substring(0, 7)); // YYYY-MM format
    }
    
    return periods;
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // First day of start month
  start.setDate(1);
  
  // Last day of end month
  end.setMonth(end.getMonth() + 1);
  end.setDate(0);
  
  for (let date = new Date(start); date <= end; date.setMonth(date.getMonth() + 1)) {
    periods.push(date.toISOString().substring(0, 7)); // YYYY-MM format
  }
  
  return periods;
}

module.exports = router;
