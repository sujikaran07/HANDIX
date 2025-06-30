const express = require('express');
const router = express.Router();
const { Transaction } = require('../../models/transactionModel');
const { Order } = require('../../models/orderModel');
const { Customer } = require('../../models/customerModel');
const ProductEntry = require('../../models/productEntryModel');
const Category = require('../../models/categoryModel');
const { Op } = require('sequelize');
const { sequelize } = require('../../config/db');
const { QueryTypes } = require('sequelize');

// Route: Get sales trend data for dashboard
router.get('/sales-trend', async (req, res) => {
  try {
    console.log('Fetching sales trend data (Delivered Orders)...');
    const salesData = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('order_date')), 'date'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_amount']
      ],
      where: {
        orderStatus: 'Delivered',
        orderDate: {
          [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 30))
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('order_date'))],
      order: [[sequelize.fn('DATE', sequelize.col('order_date')), 'ASC']]
    });
    console.log('Sales trend data (Delivered Orders):', salesData);
    res.json(salesData);
  } catch (error) {
    console.error('Error in sales trend:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route: Get dashboard summary data (revenue, orders, customers)
router.get('/summary', async (req, res) => {
  try {
    console.log('Fetching dashboard summary data...');
    
    // Total Revenue (from Orders with status Delivered in last 30 days)
    const totalRevenue = await Order.sum('totalAmount', {
      where: {
        orderStatus: 'Delivered',
        orderDate: {
          [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 30))
        }
      }
    });
    console.log('Total Revenue (Delivered Orders):', totalRevenue);

    // Total Orders
    const totalOrders = await Order.count({
      where: {
        orderDate: {
          [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 30))
        }
      }
    });
    console.log('Total Orders:', totalOrders);

    // Active Customers (customers who made a purchase in the last 30 days)
    const activeCustomers = await Customer.count({
      where: {
        accountStatus: 'Approved',
        c_id: {
          [Op.in]: sequelize.literal(`(SELECT DISTINCT c_id FROM "Orders" WHERE order_date >= NOW() - INTERVAL '30 days')`)
        }
      }
    });
    console.log('Active Customers:', activeCustomers);

    // Check transaction statuses
    const transactionStatuses = await Transaction.findAll({
      attributes: [
        'transactionStatus',
        [sequelize.fn('COUNT', sequelize.col('transaction_id')), 'count']
      ],
      group: ['transactionStatus']
    });
    console.log('Transaction Statuses:', transactionStatuses);

    res.json({
      totalRevenue: totalRevenue || 0,
      totalOrders: totalOrders || 0,
      activeCustomers: activeCustomers || 0
    });
  } catch (error) {
    console.error('Error in dashboard summary:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;