const express = require('express');
const router = express.Router();
const adminCustomerController = require('../../controllers/admin/adminCustomerController');

router.post('/customers', adminCustomerController.createCustomer);

module.exports = router;
