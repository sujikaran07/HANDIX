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

// Add route to get product entry by entry_id
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
    
    // Get the entry without trying to associate with variation
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
    
    // Fetch the specific variation for this entry
    let entryVariation = null;
    if (entry.variation_id) {
      try {
        entryVariation = await ProductVariation.findByPk(entry.variation_id);
        console.log(`Found specific variation for entry: ${entry.variation_id}`);
      } catch (err) {
        console.error(`Error fetching specific variation for entry: ${err.message}`);
      }
    }
    
    // Also get all variations for this product
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
    entryWithVariations.entryVariation = entryVariation; // Add the specific variation
    entryWithVariations.variations = variations;         // Keep all variations
    
    res.status(200).json(entryWithVariations);
  } catch (error) {
    console.error('Error fetching product entry:', error);
    res.status(500).json({ error: 'Failed to fetch product entry' });
  }
});

module.exports = router;