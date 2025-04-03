const Product = require('../../models/productModel');
const Category = require('../../models/categoryModel');
const ProductVariation = require('../../models/productVariationModel');
const ProductImage = require('../../models/productImageModel'); // Import ProductImage model
const ProductEntry = require('../../models/productEntryModel'); // Import ProductEntry model
const { Op } = require('sequelize'); // Import Sequelize's Op for query operators

const getAllProducts = async (req, res) => {
  try {
    const { id: e_id } = req.user; // Extract e_id from the logged-in user's token
    console.log('Fetching products for e_id:', e_id); // Debugging: Log the e_id

    if (!e_id) {
      console.error('Employee ID (e_id) is missing in the request');
      return res.status(400).json({ error: 'Employee ID (e_id) is required' });
    }

    const products = await Product.findAll({
      where: { e_id }, // Filter by the logged-in user's e_id
      include: [
        { model: Category, as: 'category', attributes: ['category_name'] },
        { model: ProductVariation, as: 'variations' },
        { model: ProductImage, as: 'images', attributes: ['image_url'] }, // Include ProductImage
      ],
      attributes: ['product_id', 'product_name', 'unit_price', 'quantity', 'product_status', 'status', 'date_added'], // Added 'status'
    });

    if (!products || products.length === 0) {
      console.log('No products found for e_id:', e_id); // Debugging: Log if no products are found
      return res.status(200).json({ message: 'No products available', products: [] });
    }

    console.log('Fetched products:', products); // Debugging: Log the fetched products
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error); // Debugging: Log the error
    // Return a generic success response with an empty products array
    res.status(200).json({ message: 'No products available at the moment.', products: [] });
  }
};

const getProductById = async (req, res) => {
  try {
    console.log('Fetching product with ID:', req.params.id);
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: ProductVariation, as: 'variations' },
        { model: ProductImage, as: 'images', attributes: ['image_url'] }, // Include ProductImage
      ],
    });
    if (!product) {
      console.error('Product not found for ID:', req.params.id);
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
    console.log('Received product data:', req.body); // Debugging: Log the received product data

    const { product_id, product_name, size, e_id: bodyEId, category, price, status, images, ...rest } = req.body;
    const e_id = bodyEId || req.user.id;

    // Validation checks
    if (!product_name) return res.status(400).json({ error: 'Product name is required' });
    if (!e_id) return res.status(400).json({ error: 'Employee ID (e_id) is required' });
    if (!price || isNaN(price)) return res.status(400).json({ error: 'Valid unit price is required' });

    const validStatuses = ['pending', 'approved', 'rejected'];
    const finalStatus = validStatuses.includes(status) ? status : 'pending';

    const quantity = parseInt(rest.quantity, 10);
    if (isNaN(quantity)) return res.status(400).json({ error: 'Valid quantity is required' });

    // Fetch the category_id based on the category name
    let category_id = null;
    if (category) {
      const categoryRecord = await Category.findOne({ where: { category_name: category } });
      if (!categoryRecord) return res.status(400).json({ error: `Category "${category}" does not exist` });
      category_id = categoryRecord.category_id;

      // Update the stock level of the category
      await categoryRecord.update({ stock_level: categoryRecord.stock_level + quantity });
    }

    // Check if the product already exists
    let product = await Product.findOne({ where: { product_id } });
    if (!product) {
      // Create a new product if it doesn't exist
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
      // Update the product's quantity if it already exists
      await product.update({ quantity: product.quantity + quantity });
    }

    // Create a new entry in the ProductEntry table
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

    // Check if the product variation already exists
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

    // Add images to the ProductImage table
    if (images && images.length > 0) {
      const imageRecords = images.map((imageUrl) => ({
        product_id,
        image_url: imageUrl,
      }));
      await ProductImage.bulkCreate(imageRecords);
    }

    res.status(201).json({ message: 'Product and related entries created successfully', productEntry });
  } catch (error) {
    console.error('Error creating product:', error);
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
    console.error('Error updating product:', error);
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
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

const generateNewProductId = async (req, res) => {
  try {
    const lastProduct = await Product.findOne({
      order: [['product_id', 'DESC']], // Get the last product by ID
    });

    let newProductId = 'P001'; // Default ID if no products exist
    if (lastProduct) {
      const lastIdNumber = parseInt(lastProduct.product_id.substring(1)); // Extract the numeric part
      newProductId = `P${String(lastIdNumber + 1).padStart(3, '0')}`; // Increment and format
    }

    res.status(200).json({ product_id: newProductId });
  } catch (error) {
    console.error('Error generating new product ID:', error);
    res.status(500).json({ error: 'Failed to generate new product ID' });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, generateNewProductId };