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
} = require('../../controllers/products/productController'); 
const { authMiddleware } = require('../../controllers/login/employeeLoginControllers'); 

const router = express.Router();

const injectEId = (req, res, next) => {
  if (req.user && req.user.id) {
    req.body.e_id = req.user.id; 
  }
  next();
};

// Enhance the image upload route
router.post('/images', authMiddleware, async (req, res) => {
  try {
    console.log('Image upload request received');
    console.log('Request body:', req.body);
    console.log('Files present:', req.files ? 'Yes' : 'No');
    
    if (req.files && req.files.productImages) {
      const ProductImage = require('../../models/productImageModel');
      const uploadedFiles = Array.isArray(req.files.productImages) 
        ? req.files.productImages 
        : [req.files.productImages];
      
      console.log(`Processing ${uploadedFiles.length} image files`);
      console.log('Product ID:', req.body.product_id);
      console.log('Entry ID:', req.body.entry_id);
      
      if (!req.body.product_id) {
        return res.status(400).json({ error: 'Product ID is required for image upload' });
      }
      
      // Save each image
      const results = [];
      for (const file of uploadedFiles) {
        console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
        
        try {
          const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
          const filePath = `/uploads/${filename}`;
          
          await file.mv(`./public${filePath}`);
          console.log(`File saved to: ./public${filePath}`);
          
          const imageUrl = `http://localhost:5000${filePath}`;
          
          const productImage = await ProductImage.create({
            product_id: req.body.product_id,
            image_url: imageUrl,
            entry_id: req.body.entry_id || null
          });
          
          console.log(`Image record created: ${productImage.id}`);
          results.push(productImage);
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
        }
      }
      
      console.log(`Successfully uploaded ${results.length} images`);
      res.status(201).json({ message: 'Images uploaded successfully', images: results });
    } else {
      console.log('No image files found in request');
      return res.status(400).json({ error: 'No image files provided' });
    }
  } catch (error) {
    console.error('Error in image upload endpoint:', error);
    res.status(500).json({ error: 'Failed to upload image', details: error.message });
  }
});

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