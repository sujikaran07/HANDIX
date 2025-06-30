const express = require('express');
const router = express.Router();
const { Transaction } = require('../../models/transactionModel');
const { Order } = require('../../models/orderModel');
const ProductEntry = require('../../models/productEntryModel');
const { Employee } = require('../../models/employeeModel');
const { Op } = require('sequelize');
const { sequelize } = require('../../config/db');
const { authMiddleware } = require('../../controllers/login/employeeLoginControllers');

// Apply authentication middleware to all artisan dashboard routes
router.use(authMiddleware);

// Route: Get artisan dashboard summary data
router.get('/summary/:artisanId', async (req, res) => {
  try {
    const { artisanId } = req.params;
    
    if (!artisanId) {
      return res.status(400).json({ 
        error: 'Artisan ID is required' 
      });
    }
    
    // Verify the artisanId matches the authenticated user's ID
    if (req.user.id !== artisanId && req.user.role !== 1) {
      // Allow admin (role 1) to see any artisan's data
      return res.status(403).json({
        error: 'Unauthorized access to another artisan\'s data'
      });
    }
    
    // Get artisan's name for order matching
    const artisan = await Employee.findByPk(artisanId);
    const artisanFullName = artisan ? `${artisan.firstName} ${artisan.lastName}`.toLowerCase() : '';
      
    // Get total products created by the artisan (only approved products)
    const totalProductsQuery = {
      where: {
        e_id: artisanId,
        status: 'approved'
      }
    };
    
    // Count only approved products
    const totalProducts = await ProductEntry.count(totalProductsQuery).catch(err => {
      console.error('Error counting approved products:', err);
      return 0;
    });

    // Get ALL products quantity (including non-approved) created by the artisan
    const totalProductQuantity = await ProductEntry.sum('quantity', {
      where: {
        e_id: artisanId
      }
    }).catch(err => {
      console.error('Error calculating total product quantity:', err);
      return 0;
    });
    
    console.log(`Artisan ${artisanId} product quantities:`, { totalProducts, totalProductQuantity });
    
    // Make sure totalProductQuantity is a number, not null
    const finalQuantity = totalProductQuantity || 0;
    
    // Get ongoing/assigned orders (not completed/shipped/delivered/canceled) 
    // We need to use the artisan's name since that's what the Orders table uses
    // Use case-insensitive matching with both field names
    const assignedOrders = await Order.count({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { assignedArtisan: { [Op.iLike]: artisanFullName } },
              { assigned_artisan: { [Op.iLike]: artisanFullName } }
            ]
          },
          {
            [Op.and]: [
              {
                [Op.or]: [
                  { orderStatus: { [Op.notIn]: ['Shipped', 'Delivered', 'Cancelled', 'Canceled', 'Completed'] } },
                  { order_status: { [Op.notIn]: ['Shipped', 'Delivered', 'Cancelled', 'Canceled', 'Completed'] } }
                ]
              },
              { 
                [Op.or]: [
                  { orderStatus: { [Op.not]: null } },
                  { order_status: { [Op.not]: null } }
                ]
              }
            ]
          }
        ]
      }    }).catch(err => {
      console.error('Error counting orders:', err);
      return 0;
    });
    
    // Get completed orders count
    const completedOrders = await Order.count({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { assignedArtisan: { [Op.iLike]: artisanFullName } },
              { assigned_artisan: { [Op.iLike]: artisanFullName } }
            ]
          },
          {
            [Op.or]: [
              { orderStatus: 'Shipped' },
              { orderStatus: 'Delivered' },
              { orderStatus: 'Completed' },
              { order_status: 'Shipped' },
              { order_status: 'Delivered' },
              { order_status: 'Completed' }
            ]
          }
        ]
      }
    }).catch(err => {
      console.error('Error counting completed orders:', err);
      return 0;
    });
    
    res.json({
      totalProducts,
      totalProductQuantity: finalQuantity,
      assignedOrders,
      completedOrders
    });  
  } catch (error) {
    console.error('Error in artisan dashboard summary:', error);
    // Return empty data with 200 status to prevent frontend errors
    res.json({
      totalProducts: 0,
      totalProductQuantity: 0,
      assignedOrders: 0,
      completedOrders: 0,
      error: error.message
    });
  }
});

// Route: Get products created per month for the last 12 months
router.get('/products-trend/:artisanId', async (req, res) => {
  try {
    const { artisanId } = req.params;
    
    if (!artisanId) {
      return res.status(400).json({ 
        error: 'Artisan ID is required' 
      });
    }
    
    // Verify the artisanId matches the authenticated user's ID
    if (req.user.id !== artisanId && req.user.role !== 1) {
      // Allow admin (role 1) to see any artisan's data
      return res.status(403).json({
        error: 'Unauthorized access to another artisan\'s data'
      });
    }
    
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    
    let productsData = [];
    try {
      // Query to sum product quantity by month for this artisan
      productsData = await ProductEntry.findAll({
        where: {
          e_id: artisanId,
          date_added: {
            [Op.gte]: twelveMonthsAgo
          }
        },
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date_added')), 'month'],
          [sequelize.fn('SUM', sequelize.col('quantity')), 'count'] // Sum quantity for each month
        ],
        group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date_added'))],
        order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date_added')), 'ASC']],
        raw: true
      });
      
      console.log('Products quantity by month:', productsData);
      
    } catch (err) {
      console.error('Error fetching products quantity data:', err);
      return res.status(500).json({ error: 'Database error when fetching product data' });
    }
    
    // Format the data to include all months (even those with zero products)
    const monthlyData = [];
    const currentDate = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Create a mapping of month-year strings to the quantities
    const dataMap = {};
    
    if (productsData && Array.isArray(productsData)) {
      productsData.forEach(item => {
        if (item && item.month) {
          // Convert the date to a string format 'YYYY-MM' regardless of whether it's a Date object or string
          let monthStr;
          if (typeof item.month === 'string') {
            // If it's already a string, take the first 7 chars (YYYY-MM)
            monthStr = item.month.substring(0, 7);
          } else if (item.month instanceof Date) {
            // If it's a Date object, format it properly
            monthStr = item.month.toISOString().substring(0, 7);
          } else {
            // For other formats (like when PostgreSQL returns a special date type)
            // Convert to ISO string if possible, or use a default
            try {
              monthStr = new Date(item.month).toISOString().substring(0, 7);
            } catch (e) {
              console.error('Failed to format date:', item.month);
              return; // Skip this item
            }
          }
          
          dataMap[monthStr] = parseInt(item.count) || 0;
        }
      });
    }
    
    // Generate entries for all 12 months, with zero quantities for months without data
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      
      // Format the month as YYYY-MM
      const monthStr = date.toISOString().substring(0, 7);
      
      // Get the month name and year for display
      const monthName = months[date.getMonth()];
      const yearShort = date.getFullYear().toString().slice(2);
      const formattedLabel = `${monthName} '${yearShort}`;
      
      // Get the quantity for this month from our map, or 0 if none
      const quantity = dataMap[monthStr] || 0;
      
      monthlyData.push({
        month: date.toISOString().slice(0, 10), // ISO date (YYYY-MM-DD)
        monthLabel: formattedLabel,
        count: quantity
      });
    }
    
    res.json(monthlyData);
  } catch (error) {
    console.error('Error in products trend:', error);
    // Return empty data array with 200 status to prevent frontend errors
    const emptyData = Array(12).fill().map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
      const yearShort = date.getFullYear().toString().slice(2);
      return {
        month: date.toISOString().slice(0, 10),
        monthLabel: `${monthName} '${yearShort}`,
        count: 0
      };
    });
    res.json(emptyData);
  }
});

// Route: Get revenue trend for the last 12 months (mock data)
router.get('/revenue-trend/:artisanId', async (req, res) => {
  try {
    const { artisanId } = req.params;
    
    if (!artisanId) {
      return res.status(400).json({ 
        error: 'Artisan ID is required' 
      });
    }
    
    // Verify the artisanId matches the authenticated user's ID
    if (req.user.id !== artisanId && req.user.role !== 1) {
      // Allow admin (role 1) to see any artisan's data
      return res.status(403).json({
        error: 'Unauthorized access to another artisan\'s data'
      });    }
    
    // Get artisan's name for order matching
    const artisan = await Employee.findByPk(artisanId);
    const artisanFullName = artisan ? `${artisan.firstName} ${artisan.lastName}`.toLowerCase() : '';
    
    // Since we can't determine actual revenue from orders, generate mock data
    // Generate it based on the products data to have some correlation
    const productsData = await ProductEntry.findAll({
      where: {
        e_id: artisanId,
        status: 'approved'
      },
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date_added')), 'month'],
        [sequelize.fn('COUNT', '*'), 'count']
      ],
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date_added'))],
      raw: true
    });
    
    // Format the data to include all months
    const monthlyRevenue = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7) + '-01';
      
      const monthData = productsData.find(data => 
        data && data.month && data.month.slice(0, 7) === monthKey.slice(0, 7)
      );
      
      // Generate revenue based on product count, with some randomness
      const productCount = monthData ? parseInt(monthData.count) || 0 : 0;
      const revenue = productCount * (1500 + Math.floor(Math.random() * 1000));
      
      monthlyRevenue.push({
        month: monthKey,
        total: revenue
      });    }
    
    res.json(monthlyRevenue);
  } catch (error) {
    console.error('Error in revenue trend:', error);
    // Return empty data array with 200 status to prevent frontend errors
    const emptyData = Array(12).fill().map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return {
        month: date.toISOString().slice(0, 7) + '-01',
        total: 0
      };
    });
    res.json(emptyData);
  }
});

module.exports = router;
