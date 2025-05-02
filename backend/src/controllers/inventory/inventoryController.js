const Inventory = require('../../models/inventoryModel');
const Category = require('../../models/categoryModel');
const ProductEntry = require('../../models/productEntryModel');
const ProductImage = require('../../models/productImageModel');

const getInventory = async (req, res) => {
  try {
    console.log("Fetching inventory with images");

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
        },
        {
          model: ProductImage,
          as: 'productImages',
          attributes: ['image_url']
        }
      ],
      attributes: ['product_id', 'product_name', 'quantity', 'unit_price', 'description', 'product_status', 'date_added', 'default_image_url', 'customization_available'],
    });
    
    console.log(`Found ${inventory.length} inventory items`);
    
    // Debug: Check if first item has images
    if (inventory.length > 0) {
      const firstItem = inventory[0];
      console.log(`First item (${firstItem.product_id}) has ${firstItem.productImages ? firstItem.productImages.length : 0} images`);
      console.log(`Default image URL: ${firstItem.default_image_url || 'none'}`);
    }
    
    const formattedInventory = inventory.map(item => {
      const entry = item.inventoryEntries && item.inventoryEntries[0];
      const category = entry ? entry.category : null;
      
      // Extract all image URLs
      const images = [];
      
      // Add default image URL if it exists
      if (item.default_image_url) {
        images.push(item.default_image_url);
        console.log(`Added default image for ${item.product_id}: ${item.default_image_url}`);
      }
      
      // Add all other product images
      if (item.productImages && item.productImages.length > 0) {
        item.productImages.forEach(img => {
          if (img.image_url && !images.includes(img.image_url)) {
            images.push(img.image_url);
            console.log(`Added product image for ${item.product_id}: ${img.image_url}`);
          }
        });
      }
      
      const result = {
        ...item.toJSON(),
        category: category,
        images: images,
        inventoryEntries: undefined,
        productImages: undefined
      };
      
      console.log(`Product ${item.product_id} has ${images.length} images`);
      return result;
    });
    
    res.status(200).json({ inventory: formattedInventory });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory', message: error.message });
  }
};

module.exports = {
  getInventory,
};
