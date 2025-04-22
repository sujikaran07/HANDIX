const ProductEntry = require('../../models/productEntryModel');
const { Op } = require('sequelize');

const getAllAdminProducts = async (req, res) => {
  try {
    const products = await ProductEntry.findAll({
      include: [
        { model: require('../../models/categoryModel'), as: 'category', attributes: ['category_name'] },
        { model: require('../../models/inventoryModel'), as: 'inventory', attributes: ['product_name', 'unit_price', 'description'] },
      ],
      attributes: ['entry_id', 'product_id', 'product_name', 'unit_price', 'quantity', 'product_status', 'status', 'date_added'],
    });

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({ error: 'Failed to fetch admin products' });
  }
};

const updateAdminProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const product = await ProductEntry.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.status = status;
    await product.save();

    res.status(200).json({ message: 'Product status updated successfully', product });
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({ error: 'Failed to update product status' });
  }
};

const deleteAdminProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await ProductEntry.findByPk(id);
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

module.exports = {
  getAllAdminProducts,
  updateAdminProductStatus,
  deleteAdminProduct,
};
