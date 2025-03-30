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
}, {
  tableName: 'Categories',
  timestamps: false,
  underscored: true,
});

Category.associate = (models) => {
  Category.hasMany(models.Product, { foreignKey: 'category_id', as: 'products' });
};

module.exports = Category; // Corrected export statement
