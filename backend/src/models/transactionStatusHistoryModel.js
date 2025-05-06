const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { Transaction } = require('./transactionModel');

const TransactionStatusHistory = sequelize.define('TransactionStatusHistory', {
  history_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'history_id'
  },
  transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'transaction_id',
    references: {
      model: Transaction,
      key: 'transaction_id'
    },
    onDelete: 'NO ACTION'
  },
  previousStatus: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'previous_status'
  },
  newStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'new_status'
  },
  changedAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
    field: 'changed_at'
  },
  changedBy: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'changed_by'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'notes'
  }
}, {
  tableName: 'Transaction_status_history',
  timestamps: false,
  underscored: true
});

module.exports = { TransactionStatusHistory };
