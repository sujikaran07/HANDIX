const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ShippingMethod = sequelize.define('ShippingMethod', {
  shipping_method_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'shipping_method_id'
  },
  methodName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'method_name'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'price'
  }
}, {
  tableName: 'ShippingMethods',
  timestamps: false,
  underscored: true
});

module.exports = { ShippingMethod };
