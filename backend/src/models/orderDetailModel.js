const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { Order } = require('./orderModel');

const OrderDetail = sequelize.define('OrderDetail', {
  order_detail_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'order_detail_id'
  },
  order_id: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'order_id',
    references: {
      model: Order,
      key: 'order_id'
    }
  },
  product_id: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'product_id'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'quantity'
  },
  priceAtPurchase: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'price_at_purchase'
  },
  customization: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'customization_text'
  },
  customization_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'customization_fee'
  }
}, {
  tableName: 'OrderDetails',
  timestamps: false,
  underscored: true
});

OrderDetail.belongsTo(Order, { 
  foreignKey: 'order_id',
  as: 'order'
});

module.exports = { OrderDetail };
