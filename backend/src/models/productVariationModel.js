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
    allowNull: false,
    references: {
      model: 'Inventory', 
      key: 'product_id',
    },
    onDelete: 'CASCADE',
  },
  size: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  additional_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  stock_level: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'ProductVariations',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['product_id', 'size'], 
    },
  ],
});

ProductVariation.associate = (models) => {
  ProductVariation.belongsTo(models.Inventory, { foreignKey: 'product_id', as: 'inventoryProduct' });
};

module.exports = ProductVariation;
