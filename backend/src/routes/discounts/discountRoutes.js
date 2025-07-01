const express = require('express');
const router = express.Router();
const discountController = require('../../controllers/discounts/discountController');

// Route: Get all discounts
router.get('/', discountController.getAllDiscounts);

// Route: Get discount by ID
router.get('/:id', discountController.getDiscountById);

// Route: Get discounts by customer ID
router.get('/customer/:customerId', discountController.getDiscountsByCustomerId);

// Route: Create new discount
router.post('/', discountController.createDiscount);

// Route: Update discount
router.put('/:id', discountController.updateDiscount);

// Route: Delete discount
router.delete('/:id', discountController.deleteDiscount);

module.exports = router;
