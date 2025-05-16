const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { Customer } = require('./customerModel');

const Discount = sequelize.define('Discount', {
  discount_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  c_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Customers',
      key: 'c_id'
    }
  },
  account_type: {
    type: DataTypes.ENUM('Retail', 'Wholesale'),
    allowNull: false,
    defaultValue: 'Retail'
  },
  min_order_value: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  max_order_value: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  discount_percent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  is_base_discount: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Discounts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = { Discount };
