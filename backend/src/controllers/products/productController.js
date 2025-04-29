const ProductEntry = require('../../models/productEntryModel'); 
const Category = require('../../models/categoryModel');
const Inventory = require('../../models/inventoryModel');
const ProductVariation = require('../../models/productVariationModel');
const ProductImage = require('../../models/productImageModel');
const { Op } = require('sequelize');
const { cloudinary } = require('../../utils/cloudinaryConfig');

const getAllProducts = async (req, res) => {
  try {
    const { id: e_id } = req.user;

    if (!e_id) {
      return res.status(400).json({ error: 'Employee ID (e_id) is required' });
    }

    const products = await ProductEntry.findAll({
      where: { e_id: String(e_id) },
      include: [
        { model: Category, as: 'category', attributes: ['category_name'] },
        { model: Inventory, as: 'inventory', attributes: ['product_name', 'description', 'unit_price'] },
        { model: ProductImage, as: 'entryImages', attributes: ['image_url'] }, 
        { model: ProductVariation, as: 'variations', attributes: ['size', 'additional_price', 'stock_level'] },
      ],
      attributes: ['product_id', 'product_name', 'unit_price', 'quantity', 'product_status', 'status', 'date_added'],
    });

    if (!products || products.length === 0) {
      return res.status(200).json({ message: 'No products available', products: [] });
    }

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error); 
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await ProductEntry.findOne({
      where: { 
        product_id: req.params.id 
      },
      include: [
        { model: Category, as: 'category', attributes: ['category_name'] },
        { model: Inventory, as: 'inventory', attributes: ['product_name', 'description', 'unit_price'] },
        { model: ProductImage, as: 'entryImages', attributes: ['image_url'] }
      ],
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let variations = [];
    try {
      variations = await ProductVariation.findAll({
        where: { product_id: product.product_id },
        attributes: ['size', 'additional_price', 'stock_level']
      });
    } catch (variationError) {
      console.error('Error fetching variations:', variationError);
    }

    const productWithVariations = product.toJSON();
    productWithVariations.variations = variations;

    res.status(200).json(productWithVariations);
  } catch (error) {
    console.error('Error fetching product:', error); 
    res.status(500).json({ error: 'Failed to fetch product', details: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    // Log the request body
    console.log('Request received for product creation:', req.body);
    
    // Destructure the request body
    const {
      product_id,
      product_name,
      description,
      category,
      price,
      quantity,
      size,
      additional_price,
      customization_available,
      product_status,
      e_id
    } = req.body;
    
    // Basic validation
    if (!product_id) return res.status(400).json({ error: 'Product ID is required' });
    if (!product_name) return res.status(400).json({ error: 'Product name is required' });
    if (!e_id) return res.status(400).json({ error: 'Employee ID is required' });
    if (!price || isNaN(Number(price))) return res.status(400).json({ error: 'Valid price is required' });
    if (!quantity || isNaN(Number(quantity))) return res.status(400).json({ error: 'Valid quantity is required' });
    
    console.log('All required fields validated');
    
    // Step 1: Handle category
    let category_id = null;
    if (category) {
      const categoryRecord = await Category.findOne({ where: { category_name: category } });
      if (!categoryRecord) {
        return res.status(400).json({ error: `Category "${category}" does not exist` });
      }
      category_id = categoryRecord.category_id;
      console.log(`Category found: ${category} (ID: ${category_id})`);
    }
    
    // Step 2: Create inventory record
    console.log('Creating inventory record');
    let inventoryRecord = await Inventory.findOne({ where: { product_id } });
    
    if (!inventoryRecord) {
      inventoryRecord = await Inventory.create({
        product_id,
        product_name,
        description: description || '',
        unit_price: Number(price),
        quantity: Number(quantity),
        category_id,
        e_id,
        customization_available: customization_available === 'Yes'
      });
      console.log('New inventory record created:', inventoryRecord.product_id);
    } else {
      console.log('Existing inventory record found, updating');
      await inventoryRecord.update({
        product_name,
        description: description || inventoryRecord.description,
        unit_price: Number(price),
        quantity: inventoryRecord.quantity + Number(quantity),
        customization_available: customization_available === 'Yes'
      });
    }
    
    // Step 3: Create variation
    console.log('Creating product variation');
    const normalizedSize = size || 'N/A';
    let variationRecord = await ProductVariation.findOne({
      where: { product_id, size: normalizedSize }
    });
    
    if (!variationRecord) {
      variationRecord = await ProductVariation.create({
        product_id,
        size: normalizedSize,
        additional_price: Number(additional_price || 0),
        stock_level: Number(quantity)
      });
      console.log('New variation created with ID:', variationRecord.variation_id);
    } else {
      console.log('Existing variation found, updating');
      await variationRecord.update({
        additional_price: Number(additional_price || variationRecord.additional_price),
        stock_level: variationRecord.stock_level + Number(quantity)
      });
    }
    
    // Step 4: Create product entry
    console.log('Creating product entry');
    const productEntry = await ProductEntry.create({
      product_id,
      product_name,
      unit_price: Number(price),
      quantity: Number(quantity),
      product_status: product_status || 'In Stock',
      status: 'pending',
      e_id,
      category_id,
      variation_id: variationRecord.variation_id,
      customization_available: customization_available === 'Yes',
      description: description || ''
    });
    
    console.log('Product entry created successfully:', productEntry.entry_id);
    
    res.status(201).json({ 
      message: 'Product created successfully',
      productEntry 
    });
  } catch (error) {
    console.error('Error in createProduct:', error);
    res.status(500).json({ 
      error: 'Failed to create product',
      details: error.message
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    console.log('Updating product entry with ID:', id);
    console.log('Update data received:', updatedData);

    // 1. Find the product entry
    const productEntry = await ProductEntry.findByPk(id);
    if (!productEntry) {
      return res.status(404).json({ error: 'Product entry not found' });
    }
    
    // Check if the product is approved - prevent updates
    if (productEntry.status === 'Approved') {
      return res.status(403).json({ error: 'Approved products cannot be modified' });
    }

    // Store the original size for comparison
    const originalSize = productEntry.size || 'N/A';
    const newSize = updatedData.size || 'N/A';
    
    // 2. Update the product entry
    await productEntry.update({
      product_name: updatedData.product_name,
      description: updatedData.description,
      unit_price: updatedData.unit_price,
      quantity: updatedData.quantity,
      product_status: updatedData.product_status,
      customization_available: updatedData.customization_available,
      size: newSize  // Add this line to update the size field
    });
    
    console.log(`Updated product size from ${originalSize} to ${newSize}`);
    
    // 3. Update the corresponding inventory record
    const inventoryRecord = await Inventory.findOne({ 
      where: { product_id: productEntry.product_id } 
    });
    
    if (inventoryRecord) {
      await inventoryRecord.update({
        product_name: updatedData.product_name,
        description: updatedData.description,
        unit_price: updatedData.unit_price,
        customization_available: updatedData.customization_available
      });
      console.log('Updated inventory record');
    }
    
    // 4. Update category if changed
    if (updatedData.category) {
      const categoryRecord = await Category.findOne({ 
        where: { category_name: updatedData.category } 
      });
      
      if (categoryRecord && categoryRecord.category_id !== productEntry.category_id) {
        productEntry.category_id = categoryRecord.category_id;
        await productEntry.save();
        console.log('Updated category to:', updatedData.category);
      }
    }
    
    // 5. Update variation if applicable
    const variationToUpdate = await ProductVariation.findOne({
      where: { 
        product_id: productEntry.product_id,
        size: newSize
      }
    });
    
    const oldVariation = newSize !== originalSize ? await ProductVariation.findOne({
      where: { 
        product_id: productEntry.product_id,
        size: originalSize
      }
    }) : null;
    
    if (variationToUpdate) {
      // Update existing variation for this size
      await variationToUpdate.update({
        additional_price: updatedData.additional_price || 0,
        stock_level: variationToUpdate.stock_level + updatedData.quantity
      });
      console.log(`Updated existing variation for size ${newSize}`);
      
      // If size changed, reduce quantity from old size variation
      if (oldVariation && newSize !== originalSize) {
        const newStockLevel = Math.max(0, oldVariation.stock_level - productEntry.quantity);
        await oldVariation.update({ stock_level: newStockLevel });
        console.log(`Reduced stock for original size ${originalSize} to ${newStockLevel}`);
      }
    } else {
      // Create a new variation if it doesn't exist
      await ProductVariation.create({
        product_id: productEntry.product_id,
        size: newSize,
        additional_price: updatedData.additional_price || 0,
        stock_level: updatedData.quantity
      });
      console.log(`Created new variation for size ${newSize} with stock ${updatedData.quantity}`);
      
      // If size changed, reduce quantity from old variation
      if (oldVariation && newSize !== originalSize) {
        const newStockLevel = Math.max(0, oldVariation.stock_level - productEntry.quantity);
        await oldVariation.update({ stock_level: newStockLevel });
        console.log(`Reduced stock for original size ${originalSize} to ${newStockLevel}`);
      }
    }
    
    // Fetch the updated product with all relations for the response
    const updatedProductEntry = await ProductEntry.findByPk(id, {
      include: [
        { model: Category, as: 'category', attributes: ['category_name'] },
        { model: Inventory, as: 'inventory', attributes: ['product_name', 'description', 'unit_price'] },
        { model: ProductImage, as: 'entryImages', attributes: ['image_url'] }
      ]
    });
    
    console.log('Product updated successfully');
    res.status(200).json({ 
      message: 'Product entry updated successfully', 
      productEntry: updatedProductEntry 
    });
  } catch (error) {
    console.error('Error updating product entry:', error); 
    res.status(500).json({ 
      error: 'Failed to update product entry',
      details: error.message
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productEntry = await ProductEntry.findByPk(req.params.id);

    if (!productEntry) {
      return res.status(404).json({ error: 'Product entry not found' });
    }

    // Check if the product is approved - prevent deletion
    if (productEntry.status === 'Approved') {
      return res.status(403).json({ error: 'Approved products cannot be deleted' });
    }

    console.log(`Deleting product entry ID: ${productEntry.entry_id}, product ID: ${productEntry.product_id}`);
    const productId = productEntry.product_id;
    const quantityToRemove = productEntry.quantity;

    // 1. Update inventory quantity
    const inventoryRecord = await Inventory.findOne({ 
      where: { product_id: productId }
    });
    
    if (inventoryRecord) {
      console.log(`Reducing inventory quantity by ${quantityToRemove} units`);
      const newQuantity = Math.max(0, inventoryRecord.quantity - quantityToRemove);
      await inventoryRecord.update({ quantity: newQuantity });
      console.log(`Updated inventory quantity: ${newQuantity}`);
    }

    // 2. Update product variations stock levels
    const variations = await ProductVariation.findAll({
      where: { product_id: productId },
    });

    if (variations.length > 0) {
      console.log(`Updating stock levels for ${variations.length} variations`);
      for (const variation of variations) {
        const newStockLevel = Math.max(0, variation.stock_level - quantityToRemove); 
        await variation.update({ stock_level: newStockLevel });
        console.log(`Updated variation (${variation.size}) stock level: ${newStockLevel}`);
      }
    }

    // 3. Update category stock level if applicable
    if (productEntry.category_id) {
      try {
        const categoryRecord = await Category.findByPk(productEntry.category_id);
        if (categoryRecord) {
          console.log(`Checking category ID ${productEntry.category_id} for stock level field`);
          
          // Check if category has stock_level field
          if (typeof categoryRecord.stock_level !== 'undefined') {
            console.log(`Reducing category stock level by ${quantityToRemove} units`);
            const newStockLevel = Math.max(0, categoryRecord.stock_level - quantityToRemove);
            await categoryRecord.update({ stock_level: newStockLevel });
            console.log(`Updated category stock level to ${newStockLevel}`);
          } else {
            console.log(`Category does not have a stock_level field`);
          }
        }
      } catch (categoryError) {
        console.error('Error updating category stock level:', categoryError);
      }
    }

    // 4. Delete product images associated with this entry
    try {
      const productImages = await ProductImage.findAll({
        where: { entry_id: productEntry.entry_id }
      });
      
      console.log(`Found ${productImages.length} images associated with this entry`);
      
      for (const image of productImages) {
        // If using Cloudinary, delete the image from cloud storage
        if (image.cloudinary_id) {
          try {
            await cloudinary.uploader.destroy(image.cloudinary_id);
            console.log(`Deleted image from Cloudinary: ${image.cloudinary_id}`);
          } catch (cloudinaryError) {
            console.error('Error deleting image from Cloudinary:', cloudinaryError);
          }
        }
        
        // Delete the image record
        await image.destroy();
      }
    } catch (imageError) {
      console.error('Error handling product images during deletion:', imageError);
    }

    // 5. Finally delete the product entry
    await productEntry.destroy();
    console.log('Product entry successfully deleted');

    res.status(200).json({ 
      message: 'Product entry deleted successfully',
      details: 'Associated inventory quantities, variations, and category stock have been updated'
    });
  } catch (error) {
    console.error('Error deleting product entry:', error); 
    res.status(500).json({ error: 'Failed to delete product entry', details: error.message });
  }
};

const getProductSuggestions = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    const products = await ProductEntry.findAll({
      where: {
        product_name: {
          [Op.iLike]: `%${search}%`,
        },
      },
      attributes: ['product_id', 'product_name'],
    });

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching product suggestions:', error); 
    res.status(500).json({ error: 'Failed to fetch product suggestions' });
  }
};

const getInventorySuggestions = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(200).json({ products: [] });
    }

    const products = await Inventory.findAll({
      where: {
        product_name: {
          [Op.iLike]: `%${search}%`,
        },
      },
      attributes: ['product_id', 'product_name'],
      limit: 10
    });

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching inventory suggestions:', error); 
    res.status(500).json({ error: 'Failed to fetch inventory suggestions' });
  }
};

const generateNewProductId = async (req, res) => {
  try {
    const lastProduct = await ProductEntry.findOne({
      order: [['product_id', 'DESC']],
    });

    let newProductId = 'P001';
    if (lastProduct) {
      const lastIdNumber = parseInt(lastProduct.product_id.substring(1));
      newProductId = `P${String(lastIdNumber + 1).padStart(3, '0')}`;
    }

    res.status(200).json({ product_id: newProductId });
  } catch (error) {
    console.error('Error generating new product ID:', error); 
    res.status(500).json({ error: 'Failed to generate new product ID' });
  }
};

const getAllProductEntries = async (req, res) => {
  try {
    const { id: e_id } = req.user;

    if (!e_id) {
      console.error('Employee ID (e_id) is missing');
      return res.status(400).json({ error: 'Employee ID (e_id) is required' });
    }

    console.log(`Fetching all product entries for e_id: ${e_id}`);

    const entries = await ProductEntry.findAll({
      where: { e_id: String(e_id) },
      include: [
        { model: Category, as: 'category', attributes: ['category_name'] },
        {
          model: Inventory,
          as: 'inventory',
          attributes: ['product_name', 'description', 'unit_price'],
        },
        {
          model: ProductImage,
          as: 'entryImages',
          attributes: ['image_url'],
          required: false,
        },
      ],
      attributes: [
        'entry_id',
        'product_id',
        'product_name',
        'unit_price',
        'quantity',
        'product_status',
        'status',
        'date_added',
      ],
      order: [['date_added', 'DESC']], 
    });

    console.log(`Total entries fetched: ${entries.length}`);

    res.status(200).json({ entries });
  } catch (error) {
    console.error('Error fetching product entries:', error.message);
    res.status(500).json({ error: 'Failed to fetch product entries', details: error.message });
  }
};

const getProductByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    const product = await ProductEntry.findOne({
      where: {
        product_name: {
          [Op.iLike]: name, 
        },
      },
      include: [
        { model: Category, as: 'category', attributes: ['category_name'] },
        { model: ProductImage, as: 'entryImages', attributes: ['image_url'] }
      ],
      attributes: ['product_id', 'product_name', 'description', 'unit_price', 'category_id', 'customization_available', 'product_status', 'status'],
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let variations = [];
    try {
      variations = await ProductVariation.findAll({
        where: { product_id: product.product_id },
        attributes: ['size', 'additional_price', 'stock_level']
      });
    } catch (variationError) {
      console.error('Error fetching variations:', variationError);
    }

    const productWithVariations = product.toJSON();
    productWithVariations.variations = variations;

    res.status(200).json(productWithVariations);
  } catch (error) {
    console.error('Error fetching product by name:', error); 
    res.status(500).json({ error: 'Failed to fetch product by name' });
  }
};

// Add a new function to handle product image uploads to Cloudinary
const uploadProductImages = async (req, res) => {
  try {
    console.log('Image upload request received');
    
    // Check if product_id is provided
    if (!req.body.product_id) {
      return res.status(400).json({ error: 'Product ID is required for image upload' });
    }
    
    // Check if files are uploaded
    if (!req.files || !req.files.length) {
      return res.status(400).json({ error: 'No image files provided' });
    }
    
    const productId = req.body.product_id;
    const entryId = req.body.entry_id || null;
    const uploadedImages = [];
    
    // Process each file
    for (const file of req.files) {
      try {
        console.log(`Processing file: ${file.originalname}, size: ${file.size} bytes`);
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'handix_products',
          use_filename: true,
          unique_filename: true,
        });
        
        console.log('Cloudinary upload result:', result);
        
        // Save image URL to database
        const productImage = await ProductImage.create({
          product_id: productId,
          image_url: result.secure_url,
          cloudinary_id: result.public_id,
          entry_id: entryId
        });
        
        uploadedImages.push({
          id: productImage.id,
          image_url: result.secure_url,
          cloudinary_id: result.public_id
        });
        
        console.log(`Image record created: ${productImage.id}`);
      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
      }
    }
    
    console.log(`Successfully uploaded ${uploadedImages.length} images`);
    res.status(201).json({ 
      message: 'Images uploaded successfully', 
      images: uploadedImages 
    });
    
  } catch (error) {
    console.error('Error in image upload endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to upload images', 
      details: error.message 
    });
  }
};

module.exports = {
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
};
