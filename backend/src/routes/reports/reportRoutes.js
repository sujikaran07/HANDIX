const express = require('express');
const router = express.Router();
const { sequelize } = require('../../config/db');
const { QueryTypes } = require('sequelize');
const Category = require('../../models/categoryModel');
const { generatePDFReport } = require('../../utils/reportGenerator');
const { generateExcelReport } = require('../../utils/excelGenerator');
const path = require('path');
const fs = require('fs');
const { Order } = require('../../models/orderModel');
const { Customer } = require('../../models/customerModel');
const Inventory = require('../../models/inventoryModel');
const { Employee } = require('../../models/employeeModel');
const { OrderDetail } = require('../../models/orderDetailModel');

// Clean up temporary files older than 1 hour
const cleanupTempFiles = () => {
  const tempDir = path.resolve(__dirname, '../../temp');
  if (!fs.existsSync(tempDir)) return;
  
  const files = fs.readdirSync(tempDir);
  const now = new Date().getTime();
  const oneHourAgo = now - (60 * 60 * 1000);
  
  files.forEach(file => {
    const filePath = path.join(tempDir, file);
    const stats = fs.statSync(filePath);
    const fileTime = new Date(stats.mtime).getTime();
    
    if (fileTime < oneHourAgo) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Deleted old temp file: ${file}`);
      } catch (error) {
        console.error(`Failed to delete temp file: ${error.message}`);
      }
    }
  });
};

// Run cleanup every hour
setInterval(cleanupTempFiles, 60 * 60 * 1000);

// Helper function to get report title
const getReportTitle = (reportType) => {
  switch(reportType) {
    case 'sales': return 'Sales Report';
    case 'products': return 'Product Report';
    case 'customers': return 'Customer Report';
    case 'artisans': return 'Artisan Report';
    default: return 'Report';
  }
};

// Get sales report data - update to use AliExpress-style grouping and metrics
router.post('/sales', async (req, res) => {
  try {
    console.log('Received sales report request with filters:', req.body);
    const { startDate, endDate, categories = [], groupBy = 'day' } = req.body;
    
    // Build the WHERE clause for date filtering
    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = `AND o.order_date BETWEEN '${startDate}' AND '${endDate}'`;
    }

    // Build the WHERE clause for category filtering
    let categoryFilter = '';
    if (categories && categories.length > 0) {
      categoryFilter = `AND i.category_id IN (${categories.join(',')})`;
    }

    // Query to get summary data with AliExpress-style metrics
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT o.order_id) as orderCount,
        SUM(o.total_amount) as totalSales,
        CASE WHEN COUNT(DISTINCT o.order_id) > 0 
          THEN SUM(o.total_amount) / COUNT(DISTINCT o.order_id) 
          ELSE 0 
        END as averageOrderValue,
        COUNT(DISTINCT o.c_id) as uniqueCustomers,
        SUM(od.quantity) as totalQuantity,
        COUNT(DISTINCT i.product_id) as uniqueProducts
      FROM "Orders" o
      LEFT JOIN "OrderDetails" od ON o.order_id = od.order_id
      LEFT JOIN "Inventory" i ON od.product_id = i.product_id
      LEFT JOIN "Customers" c ON o.c_id = c.c_id
      WHERE o.order_status != 'Cancelled'
      ${dateFilter}
      ${categoryFilter}
    `;

    // Add time grouping for analysis - AliExpress style time series
    let timeGrouping = 'DATE(o.order_date)';
    let timeFormat = 'YYYY-MM-DD';
    
    if (groupBy === 'month') {
      timeGrouping = "DATE_TRUNC('month', o.order_date)";
      timeFormat = 'YYYY-MM';
    } else if (groupBy === 'week') {
      timeGrouping = "DATE_TRUNC('week', o.order_date)";
      timeFormat = 'YYYY-WW';
    }

    // Query to get sales over time - AliExpress trend analysis
    const timeSeriesQuery = `
      SELECT 
        ${timeGrouping} as period,
        SUM(o.total_amount) as sales_amount,
        COUNT(DISTINCT o.order_id) as order_count,
        SUM(od.quantity) as quantity_sold
      FROM "Orders" o
      LEFT JOIN "OrderDetails" od ON o.order_id = od.order_id
      LEFT JOIN "Inventory" i ON od.product_id = i.product_id
      WHERE o.order_status != 'Cancelled'
      ${dateFilter}
      ${categoryFilter}
      GROUP BY period
      ORDER BY period
    `;

    // Query for sales by category - AliExpress category distribution
    const categoryQuery = `
      SELECT 
        c.category_name,
        SUM(od.quantity * od.price_at_purchase) as sales_amount,
        SUM(od.quantity) as quantity_sold,
        COUNT(DISTINCT o.order_id) as order_count
      FROM "Orders" o
      JOIN "OrderDetails" od ON o.order_id = od.order_id
      JOIN "Inventory" i ON od.product_id = i.product_id
      JOIN "Categories" c ON i.category_id = c.category_id
      WHERE o.order_status != 'Cancelled'
      ${dateFilter}
      GROUP BY c.category_name
      ORDER BY sales_amount DESC
    `;

    // Query to get detailed sales data - Same as before but with enhanced fields
    const detailQuery = `
      SELECT 
        o.order_id,
        o.order_date,
        o.total_amount,
        SUM(od.quantity) as quantity,
        i.product_name,
        cat.category_name,
        c.c_id,
        CONCAT(c.first_name, ' ', c.last_name) as customer_name,
        o.payment_method,
        o.order_status,
        o.payment_status
      FROM "Orders" o
      LEFT JOIN "OrderDetails" od ON o.order_id = od.order_id
      LEFT JOIN "Inventory" i ON od.product_id = i.product_id
      LEFT JOIN "Categories" cat ON i.category_id = cat.category_id
      LEFT JOIN "Customers" c ON o.c_id = c.c_id
      WHERE o.order_status != 'Cancelled'
      ${dateFilter}
      ${categoryFilter}
      GROUP BY o.order_id, o.order_date, o.total_amount, i.product_name, cat.category_name, 
               c.c_id, c.first_name, c.last_name, o.payment_method, o.order_status, o.payment_status
      ORDER BY o.order_date DESC
      LIMIT 100
    `;

    // Execute queries with error handling
    try {
      const summaryResults = await sequelize.query(summaryQuery, { type: QueryTypes.SELECT });
      const timeSeriesResults = await sequelize.query(timeSeriesQuery, { type: QueryTypes.SELECT });
      const categoryResults = await sequelize.query(categoryQuery, { type: QueryTypes.SELECT });
      const detailResults = await sequelize.query(detailQuery, { type: QueryTypes.SELECT });

      // Format summary data with AliExpress style metrics
      const summary = {
        totalSales: parseFloat(summaryResults[0]?.totalsales || 0) || 0,
        orderCount: parseInt(summaryResults[0]?.ordercount || 0) || 0,
        averageOrderValue: parseFloat(summaryResults[0]?.averageordervalue || 0) || 0,
        uniqueCustomers: parseInt(summaryResults[0]?.uniquecustomers || 0) || 0,
        totalQuantity: parseInt(summaryResults[0]?.totalquantity || 0) || 0,
        uniqueProducts: parseInt(summaryResults[0]?.uniqueproducts || 0) || 0
      };

      return res.json({
        success: true,
        summary,
        timeSeries: timeSeriesResults || [],
        categories: categoryResults || [],
        data: detailResults || [],
        isMockData: false
      });
    } catch (sqlError) {
      console.error('SQL Error in sales report:', sqlError);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error while generating sales report', 
        error: sqlError.message 
      });
    }
  } catch (error) {
    console.error('Error generating sales report:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to generate sales report', 
      error: error.message 
    });
  }
});

// Get product report data
router.post('/products', async (req, res) => {
  try {
    console.log('Received products report request with filters:', req.body);
    const { startDate, endDate, categories = [], stockStatus = '' } = req.body;
    
    // Log stock status filter specifically for debugging
    console.log(`Filtering products by stock status: "${stockStatus}"`);
    
    // Build the WHERE clause for date filtering
    let dateFilter = '';
    if (startDate && endDate) {
      // Use order date instead of od.created_at which doesn't exist
      dateFilter = `AND o.order_date BETWEEN '${startDate}' AND '${endDate}'`;
    }

    // Build the WHERE clause for category filtering
    let categoryFilter = '';
    if (categories && categories.length > 0) {
      categoryFilter = `AND i.category_id IN (${categories.join(',')})`;
    }

    // Build the WHERE clause for stock status filtering
    let stockFilter = '';
    if (stockStatus) {
      if (stockStatus === 'in-stock') {
        stockFilter = 'AND i.quantity > 5';
      } else if (stockStatus === 'low-stock') {
        stockFilter = 'AND i.quantity BETWEEN 1 AND 5';
      } else if (stockStatus === 'out-of-stock') {
        stockFilter = 'AND i.quantity = 0';
      }
    }

    // Query to get summary data
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT i.product_id) as totalProducts,
        SUM(CASE WHEN i.quantity = 0 THEN 1 ELSE 0 END) as productsOutOfStock,
        SUM(CASE WHEN i.quantity BETWEEN 1 AND 5 THEN 1 ELSE 0 END) as productsLowStock
      FROM "Inventory" i
      WHERE 1=1
      ${categoryFilter}
    `;

    // Query to get detailed product data
    const detailQuery = `
      SELECT 
        i.product_id,
        i.product_name,
        i.quantity as stock_level,
        cat.category_name,
        COUNT(DISTINCT od.order_id) as order_count,
        SUM(od.quantity) as total_sold,
        SUM(od.price_at_purchase * od.quantity) as total_revenue
      FROM "Inventory" i
      LEFT JOIN "Categories" cat ON i.category_id = cat.category_id
      LEFT JOIN "OrderDetails" od ON i.product_id = od.product_id
      LEFT JOIN "Orders" o ON od.order_id = o.order_id
      WHERE (o.order_status != 'Cancelled' OR o.order_status IS NULL)
      ${dateFilter}
      ${categoryFilter}
      ${stockFilter}
      GROUP BY i.product_id, i.product_name, i.quantity, cat.category_name
      ORDER BY total_sold DESC NULLS LAST
      LIMIT 100
    `;

    // Execute queries with error handling
    let summaryResults, detailResults;
    try {
      summaryResults = await sequelize.query(summaryQuery, { type: QueryTypes.SELECT });
      detailResults = await sequelize.query(detailQuery, { type: QueryTypes.SELECT });
    } catch (sqlError) {
      console.error('SQL Error in product report:', sqlError);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error while generating product report', 
        error: sqlError.message 
      });
    }

    // Format summary data with empty default values if no data found
    const summary = {
      totalProducts: parseInt(summaryResults[0]?.totalproducts || 0) || 0,
      productsOutOfStock: parseInt(summaryResults[0]?.productsoutofstock || 0) || 0,
      productsLowStock: parseInt(summaryResults[0]?.productslowstock || 0) || 0
    };

    // Format detail data - replace nulls with zeros
    const formattedData = detailResults.map(item => ({
      ...item,
      order_count: item.order_count || 0,
      total_sold: item.total_sold || 0,
      total_revenue: item.total_revenue || 0
    }));

    // Calculate low stock count (products with quantity below 10 but above 0)
    const lowStockCount = detailResults.filter(item => item.stock_level < 10 && item.stock_level > 0).length;

    // Add this to the response
    const response = {
      success: true,
      data: formattedData,
      summary: {
        ...summary,
        productsLowStock: lowStockCount, // Add this explicitly
      },
      lowStockCount: lowStockCount, // Also add as a top-level property
      isMockData: false,
      appliedFilters: {
        stockStatus,
        categories,
        startDate,
        endDate
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error generating product report:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to generate product report', 
      error: error.message 
    });
  }
});

// Get customer report data
router.post('/customers', async (req, res) => {
  try {
    console.log('Received customers report request with filters:', req.body);
    const { startDate, endDate, customerType = '', minLifetimeValue = 0 } = req.body;
    
    // Build the WHERE clause for date filtering
    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = `AND o.order_date BETWEEN '${startDate}' AND '${endDate}'`;
    }

    // Build the WHERE clause for customer type filtering
    let customerTypeFilter = '';
    if (customerType) {
      customerTypeFilter = `AND c.account_type = '${customerType}'`;
    }

    // Query to get summary data
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT c.c_id) as totalCustomers,
        SUM(CASE WHEN c.registration_date >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as newCustomers,
        COUNT(DISTINCT CASE WHEN o.order_id IS NOT NULL THEN c.c_id END) as returningCustomers
      FROM "Customers" c
      LEFT JOIN "Orders" o ON c.c_id = o.c_id AND o.order_status != 'Cancelled'
      WHERE c.account_status = 'Approved'
      ${customerTypeFilter}
    `;

    // Query to get detailed customer data
    const detailQuery = `
      SELECT 
        c.c_id,
        CONCAT(c.first_name, ' ', c.last_name) as customer_name,
        c.email,
        COUNT(o.order_id) as order_count,
        SUM(o.total_amount) as total_spent,
        MAX(o.order_date) as last_order_date
      FROM "Customers" c
      LEFT JOIN "Orders" o ON c.c_id = o.c_id AND o.order_status != 'Cancelled'
      WHERE c.account_status = 'Approved'
      ${customerTypeFilter}
      ${dateFilter}
      GROUP BY c.c_id, c.first_name, c.last_name, c.email
      HAVING SUM(o.total_amount) >= ${minLifetimeValue || 0} OR SUM(o.total_amount) IS NULL
      ORDER BY total_spent DESC NULLS LAST
      LIMIT 100
    `;

    // Execute queries
    try {
      const summaryResults = await sequelize.query(summaryQuery, { type: QueryTypes.SELECT });
      const detailResults = await sequelize.query(detailQuery, { type: QueryTypes.SELECT });
    
      // Format summary data with empty default values if no data found
      const summary = {
        totalCustomers: parseInt(summaryResults[0]?.totalcustomers || 0) || 0,
        newCustomers: parseInt(summaryResults[0]?.newcustomers || 0) || 0,
        returningCustomers: parseInt(summaryResults[0]?.returningcustomers || 0) || 0
      };

      // Format detail data - replace nulls with zeros
      const formattedData = detailResults.map(item => ({
        ...item,
        order_count: item.order_count || 0,
        total_spent: item.total_spent || 0
      }));

      return res.json({
        success: true,
        summary,
        data: formattedData || [],
        isMockData: false
      });
    } catch (sqlError) {
      console.error('SQL Error in customer report:', sqlError);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error while generating customer report', 
        error: sqlError.message 
      });
    }
  } catch (error) {
    console.error('Error generating customer report:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to generate customer report', 
      error: error.message 
    });
  }
});

// Get artisan report data
router.post('/artisans', async (req, res) => {
  try {
    console.log('Received artisans report request with filters:', req.body);
    const { startDate, endDate, productivityLevel = '' } = req.body;
    
    // Log productivity level filter specifically for debugging
    console.log(`Filtering artisans by productivity level: "${productivityLevel}"`);
    
    // Build the WHERE clause for date filtering
    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = `AND o.order_date BETWEEN '${startDate}' AND '${endDate}'`;
    }

    // Modify the productivityLevel HAVING clause application
    // Build the WHERE clause for productivity level filtering
    let productivityFilter = '';
    if (productivityLevel) {
      if (productivityLevel === 'high') {
        console.log('Applying HIGH performer filter (> 10 products)');
        productivityFilter = 'HAVING COUNT(DISTINCT i.product_id) > 10';
      } else if (productivityLevel === 'medium') {
        console.log('Applying MEDIUM performer filter (5-10 products)');
        productivityFilter = 'HAVING COUNT(DISTINCT i.product_id) BETWEEN 5 AND 10';
      } else if (productivityLevel === 'low') {
        console.log('Applying LOW performer filter (< 5 products)');
        productivityFilter = 'HAVING COUNT(DISTINCT i.product_id) < 5';
      }
    }
    
    // Query to get summary data
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT e.e_id) as totalArtisans,
        COUNT(DISTINCT CASE WHEN i.product_id IS NOT NULL THEN e.e_id END) as activeArtisans,
        (
          SELECT CONCAT(first_name, ' ', last_name)
          FROM "Employees" e
          JOIN "Inventory" i ON e.e_id = i.e_id
          JOIN "OrderDetails" od ON i.product_id = od.product_id
          GROUP BY e.e_id, e.first_name, e.last_name
          ORDER BY SUM(od.quantity * od.price_at_purchase) DESC
          LIMIT 1
        ) as topPerformer
      FROM "Employees" e
      LEFT JOIN "Inventory" i ON e.e_id = i.e_id
      WHERE e.role_id = 2
    `;

    // Query to get detailed artisan data
    const detailQuery = `
      SELECT 
        e.e_id,
        CONCAT(e.first_name, ' ', e.last_name) as artisan_name,
        COUNT(DISTINCT i.product_id) as product_count,
        COUNT(DISTINCT o.order_id) as order_count,
        COALESCE(SUM(od.quantity * od.price_at_purchase), 0) as total_sales,
        CASE 
          WHEN COUNT(DISTINCT o.order_id) > 0 
          THEN COALESCE(SUM(od.quantity * od.price_at_purchase), 0) / COUNT(DISTINCT o.order_id)
          ELSE 0
        END as avg_product_value
      FROM "Employees" e
      LEFT JOIN "Inventory" i ON e.e_id = i.e_id
      LEFT JOIN "OrderDetails" od ON i.product_id = od.product_id
      LEFT JOIN "Orders" o ON od.order_id = o.order_id AND o.order_status != 'Cancelled'
      WHERE e.role_id = 2
      ${dateFilter}
      GROUP BY e.e_id, e.first_name, e.last_name
      ${productivityFilter}
      ORDER BY total_sales DESC
      LIMIT 100
    `;

    // Log the SQL query for debugging
    console.log(`Artisan detail query with ${productivityLevel} filter:\n${detailQuery}`);

    // Execute queries
    try {
      const summaryResults = await sequelize.query(summaryQuery, { type: QueryTypes.SELECT });
      const detailResults = await sequelize.query(detailQuery, { type: QueryTypes.SELECT });

      // Log how many results were returned
      console.log(`Artisan query returned ${detailResults.length} results with "${productivityLevel}" filter`);

      // Format summary data with empty default values if no data found
      const summary = {
        totalArtisans: parseInt(summaryResults[0]?.totalartisans || 0) || 0,
        activeArtisans: parseInt(summaryResults[0]?.activeartisans || 0) || 0,
        topPerformer: summaryResults[0]?.topperformer || 'N/A'
      };

      return res.json({
        success: true,
        summary,
        data: detailResults || [],
        isMockData: false,
        appliedFilters: {
          productivityLevel,
          startDate,
          endDate
        }
      });
    } catch (sqlError) {
      console.error('SQL Error in artisan report:', sqlError);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error while generating artisan report', 
        error: sqlError.message 
      });
    }
  } catch (error) {
    console.error('Error generating artisan report:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to generate artisan report', 
      error: error.message 
    });
  }
});

// Get report metadata (categories, regions, etc.)
router.get('/metadata', async (req, res) => {
  try {
    // Get actual categories from database
    const categories = await Category.findAll({
      attributes: ['category_id', 'category_name'],
      raw: true
    });

    // Return only categories, removed regions
    return res.json({
      success: true,
      categories: categories.map(c => ({
        id: c.category_id,
        name: c.category_name
      })),
      isMockData: false
    });
  } catch (error) {
    console.error('Error fetching report metadata:', error);
    
    // Fallback to mock metadata if database query fails
    res.json({
      success: true,
      categories: [
        { id: 1, name: 'Handicrafts' },
        { id: 2, name: 'Pottery' },
        { id: 3, name: 'Textiles' },
        { id: 4, name: 'Woodwork' },
        { id: 5, name: 'Jewelry' }
      ],
      isMockData: true
    });
  }
});

// Generate PDF report
router.post('/export/pdf', async (req, res) => {
  try {
    const { reportData, reportType, dateRange } = req.body;

    if (!reportData || !reportType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required data for PDF generation'
      });
    }

    const options = {
      title: getReportTitle(reportType),
      summary: reportData.summary || {},
      data: reportData.data || [],
      type: reportType,
      filters: {
        startDate: dateRange?.startDate,
        endDate: dateRange?.endDate,
        ...req.body.filters
      }
    };

    const pdfFilePath = await generatePDFReport(options);
    
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

// Generate Excel report
router.post('/export/excel', async (req, res) => {
  try {
    const { reportData, reportType, dateRange } = req.body;

    if (!reportData || !reportType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required data for Excel generation'
      });
    }

    const options = {
      title: getReportTitle(reportType),
      summary: reportData.summary || {},
      data: reportData.data || [],
      type: reportType,
      filters: {
        startDate: dateRange?.startDate,
        endDate: dateRange?.endDate,
        ...req.body.filters
      }
    };

    const excelFilePath = await generateExcelReport(options);
    
    return res.json({
      success: true,
      filePath: excelFilePath,
      fileName: path.basename(excelFilePath)
    });
  } catch (error) {
    console.error('Error generating Excel report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate Excel report',
      error: error.message
    });
  }
});

// Download generated report
router.get('/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.resolve(__dirname, `../../temp/${filename}`);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'File not found or has expired'
    });
  }
  
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to download file'
      });
    }
  });
});

module.exports = router;
