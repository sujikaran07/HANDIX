const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../controllers/login/employeeLoginControllers');
const { Op } = require('sequelize');
const Inventory = require('../../models/inventoryModel');
const ProductEntry = require('../../models/productEntryModel');
const Category = require('../../models/categoryModel');

// Get all inventory items (filter to only show approved products)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // First, get IDs of approved products
    const approvedProducts = await ProductEntry.findAll({
      where: { status: 'Approved' },
      attributes: ['product_id']
    });
    
    const approvedProductIds = approvedProducts.map(p => p.product_id);
    
    // Now get inventory records for only approved products with quantity > 0
    const inventory = await Inventory.findAll({
      where: {
        product_id: { [Op.in]: approvedProductIds },
        quantity: { [Op.gt]: 0 }
      },
      include: [{ model: Category, as: 'category' }],
      order: [['updatedAt', 'DESC']]
    });
    
    res.status(200).json({ inventory });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Get inventory suggestions (only for approved products)
router.get('/suggestions', authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    
    if (!search) {
      return res.status(200).json({ products: [] });
    }
    
    // Get only approved products for suggestions
    const approvedProducts = await ProductEntry.findAll({
      where: { 
        status: 'Approved',
        product_name: { [Op.iLike]: `%${search}%` }
      },
      attributes: ['product_id']
    });
    
    const approvedProductIds = approvedProducts.map(p => p.product_id);
    
    if (approvedProductIds.length === 0) {
      return res.status(200).json({ products: [] });
    }
    
    // Fetch inventory suggestions for these approved products
    const products = await Inventory.findAll({
      where: {
        product_id: { [Op.in]: approvedProductIds },
        product_name: { [Op.iLike]: `%${search}%` }
      },
      attributes: ['product_id', 'product_name'],
      limit: 10
    });
    
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching inventory suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch inventory suggestions' });
  }
});

module.exports = router;
