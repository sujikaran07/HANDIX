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
  uploadProductImages,
  updateProductStatus 
} = require('../../controllers/products/productController'); 
const { authMiddleware } = require('../../controllers/login/employeeLoginControllers'); 
const { upload } = require('../../utils/cloudinaryConfig');

const router = express.Router();

// Middleware: Inject employee ID into request body
const injectEId = (req, res, next) => {
  if (req.user && req.user.id) {
    req.body.e_id = req.user.id; 
  }
  next();
};

// Route: Upload product images
router.post('/images', authMiddleware, upload.array('productImages', 5), uploadProductImages);

// Route: Generate new product ID
router.get('/new-id', authMiddleware, generateNewProductId);

// Route: Get all product entries for employee
router.get('/entries', authMiddleware, getAllProductEntries);

// Route: Get product by name
router.get('/by-name', authMiddleware, getProductByName);

// Route: Get product suggestions
router.get('/suggestions', authMiddleware, getProductSuggestions);

// Route: Get inventory suggestions
router.get('/inventory-suggestions', authMiddleware, getInventorySuggestions); // Add this new route

// Route: Get product images by product ID
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

// Route: Get product by ID
router.get('/:id', authMiddleware, getProductById);

// Route: Create new product
router.post('/', authMiddleware, injectEId, createProduct);

// Route: Update product
router.put('/:id', authMiddleware, updateProduct);

// Route: Delete product
router.delete('/:id', authMiddleware, deleteProduct); 

// Route: Get product entry by entryId with variations
router.get('/entry/:entryId', authMiddleware, async (req, res) => {
  try {
    const { entryId } = req.params;
    
    if (!entryId) {
      return res.status(400).json({ error: 'Entry ID is required' });
    }
    
    const ProductEntry = require('../../models/productEntryModel');
    const Category = require('../../models/categoryModel');
    const Inventory = require('../../models/inventoryModel');
    const ProductImage = require('../../models/productImageModel');
    const ProductVariation = require('../../models/productVariationModel');
    
    const entry = await ProductEntry.findByPk(entryId, {
      include: [
        { model: Category, as: 'category', attributes: ['category_name'] },
        { model: Inventory, as: 'inventory', attributes: ['product_name', 'description', 'unit_price'] },
        { model: ProductImage, as: 'entryImages', attributes: ['image_url'] }
      ],
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'Product entry not found' });
    }
    
    let entryVariation = null;
    if (entry.variation_id) {
      try {
        entryVariation = await ProductVariation.findByPk(entry.variation_id);
        console.log(`Found specific variation for entry: ${entry.variation_id}`);
      } catch (err) {
        console.error(`Error fetching specific variation for entry: ${err.message}`);
      }
    }
    
    let variations = [];
    try {
      variations = await ProductVariation.findAll({
        where: { product_id: entry.product_id },
        attributes: ['variation_id', 'size', 'additional_price', 'stock_level']
      });
    } catch (variationError) {
      console.error('Error fetching variations:', variationError);
    }
    
    const entryWithVariations = entry.toJSON();
    entryWithVariations.entryVariation = entryVariation; 
    entryWithVariations.variations = variations;         
    
    res.status(200).json(entryWithVariations);
  } catch (error) {
    console.error('Error fetching product entry:', error);
    res.status(500).json({ error: 'Failed to fetch product entry' });
  }
});

// Route: Update product status
router.put('/:id/status', authMiddleware, updateProductStatus);

module.exports = router;