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
      where: { e_id: `${e_id}` }, // Ensure e_id is treated as a string
      include: [
        { model: Category, as: 'category', attributes: ['category_name'] },
        { model: Inventory, as: 'inventory', attributes: ['product_name', 'description', 'unit_price'] },
        { model: ProductImage, as: 'images', attributes: ['image_url'] },
        { model: ProductVariation, as: 'variations', attributes: ['size', 'additional_price', 'stock_level'] },
      ],
      attributes: ['product_id', 'product_name', 'unit_price', 'quantity', 'product_status', 'status', 'date_added'],
    });

    if (!products || products.length === 0) {
      return res.status(200).json({ message: 'No products available', products: [] });
    }

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await ProductEntry.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category', attributes: ['category_name'] },
        { model: Inventory, as: 'inventory', attributes: ['product_name', 'description', 'unit_price'] },
        { model: ProductImage, as: 'images', attributes: ['image_url'] },
        { model: ProductVariation, as: 'variations', attributes: ['size', 'additional_price', 'stock_level'] },
      ],
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { product_id, product_name, category, price, quantity, status, ...rest } = req.body;
    const e_id = req.user.id;

    if (!product_name) return res.status(400).json({ error: 'Product name is required' });
    if (!e_id) return res.status(400).json({ error: 'Employee ID (e_id) is required' });
    if (!price || isNaN(price)) return res.status(400).json({ error: 'Valid unit price is required' });

    let category_id = null;
    if (category) {
      const categoryRecord = await Category.findOne({ where: { category_name: category } });
      if (!categoryRecord) return res.status(400).json({ error: `Category "${category}" does not exist` });
      category_id = categoryRecord.category_id;
    }

    const productEntry = await ProductEntry.create({
      product_id,
      product_name,
      unit_price: price,
      quantity,
      product_status: 'In Stock',
      status: status || 'pending',
      e_id,
      category_id,
      ...rest,
    });

    res.status(201).json({ message: 'Product entry created successfully', productEntry });
  } catch (error) {
    console.error('Error creating product:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to create product entry' });
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
    console.error('Error updating product entry:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to update product entry' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productEntry = await ProductEntry.findByPk(req.params.id);

    if (!productEntry) {
      return res.status(404).json({ error: 'Product entry not found' });
    }

    await productEntry.destroy();
    res.status(200).json({ message: 'Product entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting product entry:', error); // Log the error for debugging
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
    console.error('Error fetching product suggestions:', error); // Log the error for debugging
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
    console.error('Error generating new product ID:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to generate new product ID' });
  }
};

const getAllProductEntries = async (req, res) => {
  try {
    const { id: e_id } = req.user;

    if (!e_id) {
      return res.status(400).json({ error: 'Employee ID (e_id) is required' });
    }

    const entries = await ProductEntry.findAll({
      where: { e_id: `${e_id}` }, // Ensure e_id is treated as a string
      include: [
        { model: Category, as: 'category', attributes: ['category_name'] },
        { model: Inventory, as: 'inventory', attributes: ['product_name', 'description', 'unit_price'] },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['image_url'],
          required: false, // Allow fetching products even if no images are available
        },
        { model: ProductVariation, as: 'variations', attributes: ['size', 'additional_price', 'stock_level'] },
      ],
      attributes: ['entry_id', 'product_id', 'product_name', 'unit_price', 'quantity', 'product_status', 'status', 'date_added'],
    });

    if (!entries || entries.length === 0) {
      return res.status(200).json({ message: 'No product entries available', entries: [] });
    }

    res.status(200).json({ entries });
  } catch (error) {
    console.error('Error fetching product entries:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to fetch product entries' });
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
    console.error('Error fetching product by name:', error); // Log the error for debugging
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
