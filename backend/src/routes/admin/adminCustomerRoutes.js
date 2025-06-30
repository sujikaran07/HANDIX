const express = require('express');
const router = express.Router();
const adminCustomerController = require('../../controllers/admin/adminCustomerController');

// Route for admin to create a new customer
router.post('/customers', adminCustomerController.createCustomer);

module.exports = router;
