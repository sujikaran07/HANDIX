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
  getInventorySuggestions,
  uploadProductImages
} = require('../../controllers/products/productController'); 
const { authMiddleware } = require('../../controllers/login/employeeLoginControllers'); 
const { upload } = require('../../utils/cloudinaryConfig');

const router = express.Router();

const injectEId = (req, res, next) => {
  if (req.user && req.user.id) {
    req.body.e_id = req.user.id; 
  }
  next();
};

// Update the image upload route to use Cloudinary
router.post('/images', authMiddleware, upload.array('productImages', 5), uploadProductImages);

router.get('/new-id', authMiddleware, generateNewProductId);
router.get('/entries', authMiddleware, getAllProductEntries);
router.get('/by-name', authMiddleware, getProductByName);
router.get('/suggestions', authMiddleware, getProductSuggestions);
router.get('/inventory-suggestions', authMiddleware, getInventorySuggestions); // Add this new route

router.get('/:id/images', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    const ProductImage = require('../../models/productImageModel');
    
    const images = await ProductImage.findAll({
      where: { product_id: id }
    });
    
    console.log(`Found ${images.length} images for product ${id}`);
    res.status(200).json({ images });
  } catch (error) {
    console.error('Error fetching product images:', error);
    res.status(500).json({ error: 'Failed to fetch product images' });
  }
});

router.get('/:id', authMiddleware, getProductById);
router.post('/', authMiddleware, injectEId, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct); 

module.exports = router;