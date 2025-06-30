const { sequelize } = require('../../config/db');
const Category = require('../../models/categoryModel');
const ProductEntry = require('../../models/productEntryModel');
const { cloudinary } = require('../../utils/cloudinaryConfig');

// Get all categories with product count
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: [
        'category_id',
        'category_name',
        'description',
        'category_image_url',
        'stock_level',
        [sequelize.literal('(SELECT COUNT(*) FROM "ProductEntries" WHERE "ProductEntries"."category_id" = "Category"."category_id")'), 'product_count']
      ],
      order: [['category_id', 'ASC']]
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

// Create a new category (with optional image)
exports.createCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body;
    let category_image_url = null;
    
    // Handle image upload if present - Cloudinary already uploaded the file
    if (req.file) {
      category_image_url = req.file.path; // Cloudinary returns the URL in the path property
    }
    
    // Fix auto-increment sequence first
    await sequelize.query(`
      SELECT setval('"Categories_category_id_seq"', 
      (SELECT MAX(category_id) FROM "Categories"), true);
    `);
    
    // Now create the category without explicitly setting category_id
    const newCategory = await Category.create({
      category_name,
      description,
      category_image_url
    });
    
    res.status(201).json({
      success: true,
      category: newCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    
    // Handle unique constraint error more gracefully
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'A category with this ID already exists. Please try again.',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a category if no products are associated
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if category has any products
    const productCount = await ProductEntry.count({
      where: { category_id: id }
    });
    
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with associated products'
      });
    }
    
    const result = await Category.destroy({
      where: { category_id: id }
    });
    
    if (result) {
      res.status(200).json({
        success: true,
        message: 'Category deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update a category (name, description, image)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, description } = req.body;
    
    // Check if products are associated with this category
    const productCount = await ProductEntry.count({
      where: { category_id: id }
    });
    
    // Prepare update object
    const updateData = { description };
    
    // Only update name if no products are associated
    if (productCount === 0 || !category_name) {
      updateData.category_name = category_name;
    }
    
    // Handle image update if present
    if (req.file) {
      updateData.category_image_url = req.file.path;
    }
    
    const [updated] = await Category.update(updateData, {
      where: { category_id: id }
    });
    
    if (updated) {
      const updatedCategory = await Category.findByPk(id, {
        attributes: [
          'category_id',
          'category_name',
          'description',
          'category_image_url',
          'stock_level',
          [sequelize.literal('(SELECT COUNT(*) FROM "ProductEntries" WHERE "ProductEntries"."category_id" = "Category"."category_id")'), 'product_count']
        ]
      });
      
      res.status(200).json({
        success: true,
        category: updatedCategory
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
