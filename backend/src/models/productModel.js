const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  product_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    primaryKey: true, // Set product_id as the primary key
  },
  product_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  category_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Categories',
      key: 'category_id',
    },
    onDelete: 'SET NULL',
  },
  default_image_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  date_added: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW, // Automatically set the current timestamp
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  customization_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  product_status: {
    type: DataTypes.STRING(10), // Represents the stock status (e.g., 'In Stock', 'Out of Stock')
    defaultValue: 'In Stock',
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'), // Represents the approval status of the product
    allowNull: false,
    defaultValue: 'pending',
  },
  e_id: {
    type: DataTypes.STRING(10),
    allowNull: false, // Ensure e_id is required
    references: {
      model: 'Employees', // Ensure this matches the actual table name
      key: 'e_id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
}, {
  tableName: 'Products',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['product_id', 'e_id', 'date_added'], // Composite unique constraint on product_id, e_id, and date_added
    },
  ],
  // Disable the default `id` column
  defaultScope: {
    attributes: { exclude: ['id'] },
  },
});

Product.associate = (models) => {
  if (models.Category) {
    Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
  }
  if (models.ProductVariation) {
    Product.hasMany(models.ProductVariation, { foreignKey: 'product_id', as: 'variations' });
  }
  if (models.Employee) {
    Product.belongsTo(models.Employee, { foreignKey: 'e_id', as: 'employee' });
  }
  if (models.ProductImage) {
    Product.hasMany(models.ProductImage, { foreignKey: 'product_id', as: 'images' }); // Define association with ProductImage
  }
  if (models.ProductEntry) {
    Product.hasMany(models.ProductEntry, { foreignKey: 'product_id', as: 'entries' });
  }
};

module.exports = Product;
