const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Inventory = require('./inventoryModel'); // Ensure Inventory is imported

const ProductVariation = sequelize.define('ProductVariation', {
  variation_id: {
    type: DataTypes.INTEGER, // Correctly defined as integer
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  product_id: {
    type: DataTypes.STRING(10), // Match Inventory.product_id
    allowNull: false,
    references: {
      model: 'Inventory', // Reference the Inventory table
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
      fields: ['product_id', 'size'], // Enforce unique constraint on product_id and size
    },
  ],
});

ProductVariation.associate = (models) => {
  ProductVariation.belongsTo(models.Inventory, { foreignKey: 'product_id', as: 'inventoryProduct' }); // Use product_id for the association with Inventory
};

module.exports = ProductVariation;
