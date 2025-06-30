const ProductEntry = require('../../models/productEntryModel'); 
const Category = require('../../models/categoryModel');
const Inventory = require('../../models/inventoryModel');
const ProductVariation = require('../../models/productVariationModel');
const ProductImage = require('../../models/productImageModel');
const { Op } = require('sequelize');
const { cloudinary } = require('../../utils/cloudinaryConfig');

// Get all products for an employee
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
        { model: ProductVariation, as: 'variations', attributes: ['additional_price', 'stock_level'] },
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

// Get product by ID with category, inventory, images, and variations
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
        attributes: [ 'additional_price', 'stock_level']
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

// Create a new product entry, inventory, and variation
const createProduct = async (req, res) => {
  try {
    console.log('Request received for product creation:', req.body);

    const {
      product_id,
      product_name,
      description,
      category,
      price,
      quantity,

      additional_price,
      customization_available,
      product_status,
      e_id
    } = req.body;

    if (!product_id) return res.status(400).json({ error: 'Product ID is required' });
    if (!product_name) return res.status(400).json({ error: 'Product name is required' });
    if (!e_id) return res.status(400).json({ error: 'Employee ID is required' });
    if (!price || isNaN(Number(price))) return res.status(400).json({ error: 'Valid price is required' });
    if (!quantity || isNaN(Number(quantity))) return res.status(400).json({ error: 'Valid quantity is required' });
    
    console.log('All required fields validated');
    

    let category_id = null;
    if (category) {
      const categoryRecord = await Category.findOne({ where: { category_name: category } });
      if (!categoryRecord) {
        return res.status(400).json({ error: `Category "${category}" does not exist` });
      }
      category_id = categoryRecord.category_id;
      console.log(`Category found: ${category} (ID: ${category_id})`);
    }
    
    console.log('Creating temporary inventory record with zero quantity');
    let inventoryRecord = await Inventory.findOne({ where: { product_id } });
    
    if (!inventoryRecord) {
      inventoryRecord = await Inventory.create({
        product_id,
        product_name,
        description: description || '',
        unit_price: Number(price),
        quantity: 0, 
        category_id,
        e_id,
        customization_available: customization_available === 'Yes'
      });
      console.log('New inventory record created with zero quantity:', inventoryRecord.product_id);
    }
    
    console.log('Creating product variation');
    const variation_name = req.body.variation_name || `${req.body.product_name} - Default`; 
    const variationRecord = await ProductVariation.create({
      product_id,
      variation_name: variation_name, 
      additional_price: Number(additional_price || 0),
      stock_level: Number(quantity)
    });
    console.log('New variation created with ID:', variationRecord.variation_id);
    
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

// Update a product entry and related inventory/variation/category
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    console.log('Updating product entry with ID:', id);
    console.log('Update data received:', updatedData);

    const productEntry = await ProductEntry.findByPk(id);
    if (!productEntry) {
      return res.status(404).json({ error: 'Product entry not found' });
    }
    
  
    if (productEntry.status === 'Approved') {
      return res.status(403).json({ error: 'Approved products cannot be modified' });
    }

  
    const originalVariation = productEntry.variation_name || 'Standard'; // Changed from 'size'
    const newVariation = updatedData.variation_name || 'Standard'; // Changed from 'size'

    let newVariationRecord = null;
    if (originalVariation !== newVariation) {
      console.log(`Variation is changing from ${originalVariation} to ${newVariation}`);
      
      newVariationRecord = await ProductVariation.findOne({
        where: { 
          product_id: productEntry.product_id,
          variation_name: newVariation // Changed from 'size'
        }
      });
      
      if (!newVariationRecord) {
        newVariationRecord = await ProductVariation.create({
          product_id: productEntry.product_id,
          variation_name: newVariation, // Changed from 'size'
          additional_price: updatedData.additional_price || 0,
          stock_level: updatedData.quantity
        });
        console.log(`Created new variation with ID ${newVariationRecord.variation_id} for variation ${newVariation}`);
      } else {
        await newVariationRecord.update({
          additional_price: updatedData.additional_price || newVariationRecord.additional_price,
          stock_level: newVariationRecord.stock_level + updatedData.quantity
        });
        console.log(`Updated existing variation (${newVariationRecord.variation_id}) for variation ${newVariation}`);
      }
    }
    
    await productEntry.update({
      product_name: updatedData.product_name,
      description: updatedData.description,
      unit_price: updatedData.unit_price,
      quantity: updatedData.quantity,
      product_status: updatedData.product_status,
      customization_available: updatedData.customization_available,
      
      variation_id: newVariationRecord ? newVariationRecord.variation_id : productEntry.variation_id
    });
    
    console.log(`Updated product entry with variation_id: ${productEntry.variation_id}`);
    

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
    

    if (originalVariation !== newVariation) {
      const oldVariationRecord = await ProductVariation.findOne({
        where: { 
          product_id: productEntry.product_id,
          variation_name: originalVariation // Changed from 'size'
        }
      });
      
      if (oldVariationRecord) {

        const newStockLevel = Math.max(0, oldVariationRecord.stock_level - productEntry.quantity);
        await oldVariationRecord.update({ stock_level: newStockLevel });
        console.log(`Reduced stock for original variation ${originalVariation} to ${newStockLevel}`);
      }
    }
    
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

// Delete a product entry and update inventory/variations/category/images
const deleteProduct = async (req, res) => {
  try {
    const productEntry = await ProductEntry.findByPk(req.params.id);

    if (!productEntry) {
      return res.status(404).json({ error: 'Product entry not found' });
    }

    if (productEntry.status === 'Approved') {
      return res.status(403).json({ error: 'Approved products cannot be deleted' });
    }

    console.log(`Deleting product entry ID: ${productEntry.entry_id}, product ID: ${productEntry.product_id}`);
    const productId = productEntry.product_id;
    const quantityToRemove = productEntry.quantity;

    const inventoryRecord = await Inventory.findOne({ 
      where: { product_id: productId }
    });
    
    if (inventoryRecord) {
      console.log(`Reducing inventory quantity by ${quantityToRemove} units`);
      const newQuantity = Math.max(0, inventoryRecord.quantity - quantityToRemove);
      await inventoryRecord.update({ quantity: newQuantity });
      console.log(`Updated inventory quantity: ${newQuantity}`);
    }

    const variations = await ProductVariation.findAll({
      where: { product_id: productId },
    });

    if (variations.length > 0) {
      console.log(`Updating stock levels for ${variations.length} variations`);
      for (const variation of variations) {
        const newStockLevel = Math.max(0, variation.stock_level - quantityToRemove); 
        await variation.update({ stock_level: newStockLevel });
        console.log(`Updated variation (${variation.variation_name}) stock level: ${newStockLevel}`);
      }
    }


    if (productEntry.category_id) {
      try {
        const categoryRecord = await Category.findByPk(productEntry.category_id);
        if (categoryRecord) {
          console.log(`Checking category ID ${productEntry.category_id} for stock level field`);
          
   
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

    try {
      const productImages = await ProductImage.findAll({
        where: { entry_id: productEntry.entry_id }
      });
      
      console.log(`Found ${productImages.length} images associated with this entry`);
      
      for (const image of productImages) {

        if (image.cloudinary_id) {
          try {
            await cloudinary.uploader.destroy(image.cloudinary_id);
            console.log(`Deleted image from Cloudinary: ${image.cloudinary_id}`);
          } catch (cloudinaryError) {
            console.error('Error deleting image from Cloudinary:', cloudinaryError);
          }
        }

        await image.destroy();
      }
    } catch (imageError) {
      console.error('Error handling product images during deletion:', imageError);
    }

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

// Get product suggestions by name (for autocomplete)
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

// Get inventory suggestions by name (for autocomplete)
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

// Generate a new product ID (auto-increment)
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

// Get all product entries for an employee
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

// Get product by name with category, images, and variations
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
        attributes: ['variation_name', 'additional_price', 'stock_level']
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

// Upload product images to Cloudinary and save records
const uploadProductImages = async (req, res) => {
  try {
    console.log('Image upload request received');
   
    if (!req.body.product_id) {
      return res.status(400).json({ error: 'Product ID is required for image upload' });
    }
   
    if (!req.files || !req.files.length) {
      return res.status(400).json({ error: 'No image files provided' });
    }
    
    const productId = req.body.product_id;
    const entryId = req.body.entry_id || null;
    const uploadedImages = [];
    
    for (const file of req.files) {
      try {
        console.log(`Processing file: ${file.originalname}, size: ${file.size} bytes`);
        
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'handix_products',
          use_filename: true,
          unique_filename: true,
        });
        
        console.log('Cloudinary upload result:', result);
    
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

// Update product entry status and update inventory/category if approved
const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`Updating product status for entry ID ${id} to ${status}`);
 
    if (!['Approved', 'Rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    const productEntry = await ProductEntry.findByPk(id);
    if (!productEntry) {
      return res.status(404).json({ error: 'Product entry not found' });
    }
    
    const oldStatus = productEntry.status;
  
    await productEntry.update({ status });
    
    
    if (oldStatus !== 'Approved' && status === 'Approved') {
      console.log('Status changed to Approved, updating inventory and category');
      
      let inventoryRecord = await Inventory.findOne({ where: { product_id: productEntry.product_id } });
      
      if (inventoryRecord) {
       
        await inventoryRecord.update({
          product_name: productEntry.product_name,
          description: productEntry.description || inventoryRecord.description,
          unit_price: productEntry.unit_price,
          quantity: inventoryRecord.quantity + productEntry.quantity,
          customization_available: productEntry.customization_available
        });
        console.log('Updated existing inventory record with actual quantity');
      }
    
      if (productEntry.category_id) {
        try {
          const categoryRecord = await Category.findByPk(productEntry.category_id);
          if (categoryRecord && typeof categoryRecord.stock_level !== 'undefined') {
            console.log(`Updating category stock level by adding ${productEntry.quantity} units`);
            await categoryRecord.update({
              stock_level: (categoryRecord.stock_level || 0) + productEntry.quantity
            });
            console.log(`Updated category stock level to ${categoryRecord.stock_level}`);
          }
        } catch (categoryError) {
          console.error('Error updating category stock level:', categoryError);
        }
      }
    }
    
    res.status(200).json({
      message: `Product status updated to ${status}`,
      productEntry
    });
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({
      error: 'Failed to update product status',
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
  uploadProductImages,
  updateProductStatus 
};
