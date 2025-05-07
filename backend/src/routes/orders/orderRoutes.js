const express = require('express');
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getArtisansWithOrderInfo,
  getCustomerOrders // Add this import
} = require('../../controllers/orders/orderController'); 

const router = express.Router();

router.get('/', getAllOrders);
router.get('/artisans-info', getArtisansWithOrderInfo);
router.get('/customer', getCustomerOrders); // Add this new route - no middleware
router.get('/:id', getOrderById);
router.post('/', createOrder); 
router.put('/:id', updateOrder); 
router.delete('/:id', deleteOrder); 

module.exports = router;
