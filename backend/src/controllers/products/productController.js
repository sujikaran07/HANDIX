const Product = require('../../models/productModel');
const Category = require('../../models/categoryModel');
const ProductVariation = require('../../models/productVariationModel');

const getAllProducts = async (req, res) => {
  try {
    const { id: e_id } = req.user; // Extract e_id from the logged-in user's token
    console.log('Fetching products for e_id:', e_id); // Debugging: Log the e_id

    const products = await Product.findAll({
      where: { e_id }, // Filter products by e_id
      include: [
        { model: Category, as: 'category', attributes: ['category_name'] },
        { model: ProductVariation, as: 'variations' },
      ],
      attributes: ['product_id', 'product_name', 'unit_price', 'quantity', 'product_status', 'status', 'date_added'], // Added 'status'
    });

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

const getProductById = async (req, res) => {
  try {
    console.log('Fetching product with ID:', req.params.id);
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: ProductVariation, as: 'variations' },
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
    console.log('Received product data:', req.body); // Debugging: Log the incoming data

    const { product_name, size, e_id, ...rest } = req.body;

    // Validate product_name and e_id
    if (!product_name) {
      console.error('Validation Error: Product name is required');
      return res.status(400).json({ error: 'Product name is required' });
    }
    if (!e_id) {
      console.error('Validation Error: Employee ID (e_id) is missing');
      return res.status(400).json({ error: 'Employee ID (e_id) is required' });
    }

    // Check if a product with the same name exists
    const existingProduct = await Product.findOne({ where: { product_name } });
    console.log('Existing product:', existingProduct);

    let productId = existingProduct ? existingProduct.product_id : null;

    if (!productId) {
      // Generate a new unique product_id
      const newProduct = await Product.create({ product_name, e_id, ...rest });
      console.log('New product created:', newProduct);
      productId = newProduct.product_id;
    }

    // Create a new variation or update the existing product
    const productVariation = await ProductVariation.create({
      product_id: productId,
      size,
      additional_price: rest.unit_price,
      stock_level: rest.quantity,
    });
    console.log('Product variation created:', productVariation);

    res.status(201).json({ message: 'Product saved successfully', productVariation });
  } catch (error) {
    console.error('Error creating product:', error); // Debugging: Log the error
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
