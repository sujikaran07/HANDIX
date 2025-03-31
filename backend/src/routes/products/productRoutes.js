const express = require('express');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../../controllers/products/productController');

const router = express.Router();

router.get('/', getAllProducts); // Fetch all products
router.get('/:id', getProductById); // Ensure this route is correctly mapped
router.post('/', createProduct); // Create a new product
router.put('/:id', updateProduct); // Update a product by ID
router.delete('/:id', deleteProduct); // Delete a product by ID

module.exports = router;
