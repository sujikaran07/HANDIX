const express = require('express');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  generateNewProductId,
  getAllProductEntries,
  getProductByName,
  getProductSuggestions,
} = require('../../controllers/products/productController'); // Ensure all functions are correctly imported
const { authMiddleware } = require('../../controllers/login/employeeLoginControllers'); // Import authMiddleware

const router = express.Router();

// Define routes
router.get('/', authMiddleware, getAllProducts); // Ensure getAllProducts is defined
router.get('/new-id', generateNewProductId); // Ensure generateNewProductId is defined
router.get('/entries', authMiddleware, getAllProductEntries); // Ensure getAllProductEntries is defined
router.get('/by-name', authMiddleware, getProductByName); // Ensure getProductByName is defined
router.get('/suggestions', authMiddleware, getProductSuggestions); // Ensure getProductSuggestions is defined
router.get('/:id', authMiddleware, getProductById); // Ensure getProductById is defined
router.post('/', authMiddleware, createProduct); // Ensure createProduct is defined
router.put('/:id', authMiddleware, updateProduct); // Ensure updateProduct is defined
router.delete('/:id', authMiddleware, deleteProduct); // Ensure deleteProduct is defined

module.exports = router;
