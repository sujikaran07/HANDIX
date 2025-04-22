const Inventory = require('../../models/inventoryModel');
const Category = require('../../models/categoryModel');

const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findAll({
      include: [{ model: Category, as: 'category', attributes: ['category_name'] }],
      attributes: ['product_id', 'product_name', 'quantity', 'unit_price', 'description', 'product_status', 'date_added'],
    });
    res.status(200).json({ inventory });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

module.exports = {
  getInventory,
};
