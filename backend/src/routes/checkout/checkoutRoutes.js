const express = require('express');
const router = express.Router();
const checkoutController = require('../../controllers/checkout/checkoutController');

router.post('/shipping-address', checkoutController.saveShippingAddress);
router.post('/billing-address', checkoutController.saveBillingAddress);
router.get('/customer/:customerId/addresses', checkoutController.getCustomerAddresses);
router.post('/place-order', checkoutController.placeOrder);
router.get('/order/:orderId', checkoutController.getOrderById);
router.put('/order/:orderId/payment', checkoutController.updatePaymentStatus);

module.exports = router;
