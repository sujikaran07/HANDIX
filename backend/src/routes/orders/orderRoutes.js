const express = require('express');
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getArtisansWithOrderInfo,
  getCustomerOrders,
  confirmOrder,
  cancelOrder,
  getAssignableOrders,  // Import the function
  getSimpleCustomerOrders // Import the new simple function
} = require('../../controllers/orders/orderController'); 

const router = express.Router();

router.get('/', getAllOrders);
router.get('/artisans-info', getArtisansWithOrderInfo);
router.get('/customer', getCustomerOrders); 
router.get('/assignable', getAssignableOrders);  // Add the new route
router.get('/simple-customer', getSimpleCustomerOrders); // Move this above parameterized routes
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.put('/:id', updateOrder); 
router.delete('/:id', deleteOrder);
router.put('/:id/confirm', confirmOrder); 
router.put('/:id/cancel', cancelOrder);   

module.exports = router;
