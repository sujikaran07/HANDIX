const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { Order } = require('./orderModel');

const OrderDetail = sequelize.define('OrderDetail', {
  order_detail_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  order_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Order,
      key: 'order_id',
    },
    onDelete: 'SET NULL',
  },
  product_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price_at_purchase: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'OrderDetails',
  timestamps: false,
  underscored: true,
});

module.exports = { OrderDetail };
