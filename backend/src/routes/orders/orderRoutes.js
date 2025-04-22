const express = require('express');
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} = require('../../controllers/orders/orderController'); 

const router = express.Router();

router.get('/', getAllOrders); 
router.get('/:id', getOrderById); 
router.post('/', createOrder); 
router.put('/:id', updateOrder); 
router.delete('/:id', deleteOrder); 

module.exports = router;
