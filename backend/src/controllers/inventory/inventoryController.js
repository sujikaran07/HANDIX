const Inventory = require('../../models/inventoryModel');
const Category = require('../../models/categoryModel');
const ProductEntry = require('../../models/productEntryModel');

const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findAll({
      include: [
        {
          model: ProductEntry,
          as: 'inventoryEntries',
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['category_name']
            }
          ]
        }
      ],
      attributes: ['product_id', 'product_name', 'quantity', 'unit_price', 'description', 'product_status', 'date_added'],
    });
    
    
    const formattedInventory = inventory.map(item => {
      const entry = item.inventoryEntries && item.inventoryEntries[0];
      return {
        ...item.toJSON(),
        category: entry ? entry.category : null,
        inventoryEntries: undefined
      };
    });
    
    res.status(200).json({ inventory: formattedInventory });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

module.exports = {
  getInventory,
};
