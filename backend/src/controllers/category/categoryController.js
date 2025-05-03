const { sequelize } = require('../../config/db');
const Category = require('../../models/categoryModel');
const ProductEntry = require('../../models/productEntryModel');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: [
        'category_id',
        'category_name',
        'description',
        [sequelize.literal('(SELECT COUNT(*) FROM "ProductEntries" WHERE "ProductEntries"."category_id" = "Category"."category_id")'), 'product_count']
      ],
      order: [['category_name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
