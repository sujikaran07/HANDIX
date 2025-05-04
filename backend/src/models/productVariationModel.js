const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Inventory = require('./inventoryModel'); 

const ProductVariation = sequelize.define('ProductVariation', {
  variation_id: {
    type: DataTypes.INTEGER, 
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  product_id: {
    type: DataTypes.STRING(10), 
    allowNull: true,
    references: {
      model: 'Inventory', 
      key: 'product_id',
    },
    onDelete: 'CASCADE',
  },
  additional_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  },
  stock_level: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
}, {
  tableName: 'ProductVariations',
  timestamps: false,
  underscored: true,
});

ProductVariation.associate = (models) => {
  ProductVariation.belongsTo(models.Inventory, { foreignKey: 'product_id', as: 'inventoryProduct' });
};

module.exports = ProductVariation;
