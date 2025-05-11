const express = require('express');
const { 
  getAllArtisans, 
  getArtisanById, 
  getArtisanWorkload, 
  assignOrderToArtisan
} = require('../../controllers/artisan/artisanController');
const { getAssignableOrders } = require('../../controllers/orders/orderController');

const router = express.Router();

// Get all artisans
router.get('/', getAllArtisans);

// Get orders that can be assigned to artisans
router.get('/assignable-orders', getAssignableOrders);

// Get specific artisan by ID
router.get('/:id', getArtisanById);

// Get workload information for a specific artisan
router.get('/:id/workload', getArtisanWorkload);

// Assign an order to an artisan
router.put('/assign-order/:orderId', assignOrderToArtisan);

module.exports = router;
