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
        { model: ProductImage, as: 'entryImages', attributes: ['image_url'] }, // Correct alias used here
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
    const product = await ProductEntry.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category', attributes: ['category_name'] },
        { model: Inventory, as: 'inventory', attributes: ['product_name', 'description', 'unit_price'] },
        { model: ProductImage, as: 'entryImages', attributes: ['image_url'] }, // Correct alias used here
        { model: ProductVariation, as: 'variation', attributes: ['size', 'additional_price', 'stock_level'] },
      ],
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error); 
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

const createProduct = async (req, res) => {
  try {
    console.log('req.user:', req.user); 
    console.log('Full request body:', req.body);

    const { product_id, product_name, category, price, quantity, size, additional_price, status, customization_available, images, ...rest } = req.body;
    const e_id = req.body.e_id || req.user?.id;

    console.log('e_id retrieved from token or body:', e_id); 
    console.log('Images received:', images);
    
    const isCustomizationAvailable = customization_available === 'Yes' ? true : false;
    console.log('Customization available:', isCustomizationAvailable);

    if (!product_name) return res.status(400).json({ error: 'Product name is required' });
    if (!e_id) return res.status(400).json({ error: 'Employee ID (e_id) is required' });
    if (!price || isNaN(price)) return res.status(400).json({ error: 'Valid unit price is required' });

    let category_id = null;
    
    if (category) {
      const categoryRecord = await Category.findOne({ where: { category_name: category } });
      if (!categoryRecord) return res.status(400).json({ error: `Category "${category}" does not exist` });
      category_id = categoryRecord.category_id;

      categoryRecord.stock_level = (Number(categoryRecord.stock_level) || 0) + Number(quantity);
      await categoryRecord.save();
    }

    let inventoryRecord = await Inventory.findByPk(product_id);
    if (!inventoryRecord) {
      inventoryRecord = await Inventory.create({
        product_id,
        product_name,
        description: rest.description || '',
        unit_price: price,
        quantity: Number(quantity),
        category_id,
        e_id,
        customization_available: isCustomizationAvailable, 
      });
      console.log('Inventory created with product_id:', product_id); 
    } else {

      if (inventoryRecord.customization_available !== isCustomizationAvailable) {
        inventoryRecord.customization_available = isCustomizationAvailable;
        console.log(`Updated customization_available to ${isCustomizationAvailable} in inventory`);
      }
      
      inventoryRecord.quantity = Number(inventoryRecord.quantity) + Number(quantity);
      await inventoryRecord.save();
    }

    const normalizedSize = size || "N/A";
    let variation_id = null;
    
    let existingVariation = await ProductVariation.findOne({
      where: { 
        product_id, 
        size: normalizedSize 
      }
    });

    if (existingVariation) {
      console.log('Found existing variation:', existingVariation.variation_id);
      existingVariation.additional_price = additional_price || existingVariation.additional_price;
      existingVariation.stock_level += Number(quantity);
      await existingVariation.save();
      variation_id = existingVariation.variation_id;
      console.log('Updated existing variation, new stock level:', existingVariation.stock_level);
    } else {
      const newVariation = await ProductVariation.create({
        product_id,
        size: normalizedSize,
        additional_price: additional_price || 0,
        stock_level: Number(quantity)
      });
      variation_id = newVariation.variation_id;
      console.log('Created new variation with ID:', variation_id);
    }

    if (!variation_id) {
      return res.status(400).json({ error: 'Failed to create or retrieve variation_id' });
    }

    const productPayload = {
      product_id,
      product_name,
      unit_price: price,
      quantity: Number(quantity),
      product_status: 'In Stock',
      status: status || 'pending',
      e_id, 
      category_id,
      variation_id,
      customization_available: isCustomizationAvailable,
      ...rest,
    };

    console.log('Final Payload for ProductEntry.create:', productPayload); 

    const productEntry = await ProductEntry.create(productPayload);

    if (images && Array.isArray(images) && images.length > 0) {
      console.log(`Trying to save ${images.length} images for product ${product_id}`);
      
      const imagePromises = images.map(imageUrl => {
        console.log(`Saving image URL: ${imageUrl}`);
        return ProductImage.create({
          product_id: product_id,
          image_url: imageUrl,
          entry_id: productEntry.entry_id
        });
      });
      
      const savedImages = await Promise.all(imagePromises);
      console.log(`Successfully saved ${savedImages.length} images for product ${product_id}`);
    } else {
      console.log('No images provided for this product');
    }

    res.status(201).json({ message: 'Product entry created successfully', productEntry });
  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path;
      res.status(400).json({ 
        error: 'Duplicate entry error', 
        details: `A product with this ${field} already exists.` 
      });
    } else {
      res.status(500).json({ error: 'Failed to create product entry' });
    }
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
      ],
      attributes: ['product_id', 'product_name', 'description', 'unit_price', 'category_id', 'customization_available', 'product_status', 'status'],
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
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
};
