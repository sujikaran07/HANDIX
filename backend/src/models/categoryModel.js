const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Category = sequelize.define('Category', {
  category_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  category_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  stock_level: {
    type: DataTypes.INTEGER, // New column for stock level
    defaultValue: 0, // Default value is 0
    allowNull: true,
  },
}, {
  tableName: 'Categories',
  timestamps: false,
  underscored: true,
});

Category.associate = (models) => {
  Category.hasMany(models.Inventory, { foreignKey: 'category_id', as: 'products' }); // Updated association
  Category.hasMany(models.ProductEntry, { foreignKey: 'category_id', as: 'entries' });
};

module.exports = Category;
