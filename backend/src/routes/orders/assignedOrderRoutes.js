const express = require('express');
const router = express.Router();
const assignedOrderController = require('../../controllers/orders/assignedOrderController');
const { authMiddleware } = require('../../controllers/login/employeeLoginControllers');

// Get all orders assigned to a specific artisan
router.get('/assigned/:artisanId', authMiddleware, assignedOrderController.getAssignedOrders);

// Get details of a specific order
router.get('/:orderId', authMiddleware, assignedOrderController.getOrderDetails);

// Get order items for a specific order
router.get('/:orderId/items', authMiddleware, assignedOrderController.getOrderItems);

// Update the status of an order
router.put('/:orderId/status', authMiddleware, assignedOrderController.updateOrderStatus);

module.exports = router;
