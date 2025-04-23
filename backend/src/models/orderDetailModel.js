const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { Order } = require('./orderModel');

const OrderDetail = sequelize.define('OrderDetail', {
  order_detail_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'order_detail_id',
    defaultValue: Sequelize.literal(`nextval('"OrderDetails_order_detail_id_seq"'::regclass)`),
  },
  order_id: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'order_id',
    references: {
      model: Order,
      key: 'order_id',
    },
    onDelete: 'SET NULL',
  },
  product_id: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'product_id',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  priceAtPurchase: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'price_at_purchase',
  },
}, {
  tableName: 'OrderDetails',
  timestamps: false,
  underscored: true,
});

module.exports = { OrderDetail };
