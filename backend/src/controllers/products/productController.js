const ProductEntry = require('../../models/productEntryModel'); 
const Category = require('../../models/categoryModel');
const Inventory = require('../../models/inventoryModel');
const ProductVariation = require('../../models/productVariationModel');
const ProductImage = require('../../models/productImageModel');
const { Op } = require('sequelize');

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

    const productEntry = await ProductEntry.findByPk(id);
    if (!productEntry) {
      return res.status(404).json({ error: 'Product entry not found' });
    }

    await productEntry.update(updatedData);
    res.status(200).json({ message: 'Product entry updated successfully', productEntry });
  } catch (error) {
    console.error('Error updating product entry:', error); 
    res.status(500).json({ error: 'Failed to update product entry' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productEntry = await ProductEntry.findByPk(req.params.id);

    if (!productEntry) {
      return res.status(404).json({ error: 'Product entry not found' });
    }

    const variations = await ProductVariation.findAll({
      where: { product_id: productEntry.product_id },
    });

    for (const variation of variations) {
      variation.stock_level = Math.max(0, variation.stock_level - productEntry.quantity); 
      await variation.save();
    }

    await productEntry.destroy();

    res.status(200).json({ message: 'Product entry deleted successfully and stock count updated' });
  } catch (error) {
    console.error('Error deleting product entry:', error); 
    res.status(500).json({ error: 'Failed to delete product entry' });
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
};
