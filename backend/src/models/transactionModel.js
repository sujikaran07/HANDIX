const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { Customer } = require('./customerModel');
const { Order } = require('./orderModel');

const Transaction = sequelize.define('Transaction', {
  transaction_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'transaction_id'
  },
  order_id: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'order_id',
    references: {
      model: Order,
      key: 'order_id'
    },
    onDelete: 'NO ACTION'
  },
  c_id: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'c_id',
    references: {
      model: Customer,
      key: 'c_id'
    },
    onDelete: 'NO ACTION'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'amount'
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'payment_method'
  },
  transactionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
    field: 'transaction_date'
  },
  transactionStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    field: 'transaction_status'
  },
  paymentGateway: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'payment_gateway'
  },
  gatewayTransactionId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'gateway_transaction_id'
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'LKR',
    field: 'currency'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'notes'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'Transactions',
  timestamps: false,
  underscored: true
});

module.exports = { Transaction };
