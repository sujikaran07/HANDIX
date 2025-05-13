const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/category/categoryController');
const transactionController = require('../../controllers/admin/transactionController');
const { upload } = require('../../utils/cloudinaryConfig');

// Category routes - ensure 'category_image' matches the frontend's FormData field name
router.get('/categories', categoryController.getAllCategories);
router.post('/categories', upload.single('category_image'), categoryController.createCategory);
router.put('/categories/:id', upload.single('category_image'), categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// Transaction routes
router.get('/transactions', transactionController.getAllTransactions);
router.get('/transactions/:id', transactionController.getTransactionById);
router.post('/transactions/:id/refund', transactionController.processRefund);

module.exports = router;
