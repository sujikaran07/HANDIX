const express = require('express');
const router = express.Router();
const discountController = require('../../controllers/discounts/discountController');

// Get all discounts
router.get('/', discountController.getAllDiscounts);

// Get discount by ID
router.get('/:id', discountController.getDiscountById);

// Get discounts by customer ID
router.get('/customer/:customerId', discountController.getDiscountsByCustomerId);

// Create new discount
router.post('/', discountController.createDiscount);

// Update discount
router.put('/:id', discountController.updateDiscount);

// Delete discount
router.delete('/:id', discountController.deleteDiscount);

module.exports = router;
