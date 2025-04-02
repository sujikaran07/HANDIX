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

    console.log('Fetched products:', products); // Debugging: Log the fetched products
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
    console.log('Received product data:', req.body);

    const { product_id, product_name, size, e_id: bodyEId, category, price, status, ...rest } = req.body;
    const e_id = bodyEId || req.user.id;

    console.log('e_id from body:', bodyEId);
    console.log('e_id from token:', req.user.id);
    console.log('Final e_id:', e_id);

    if (!product_name) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    if (!e_id) {
      return res.status(400).json({ error: 'Employee ID (e_id) is required' });
    }
    if (!price || isNaN(price)) {
      return res.status(400).json({ error: 'Valid unit price is required' });
    }

    const validStatuses = ['pending', 'approved', 'rejected'];
    const finalStatus = validStatuses.includes(status) ? status : 'pending';

    // Ensure quantity is treated as a number
    const quantity = parseInt(rest.quantity, 10);
    if (isNaN(quantity)) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    // Check if the product already exists in the ProductVariations table
    const existingVariation = await ProductVariation.findOne({ where: { product_id, size: size || 'N/A' } });

    if (existingVariation) {
      console.log(`Product ID "${product_id}" already exists in variations. Updating stock level.`);

      // Update the stock level in the ProductVariations table
      await existingVariation.update({
        stock_level: existingVariation.stock_level + quantity,
      });

      console.log('Updated stock level in ProductVariations:', existingVariation);

      // Add a new entry in the Products table for the employee's contribution
      const uniqueProductId = `${product_id}-${e_id}`; // Append e_id to product_id to make it unique
      const newProduct = await Product.create({
        product_id: uniqueProductId,
        product_name,
        e_id,
        unit_price: price,
        product_status: rest.product_status || 'In Stock',
        status: finalStatus,
        date_added: new Date(),
        quantity, // Track the employee's contribution
        category_id: rest.category_id || null, // Ensure category_id is optional
        description: rest.description || null,
        customization_available: rest.customization_available || false,
      });

      console.log('New product entry created for employee:', newProduct);

      return res.status(201).json({ message: 'Product variation updated and new product entry added', newProduct });
    }

    // If the product does not exist in the ProductVariations table, create a new variation
    console.log(`Product ID "${product_id}" does not exist in variations. Creating a new variation.`);

    const newVariation = await ProductVariation.create({
      product_id,
      size: category === 'Clothing' && size ? size : 'N/A',
      additional_price: price,
      stock_level: quantity,
    });

    console.log('New variation created:', newVariation);

    // Add a new entry in the Products table for the employee's contribution
    const uniqueProductId = `${product_id}-${e_id}`; // Append e_id to product_id to make it unique
    const newProduct = await Product.create({
      product_id: uniqueProductId,
      product_name,
      e_id,
      unit_price: price,
      product_status: rest.product_status || 'In Stock',
      status: finalStatus,
      date_added: new Date(),
      quantity, // Track the employee's contribution
      category_id: rest.category_id || null, // Ensure category_id is optional
      description: rest.description || null,
      customization_available: rest.customization_available || false,
    });

    console.log('New product entry created for employee:', newProduct);

    res.status(201).json({ message: 'New product and variation created successfully', newProduct });
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
