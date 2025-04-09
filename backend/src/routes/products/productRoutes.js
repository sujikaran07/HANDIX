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

const injectEId = (req, res, next) => {
  if (req.user && req.user.id) {
    req.body.e_id = req.user.id; 
  }
  next();
};

router.get('/', authMiddleware, getAllProducts); 
router.get('/new-id', authMiddleware, generateNewProductId); 
router.get('/entries', authMiddleware, getAllProductEntries);
router.get('/by-name', authMiddleware, getProductByName); 
router.get('/suggestions', authMiddleware, getProductSuggestions); 
router.get('/:id', authMiddleware, getProductById); 
router.post('/', authMiddleware, injectEId, createProduct); 
router.put('/:id', authMiddleware, updateProduct); 
router.delete('/:id', authMiddleware, deleteProduct); 

module.exports = router;