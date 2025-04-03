const Product = require('../../models/productModel');
const Category = require('../../models/categoryModel');
const ProductVariation = require('../../models/productVariationModel');
const ProductImage = require('../../models/productImageModel');
const ProductEntry = require('../../models/productEntryModel');
const { Op } = require('sequelize');

const getAllProducts = async (req, res) => {
  try {
    const { id: e_id } = req.user;

    if (!e_id) {
      return res.status(400).json({ error: 'Employee ID (e_id) is required' });
    }

    const products = await Product.findAll({
      where: { e_id },
      include: [
        { model: Category, as: 'category', attributes: ['category_name'] },
        { model: ProductVariation, as: 'variations' },
        { model: ProductImage, as: 'images', attributes: ['image_url'] },
      ],
      attributes: ['product_id', 'product_name', 'unit_price', 'quantity', 'product_status', 'status', 'date_added'],
    });

    if (!products || products.length === 0) {
      return res.status(200).json({ message: 'No products available', products: [] });
    }

    res.status(200).json({ products });
  } catch (error) {
    res.status(200).json({ message: 'No products available at the moment.', products: [] });
  }
};

const getProductById = async (req, res) => {
  try {
    console.log('Fetching product by ID:', req.params.id); // Debugging: Log the product ID
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category', attributes: ['category_name'] },
        { model: ProductVariation, as: 'variations' },
        { model: ProductImage, as: 'images', attributes: ['image_url'] },
      ],
    });
    console.log('Fetched product:', product); // Debugging: Log the fetched product
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { product_id, product_name, size, e_id: bodyEId, category, price, status, images, ...rest } = req.body;
    const e_id = bodyEId || req.user.id;

    if (!product_name) return res.status(400).json({ error: 'Product name is required' });
    if (!e_id) return res.status(400).json({ error: 'Employee ID (e_id) is required' });
    if (!price || isNaN(price)) return res.status(400).json({ error: 'Valid unit price is required' });

    const validStatuses = ['pending', 'approved', 'rejected'];
    const finalStatus = validStatuses.includes(status) ? status : 'pending';

    const quantity = parseInt(rest.quantity, 10);
    if (isNaN(quantity)) return res.status(400).json({ error: 'Valid quantity is required' });

    let category_id = null;
    if (category) {
      const categoryRecord = await Category.findOne({ where: { category_name: category } });
      if (!categoryRecord) return res.status(400).json({ error: `Category "${category}" does not exist` });
      category_id = categoryRecord.category_id;
      await categoryRecord.update({ stock_level: categoryRecord.stock_level + quantity });
    }

    let product = await Product.findOne({ where: { product_id } });
    if (!product) {
      product = await Product.create({
        product_id,
        product_name,
        e_id,
        unit_price: price,
        product_status: rest.product_status || 'In Stock',
        status: finalStatus,
        date_added: new Date(),
        quantity,
        category_id,
        description: rest.description || null,
        customization_available: rest.customization_available || false,
      });
    } else {
      await product.update({ quantity: product.quantity + quantity });
    }

    const productEntry = await ProductEntry.create({
      product_id,
      product_name,
      description: rest.description || null,
      unit_price: price,
      quantity,
      product_status: rest.product_status || 'In Stock',
      status: finalStatus,
      e_id,
      date_added: new Date(),
      customization_available: rest.customization_available || false,
      category_id,
    });

    const existingVariation = await ProductVariation.findOne({ where: { product_id, size: size || 'N/A' } });
    if (existingVariation) {
      await existingVariation.update({ stock_level: existingVariation.stock_level + quantity });
    } else {
      await ProductVariation.create({
        product_id,
        size: category === 'Clothing' && size ? size : 'N/A',
        additional_price: price,
        stock_level: quantity,
      });
    }

    if (images && images.length > 0) {
      const imageRecords = images.map((imageUrl) => ({
        product_id,
        image_url: imageUrl,
      }));
      await ProductImage.bulkCreate(imageRecords);
    }

    res.status(201).json({ message: 'Product and related entries created successfully', productEntry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await product.update(req.body);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await product.destroy();
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

const generateNewProductId = async (req, res) => {
  try {
    const lastProduct = await Product.findOne({
      order: [['product_id', 'DESC']],
    });

    let newProductId = 'P001';
    if (lastProduct) {
      const lastIdNumber = parseInt(lastProduct.product_id.substring(1));
      newProductId = `P${String(lastIdNumber + 1).padStart(3, '0')}`;
    }

    res.status(200).json({ product_id: newProductId });
  } catch (error) {
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
      where: { e_id },
      include: [
        { model: Category, as: 'category', attributes: ['category_name'] },
        { model: Product, as: 'product', attributes: ['product_name'] },
      ],
    });

    if (!entries || entries.length === 0) {
      return res.status(200).json({ message: 'No entries available', entries: [] });
    }

    res.status(200).json({ entries });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product entries' });
  }
};

const getProductByName = async (req, res) => {
  try {
    console.log('Fetching product by name:', req.query.name); // Debugging: Log the product name
    const product = await Product.findOne({
      where: {
        product_name: {
          [Op.iLike]: req.query.name, // Use case-insensitive matching
        },
      },
      attributes: ['product_id', 'product_name', 'description', 'unit_price', 'category_id', 'customization_available', 'product_status', 'status'],
      include: [
        { model: Category, as: 'category', attributes: ['category_name'] },
      ],
    });
    console.log('Fetched product:', product); // Debugging: Log the fetched product
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product by name:', error);
    res.status(500).json({ error: 'Failed to fetch product by name' });
  }
};

const getProductSuggestions = async (req, res) => {
  try {
    const { search } = req.query; // Extract the search term from the query string

    if (!search) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    const products = await Product.findAll({
      where: {
        product_name: {
          [Op.iLike]: `%${search}%`, // Use case-insensitive partial matching
        },
      },
      attributes: ['product_id', 'product_name'], // Only return necessary fields for suggestions
    });

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching product suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch product suggestions' });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, generateNewProductId, getAllProductEntries, getProductByName, getProductSuggestions };