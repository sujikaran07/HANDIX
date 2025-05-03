const express = require('express');
const router = express.Router();
const adminCustomerController = require('../../controllers/admin/adminCustomerController');
// Add middleware for admin authentication if required

// Admin customer management routes
router.post('/customers', adminCustomerController.createCustomer);
// Add more routes as needed

module.exports = router;
