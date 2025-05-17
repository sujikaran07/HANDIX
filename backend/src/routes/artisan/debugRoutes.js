const express = require('express');
const router = express.Router();
const { Employee } = require('../../models/employeeModel');
const ProductEntry = require('../../models/productEntryModel');
const { Order } = require('../../models/orderModel');
const { Op } = require('sequelize');
const { sequelize } = require('../../config/db');

// Debug endpoint to check artisan data
router.get('/check-artisan-data/:artisanId', async (req, res) => {
  try {
    const { artisanId } = req.params;
    
    if (!artisanId) {
      return res.status(400).json({ error: 'Artisan ID is required' });
    }

    console.log(`Debug endpoint - checking data for artisan: ${artisanId}`);

    // Get artisan details
    const artisan = await Employee.findByPk(artisanId);
    
    if (!artisan) {
      return res.status(404).json({ error: 'Artisan not found' });
    }
    
    // Get all products by this artisan (without detailed attributes to avoid any potential issues)
    const productsCount = await ProductEntry.count({
      where: { e_id: artisanId }
    });
    
    // Get total quantity of all products created by the artisan - handle null result
    const totalProductQuantity = await ProductEntry.sum('quantity', {
      where: { e_id: artisanId }
    });
    
    const safeQuantity = totalProductQuantity || 0;

    // Count only approved products
    const approvedProductsCount = await ProductEntry.count({
      where: {
        e_id: artisanId,
        status: 'approved'
      }
    });

    // Construct artisan full name for order queries
    const artisanFullName = `${artisan.firstName} ${artisan.lastName}`.toLowerCase();
    
    // Get assigned orders count
    const assignedOrdersCount = await Order.count({
      where: {
        [Op.or]: [
          { assignedArtisan: { [Op.iLike]: `%${artisanFullName}%` } },
          { assigned_artisan: { [Op.iLike]: `%${artisanFullName}%` } }
        ]
      }
    });

    res.json({
      artisan: {
        id: artisan.e_id,
        name: `${artisan.firstName} ${artisan.lastName}`,
        role: artisan.role
      },
      products: {
        count: productsCount,
        approvedCount: approvedProductsCount,
        totalQuantity: safeQuantity
      },
      orders: {
        assigned: assignedOrdersCount
      },
      status: "Debug endpoint working correctly"
    });
    
  } catch (error) {
    console.error('Error in artisan debug endpoint:', error);
    // Send a more simplified error response to avoid potential circular references
    res.status(500).json({
      error: error.message,
      source: 'artisan debug endpoint'
    });
  }
});

// Add a new debug endpoint to check product trend data
router.get('/check-product-trends/:artisanId', async (req, res) => {
  try {
    const { artisanId } = req.params;
    
    if (!artisanId) {
      return res.status(400).json({ error: 'Artisan ID is required' });
    }

    console.log(`Debug endpoint - checking product trends for artisan: ${artisanId}`);
    
    // Get product trends data to diagnose chart issues
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    
    // Check raw products data first
    const productsRaw = await ProductEntry.findAll({
      where: { 
        e_id: artisanId,
        date_added: {
          [Op.gte]: twelveMonthsAgo
        }
      },
      attributes: ['entry_id', 'product_name', 'quantity', 'date_added'],
      raw: true
    });
    
    // Get the SQL query that would be executed
    const productsQuery = ProductEntry.findAll({
      where: {
        e_id: artisanId,
        date_added: {
          [Op.gte]: twelveMonthsAgo
        }
      },
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date_added')), 'month'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'count']
      ],
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date_added'))],
      raw: true
    });
    
    let sqlQuery = '';
    try {
      sqlQuery = productsQuery.getQueryString();
    } catch (e) {
      sqlQuery = 'Could not get SQL query: ' + e.message;
    }
    
    res.json({
      hasData: productsRaw.length > 0,
      rawProductsCount: productsRaw.length,
      samples: productsRaw.slice(0, 5), // First 5 records for inspection
      sqlQuery: sqlQuery,
      helpMessage: "If no data is shown, try adding some test products for this artisan"
    });
  } catch (error) {
    console.error('Error in product trends debug endpoint:', error);
    res.status(500).json({
      error: error.message,
      source: 'product trends debug endpoint'
    });
  }
});

// Add a debug endpoint to create test products for an artisan
router.post('/create-test-products/:artisanId', async (req, res) => {
  try {
    const { artisanId } = req.params;
    const { count = 5 } = req.body; // Default to 5 products
    
    if (!artisanId) {
      return res.status(400).json({ error: 'Artisan ID is required' });
    }
    
    // Check if artisan exists
    const artisan = await Employee.findByPk(artisanId);
    if (!artisan) {
      return res.status(404).json({ error: 'Artisan not found' });
    }
    
    // Create test products across different months
    const createdProducts = [];
    const currentDate = new Date();
    
    for (let i = 0; i < count; i++) {
      // Create products distributed over the last few months
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - (i % 6)); // Distribute over 6 months
      
      const product = await ProductEntry.create({
        product_id: `TEST${i + 100}`,
        product_name: `Test Product ${i + 1}`,
        description: `Test description for product ${i + 1}`,
        unit_price: 1000 + (i * 100),
        quantity: 10 + (i * 3), // Different quantities
        status: i % 3 === 0 ? 'approved' : 'pending', // Mix of statuses
        e_id: artisanId,
        date_added: date,
        category_id: 1, // Default category
        variation_id: 1, // Default variation
      });
      
      createdProducts.push({
        id: product.entry_id,
        name: product.product_name,
        quantity: product.quantity,
        date: product.date_added
      });
    }
    
    res.json({
      success: true,
      message: `Created ${createdProducts.length} test products for artisan ${artisanId}`,
      products: createdProducts
    });
    
  } catch (error) {
    console.error('Error creating test products:', error);
    res.status(500).json({
      error: error.message,
      source: 'create test products endpoint'
    });
  }
});

// GET /api/artisan-debug/schema/:tableName - Get table schema
router.get('/schema/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    
    // Get column information for the specified table
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = :tableName
    `, {
      replacements: { tableName },
      type: sequelize.QueryTypes.SELECT
    });
    
    return res.json({ 
      table: tableName,
      columns,
      message: 'Schema retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching schema:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch schema', 
      error: error.message 
    });
  }
});

module.exports = router;
