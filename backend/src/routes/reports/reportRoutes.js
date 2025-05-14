const express = require('express');
const router = express.Router();
const { sequelize } = require('../../config/db');
const { QueryTypes } = require('sequelize');
const Category = require('../../models/categoryModel');

// Generate mock data for reports when tables are missing
function generateMockData(reportType) {
  switch(reportType) {
    case 'sales':
      return {
        summary: {
          totalSales: 45850,
          orderCount: 86,
          averageOrderValue: 533.14
        },
        data: [
          { order_id: 1, order_date: '2023-05-01', total_amount: 1250, quantity: 2, product_name: 'Hand-woven Basket', category_name: 'Handicrafts', customer_name: 'John Smith' },
          { order_id: 2, order_date: '2023-05-02', total_amount: 980, quantity: 1, product_name: 'Ceramic Pot', category_name: 'Pottery', customer_name: 'Mary Johnson' },
          { order_id: 3, order_date: '2023-05-03', total_amount: 1540, quantity: 3, product_name: 'Handmade Rug', category_name: 'Textiles', customer_name: 'David Williams' }
        ]
      };
    case 'products':
      return {
        summary: {
          totalProducts: 42,
          productsOutOfStock: 5,
          productsLowStock: 8
        },
        data: [
          { product_id: 1, product_name: 'Hand-woven Basket', stock_level: 15, category_name: 'Handicrafts', order_count: 25, total_sold: 25, total_revenue: 12500 },
          { product_id: 2, product_name: 'Ceramic Pot', stock_level: 8, category_name: 'Pottery', order_count: 14, total_sold: 14, total_revenue: 9800 },
          { product_id: 3, product_name: 'Handmade Rug', stock_level: 0, category_name: 'Textiles', order_count: 19, total_sold: 19, total_revenue: 7600 }
        ]
      };
    case 'customers':
      return {
        summary: {
          totalCustomers: 152,
          newCustomers: 24,
          returningCustomers: 63
        },
        data: [
          { c_id: 1, customer_name: 'John Smith', email: 'john@example.com', order_count: 5, total_spent: 2680, last_order_date: '2023-05-12' },
          { c_id: 2, customer_name: 'Mary Johnson', email: 'mary@example.com', order_count: 3, total_spent: 1250, last_order_date: '2023-05-10' },
          { c_id: 3, customer_name: 'David Williams', email: 'david@example.com', order_count: 7, total_spent: 3540, last_order_date: '2023-05-13' }
        ]
      };
    case 'artisans':
      return {
        summary: {
          totalArtisans: 28,
          activeArtisans: 22,
          topPerformer: 'John Craftsman'
        },
        data: [
          { e_id: 1, artisan_name: 'John Craftsman', product_count: 12, order_count: 38, total_sales: 15800, avg_product_value: 415.79 },
          { e_id: 2, artisan_name: 'Sarah Weaver', product_count: 8, order_count: 24, total_sales: 11200, avg_product_value: 466.67 },
          { e_id: 3, artisan_name: 'Michael Potter', product_count: 10, order_count: 19, total_sales: 9600, avg_product_value: 505.26 }
        ]
      };
    default:
      return { summary: {}, data: [] };
  }
}

// Get sales report data
router.post('/sales', async (req, res) => {
  try {
    console.log("Generating mock sales report data");
    const mockData = generateMockData('sales');
    return res.json({
      success: true,
      ...mockData,
      isMockData: true
    });
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate sales report', 
      error: error.message 
    });
  }
});

// Get product report data
router.post('/products', async (req, res) => {
  try {
    console.log("Generating mock product report data");
    const mockData = generateMockData('products');
    return res.json({
      success: true,
      ...mockData,
      isMockData: true
    });
  } catch (error) {
    console.error('Error generating product report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate product report', 
      error: error.message 
    });
  }
});

// Get customer report data
router.post('/customers', async (req, res) => {
  try {
    console.log("Generating mock customer report data");
    const mockData = generateMockData('customers');
    return res.json({
      success: true,
      ...mockData,
      isMockData: true
    });
  } catch (error) {
    console.error('Error generating customer report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate customer report', 
      error: error.message 
    });
  }
});

// Get artisan report data
router.post('/artisans', async (req, res) => {
  try {
    console.log("Generating mock artisan report data");
    const mockData = generateMockData('artisans');
    return res.json({
      success: true,
      ...mockData,
      isMockData: true
    });
  } catch (error) {
    console.error('Error generating artisan report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate artisan report', 
      error: error.message 
    });
  }
});

// Get report metadata (categories, regions, etc.)
router.get('/metadata', async (req, res) => {
  try {
    console.log("Providing mock metadata for reports");
    // Return mock data for metadata
    res.json({
      success: true,
      categories: [
        { id: 1, name: 'Handicrafts' },
        { id: 2, name: 'Pottery' },
        { id: 3, name: 'Textiles' },
        { id: 4, name: 'Woodwork' },
        { id: 5, name: 'Jewelry' }
      ],
      regions: ['Colombo', 'Kandy', 'Galle', 'Vavuniya', 'Jaffna'],
      isMockData: true
    });
  } catch (error) {
    console.error('Error fetching report metadata:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch report metadata', 
      error: error.message 
    });
  }
});

module.exports = router;
