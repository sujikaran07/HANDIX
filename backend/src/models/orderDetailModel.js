const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { Order } = require('./orderModel');

const OrderDetail = sequelize.define('OrderDetail', {
  orderDetailId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'order_detail_id',
    defaultValue: Sequelize.literal(`nextval('"OrderDetails_order_detail_id_seq"'::regclass)`),
  },
  o_id: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'order_id',
    references: {
      model: Order,
      key: 'o_id',
    },
    onDelete: 'SET NULL',
  },
  p_id: {
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

OrderDetail.belongsTo(Order, { foreignKey: 'o_id', as: 'order' });

module.exports = { OrderDetail };
