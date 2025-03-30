const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

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
      model: 'Products',
      key: 'product_id',
    },
    onDelete: 'SET NULL',
  },
  size: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  additional_price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  stock_level: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'ProductVariations',
  timestamps: false,
  underscored: true,
});

ProductVariation.associate = (models) => {
  ProductVariation.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
};

module.exports = ProductVariation;
