const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PaymentMethod = sequelize.define('PaymentMethod', {
  method_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'method_id',
  },
  c_id: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'c_id',
    references: {
      model: 'Customers',
      key: 'c_id',
    },
    onDelete: 'CASCADE',
  },
  methodType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'method_type',
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_default',
  },
  details: {
    type: DataTypes.JSONB,
    defaultValue: {},
    field: 'details',
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.fn('now')
  },
}, {
  tableName: 'Payment_methods',
  timestamps: true,
  updatedAt: false, // No updated_at column in the schema
  underscored: true,
});

module.exports = { PaymentMethod };
