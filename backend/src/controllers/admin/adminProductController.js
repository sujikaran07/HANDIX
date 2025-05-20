const ProductEntry = require('../../models/productEntryModel');
const { Op } = require('sequelize');
const Inventory = require('../../models/inventoryModel');
const Category = require('../../models/categoryModel');

const getAllAdminProducts = async (req, res) => {
  try {
    const products = await ProductEntry.findAll({
      include: [
        { model: require('../../models/categoryModel'), as: 'category', attributes: ['category_name'] },
        { model: require('../../models/inventoryModel'), as: 'inventory', attributes: ['product_name', 'unit_price', 'description'] },
      ],
      attributes: ['entry_id', 'product_id', 'product_name', 'unit_price', 'quantity', 'product_status', 'status', 'date_added', 'e_id'], 
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
 
    const validStatuses = ['Approved', 'Pending', 'Rejected', 'Disabled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const product = await ProductEntry.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log(`Updating product ${id} status from ${product.status} to ${status}`);
    
    product.status = status;
    await product.save();

    if (status === 'Approved') {   
      // Update inventory
      let inventoryRecord = await Inventory.findOne({ where: { product_id: product.product_id } });
      if (inventoryRecord) {
        await inventoryRecord.update({
          product_name: product.product_name,
          description: product.description || inventoryRecord.description,
          unit_price: product.unit_price,
          quantity: inventoryRecord.quantity + product.quantity,
          customization_available: product.customization_available
        });
        console.log('Updated existing inventory record with actual quantity');
      }
      // Update category stock level
      if (product.category_id) {
        try {
          const categoryRecord = await Category.findByPk(product.category_id);
          if (categoryRecord && typeof categoryRecord.stock_level !== 'undefined') {
            console.log(`Updating category stock level by adding ${product.quantity} units`);
            await categoryRecord.update({
              stock_level: (categoryRecord.stock_level || 0) + product.quantity
            });
            console.log(`Updated category stock level to ${categoryRecord.stock_level}`);
          }
        } catch (categoryError) {
          console.error('Error updating category stock level:', categoryError);
        }
      }
    }

    res.status(200).json({ 
      message: 'Product status updated successfully', 
      product: {
        entry_id: product.entry_id,
        product_id: product.product_id,
        status: product.status
      }
    });
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
