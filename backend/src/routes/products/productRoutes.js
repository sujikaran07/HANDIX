const express = require('express');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, generateNewProductId, getAllProductEntries, getProductByName, getProductSuggestions } = require('../../controllers/products/productController'); // Include getAllProductEntries
const { authMiddleware } = require('../../controllers/login/employeeLoginControllers'); // Import authMiddleware

const router = express.Router();

router.get('/', authMiddleware, getAllProducts); // Protect the route with authMiddleware
router.get('/new-id', generateNewProductId); // Route to generate a new product ID
router.get('/entries', authMiddleware, getAllProductEntries); // Add route to fetch product entries
router.get('/by-name', authMiddleware, getProductByName); // Add route for fetching product by name
router.get('/suggestions', authMiddleware, getProductSuggestions); // Add route for product suggestions
router.get('/:id', getProductById); // Ensure this route is correctly mapped
router.post('/', authMiddleware, createProduct); // Protect the route with authMiddleware
router.put('/:id', updateProduct); // Update a product by ID
router.delete('/:id', deleteProduct); // Delete a product by ID

module.exports = router;
