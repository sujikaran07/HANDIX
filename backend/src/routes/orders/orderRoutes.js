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
  cancelOrder
} = require('../../controllers/orders/orderController'); 

const router = express.Router();

router.get('/', getAllOrders);
router.get('/artisans-info', getArtisansWithOrderInfo);
router.get('/customer', getCustomerOrders); 
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.put('/:id', updateOrder); 
router.delete('/:id', deleteOrder);
router.put('/:id/confirm', confirmOrder); // Add the confirm endpoint
router.put('/:id/cancel', cancelOrder);   // Add the cancel endpoint

module.exports = router;
