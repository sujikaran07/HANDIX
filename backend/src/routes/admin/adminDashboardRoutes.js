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

// Get sales trend data
router.get('/sales-trend', async (req, res) => {
  try {
    console.log('Fetching sales trend data...');
    const salesData = await Transaction.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('transaction_date')), 'date'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
      ],
      where: {
        transactionStatus: 'completed',
        transactionDate: {
          [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 30))
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('transaction_date'))],
      order: [[sequelize.fn('DATE', sequelize.col('transaction_date')), 'ASC']]
    });
    console.log('Sales trend data:', salesData);
    res.json(salesData);
  } catch (error) {
    console.error('Error in sales trend:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard summary data
router.get('/summary', async (req, res) => {
  try {
    console.log('Fetching dashboard summary data...');
    
    // Total Revenue
    const totalRevenue = await Transaction.sum('amount', {
      where: {
        transactionStatus: 'completed',
        transactionDate: {
          [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 30))
        }
      }
    });
    console.log('Total Revenue:', totalRevenue);

    // Total Orders
    const totalOrders = await Order.count({
      where: {
        orderDate: {
          [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 30))
        }
      }
    });
    console.log('Total Orders:', totalOrders);

    // Active Customers
    const activeCustomers = await Customer.count({
      where: {
        accountStatus: 'Approved',
        registrationDate: {
          [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 30))
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