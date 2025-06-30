const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../controllers/login/employeeLoginControllers');
const { Op } = require('sequelize');
const Inventory = require('../../models/inventoryModel');
const ProductEntry = require('../../models/productEntryModel');
const Category = require('../../models/categoryModel');
const RestockOrder = require('../../models/restockOrderModel');
const ProductImage = require('../../models/productImageModel');

// Route: Get all inventory items (approved products only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const approvedProducts = await ProductEntry.findAll({
      where: { status: 'Approved' },
      attributes: ['product_id']
    });
    
    const approvedProductIds = approvedProducts.map(p => p.product_id);
    
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

// Route: Get public inventory (for frontend)
router.get('/public', async (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5174');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    console.log("Public inventory route accessed");
    
    const inventoryController = require('../../controllers/inventory/inventoryController');
    
    const mockRes = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.responseData = data;
        return this;
      }
    };
    
    await inventoryController.getInventory({}, mockRes);
    
    if (mockRes.statusCode === 200 && mockRes.responseData.inventory) {
      const publicInventory = mockRes.responseData.inventory;
      
      console.log(`Retrieved ${publicInventory.length} items from controller`);
      if (publicInventory.length > 0) {
        const firstItem = publicInventory[0];
        console.log(`First item product_id: ${firstItem.product_id}`);
        console.log(`First item images: ${JSON.stringify(firstItem.images)}`);
      }
      
      res.status(200).json({
        success: true,
        count: publicInventory.length,
        inventory: publicInventory
      });
    } else {
      throw new Error('Failed to retrieve inventory data');
    }
  } catch (error) {
    console.error('Error in public inventory route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory',
      message: error.message
    });
  }
});

// Route: Get inventory suggestions by search term
router.get('/suggestions', authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    
    if (!search) {
      return res.status(200).json({ products: [] });
    }
    
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

// Route: Get inventory item by product ID (public)
router.get('/product/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    const inventoryItem = await Inventory.findOne({
      where: { product_id: productId }
    });

    if (!inventoryItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found in inventory' 
      });
    }

    res.status(200).json({
      success: true,
      product_id: productId,
      product_name: inventoryItem.product_name,
      product_price: inventoryItem.price,
      stock_quantity: inventoryItem.stock_quantity || inventoryItem.quantity
    });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching inventory item',
      error: error.message
    });
  }
});

// Route: Get inventory item by product ID (protected)
router.get('/:productId', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const inventoryItem = await Inventory.findOne({
      where: { product_id: productId },
      include: [
        { 
          model: Category, 
          as: 'category',
          attributes: ['category_id', 'category_name']
        }
      ]
    });

    if (!inventoryItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found in inventory' 
      });
    }

    const productImages = await ProductImage.findAll({
      where: { product_id: productId }
    });

    const formattedInventory = {
      ...inventoryItem.toJSON(),
      images: productImages.map(img => img.image_url)
    };

    res.status(200).json({
      success: true,
      inventory: formattedInventory
    });
  } catch (error) {
    console.error('Error fetching inventory details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching inventory details',
      error: error.message
    });
  }
});

// Route: Get product images by product ID
router.get('/:productId/images', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const ProductImage = require('../../models/productImageModel');
    const images = await ProductImage.findAll({
      where: { product_id: productId }
    });
    
    res.status(200).json({
      success: true,
      images
    });
  } catch (error) {
    console.error('Error fetching product images:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product images',
      error: error.message
    });
  }
});

// Route: Get product variations by product ID
router.get('/:productId/variations', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const ProductVariation = require('../../models/productVariationModel');
    const variations = await ProductVariation.findAll({
      where: { product_id: productId }
    });
    
    res.status(200).json({
      success: true,
      variations
    });
  } catch (error) {
    console.error('Error fetching product variations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product variations',
      error: error.message
    });
  }
});

// Route: Disable a product in inventory
router.put('/:productId/disable', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(`Attempting to disable product: ${productId}`);
    
    const inventoryItem = await Inventory.findOne({
      where: { product_id: productId }
    });

    if (!inventoryItem) {
      console.log(`Product ${productId} not found`);
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found in inventory' 
      });
    }

    console.log(`Found product ${productId}, current status: ${inventoryItem.product_status}`);

    await inventoryItem.update({
      product_status: 'Disabled'
    });

    console.log(`Successfully disabled product ${productId}`);
    res.status(200).json({
      success: true,
      message: 'Product disabled successfully',
      product_id: productId,
      product_status: 'Disabled'
    });
  } catch (error) {
    console.error(`Error disabling product ${req.params.productId}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Error disabling product: ' + (error.message || 'Unknown error'),
      error: error.message
    });
  }
});

// Route: Enable a product in inventory
router.put('/:productId/enable', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(`Attempting to enable product: ${productId}`);
    
    const inventoryItem = await Inventory.findOne({
      where: { product_id: productId }
    });

    if (!inventoryItem) {
      console.log(`Product ${productId} not found`);
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found in inventory' 
      });
    }

    console.log(`Found product ${productId}, current status: ${inventoryItem.product_status}, quantity: ${inventoryItem.quantity}`);

    let newStatus = 'In Stock';
    if (inventoryItem.quantity === 0) {
      newStatus = 'Out of Stock';
    } else if (inventoryItem.quantity < 10) {
      newStatus = 'Low Stock';
    }

    await inventoryItem.update({
      product_status: newStatus
    });

    console.log(`Successfully enabled product ${productId} with status: ${newStatus}`);
    res.status(200).json({
      success: true,
      message: 'Product enabled successfully',
      product_id: productId,
      product_status: newStatus
    });
  } catch (error) {
    console.error(`Error enabling product ${req.params.productId}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Error enabling product: ' + (error.message || 'Unknown error'),
      error: error.message
    });
  }
});

// Route: Restock a product (immediate)
router.put('/:productId/restock', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, artisan_id, due_date, notes } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity provided'
      });
    }

    if (!artisan_id) {
      return res.status(400).json({
        success: false,
        message: 'Artisan assignment is required'
      });
    }

    if (!due_date) {
      return res.status(400).json({
        success: false,
        message: 'Due date is required'
      });
    }

    const inventoryItem = await Inventory.findOne({
      where: { product_id: productId }
    });

    if (!inventoryItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found in inventory' 
      });
    }

    const newQuantity = inventoryItem.quantity + parseInt(quantity);
    const newStatus = newQuantity > 0 ? 'In Stock' : 'Out of Stock';

    await inventoryItem.update({
      quantity: newQuantity,
      product_status: newStatus
    });

    const restockOrder = await RestockOrder.create({
      product_id: productId,
      quantity: parseInt(quantity),
      artisan_id: artisan_id,
      due_date: new Date(due_date),
      notes: notes,
      status: 'Assigned',
      created_at: new Date(),
      updated_at: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Product restocked successfully',
      newQuantity,
      newStatus,
      restockOrder: restockOrder.id
    });
  } catch (error) {
    console.error('Error restocking product:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error restocking product',
      error: error.message
    });
  }
});

// Route: Submit a restock request for a product
router.post('/:productId/restock-request', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, artisan_id, due_date, notes } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity provided'
      });
    }

    if (!artisan_id) {
      return res.status(400).json({
        success: false,
        message: 'Artisan assignment is required'
      });
    }

    if (!due_date) {
      return res.status(400).json({
        success: false,
        message: 'Due date is required'
      });
    }

    const inventoryItem = await Inventory.findOne({
      where: { product_id: productId }
    });

    if (!inventoryItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found in inventory' 
      });
    }

    const restockOrder = await RestockOrder.create({
      product_id: productId,
      quantity: parseInt(quantity),
      artisan_id: artisan_id,
      due_date: new Date(due_date),
      notes: notes || '',
      status: 'Assigned', 
      created_at: new Date(),
      updated_at: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Restock request submitted successfully',
      requestId: restockOrder.id
    });
  } catch (error) {
    console.error('Error creating restock request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating restock request: ' + error.message,
      error: error.message
    });
  }
});

// Route: Get restock orders for a product
router.get('/:productId/restock-orders', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const restockOrders = await RestockOrder.findAll({
      where: { product_id: productId },
      order: [['created_at', 'DESC']]
    });

    const { Employee } = require('../../models/employeeModel');
    const artisanIds = [...new Set(restockOrders.map(order => order.artisan_id))];
    
    const artisans = await Employee.findAll({
      where: { eId: artisanIds },
      attributes: ['eId', 'firstName', 'lastName']
    });
    
    const ordersWithArtisanNames = restockOrders.map(order => {
      const artisan = artisans.find(a => a.eId === order.artisan_id);
      return {
        ...order.dataValues,
        artisan_name: artisan ? `${artisan.firstName} ${artisan.lastName}` : 'Unknown'
      };
    });
    
    res.status(200).json({
      success: true,
      orders: ordersWithArtisanNames
    });
  } catch (error) {
    console.error('Error fetching restock orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching restock orders',
      error: error.message
    });
  }
});

// Route: Cancel a restock order for a product
router.put('/:productId/cancel-restock', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const restockOrder = await RestockOrder.findOne({
      where: { 
        product_id: productId,
        status: { [Op.in]: ['Assigned', 'Pending'] }
      },
      order: [['created_at', 'DESC']]
    });

    if (!restockOrder) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active restock order found for this product' 
      });
    }

    await restockOrder.update({
      status: 'Cancelled',
      updated_at: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Restock order canceled successfully',
      order_id: restockOrder.id
    });
  } catch (error) {
    console.error('Error canceling restock order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error canceling restock order',
      error: error.message
    });
  }
});

module.exports = router;