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
} = require('../../controllers/products/productController'); 
const { authMiddleware } = require('../../controllers/login/employeeLoginControllers'); 

const router = express.Router();


router.get('/', authMiddleware, getAllProducts); 
router.get('/new-id', authMiddleware, generateNewProductId); 
router.get('/entries', authMiddleware, getAllProductEntries);
router.get('/by-name', authMiddleware, getProductByName); 
router.get('/suggestions', authMiddleware, getProductSuggestions); 
router.get('/:id', authMiddleware, getProductById); 
router.post('/', authMiddleware, createProduct); 
router.put('/:id', authMiddleware, updateProduct); 
router.delete('/:id', authMiddleware, deleteProduct); 

module.exports = router;