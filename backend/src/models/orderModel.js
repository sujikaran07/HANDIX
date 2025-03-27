const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
  order_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    defaultValue: Sequelize.literal(`'O' || lpad(nextval('order_id_seq')::text, 3, '0')`),
  },
  c_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Customers', // Use table name to avoid circular dependency
      key: 'c_id',
    },
    onDelete: 'SET NULL',
  },
  order_status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending',
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  payment_status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending',
  },
  shipping_method_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  order_date: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  delivery_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  total_spent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  total_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  last_order_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'Orders',
  timestamps: false,
  underscored: true,
});

module.exports = { Order };
