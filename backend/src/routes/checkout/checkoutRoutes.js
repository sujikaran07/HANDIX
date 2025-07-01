const express = require('express');
const router = express.Router();
const checkoutController = require('../../controllers/checkout/checkoutController');

// Route: Save shipping address
router.post('/shipping-address', checkoutController.saveShippingAddress);

// Route: Save billing address
router.post('/billing-address', checkoutController.saveBillingAddress);

// Route: Get all addresses for a customer
router.get('/customer/:customerId/addresses', checkoutController.getCustomerAddresses);

// Route: Place a new order
router.post('/place-order', checkoutController.placeOrder);

// Route: Get order details by orderId
router.get('/order/:orderId', checkoutController.getOrderById);

// Route: Update payment status for an order
router.put('/order/:orderId/payment', checkoutController.updatePaymentStatus);

module.exports = router;
