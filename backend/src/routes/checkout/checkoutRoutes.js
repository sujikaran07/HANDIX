const express = require('express');
const router = express.Router();
const checkoutController = require('../../controllers/checkoutController');

// Route to save shipping address
router.post('/shipping-address', checkoutController.saveShippingAddress);

// Route to save billing address
router.post('/billing-address', checkoutController.saveBillingAddress);

// Route to get customer's addresses
router.get('/customer/:customerId/addresses', checkoutController.getCustomerAddresses);

// Route to place a new order
router.post('/place-order', checkoutController.placeOrder);

// Route to get order details by order ID
router.get('/order/:orderId', checkoutController.getOrderById);

// Route to update payment status
router.put('/order/:orderId/payment', checkoutController.updatePaymentStatus);

module.exports = router;
