const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { Customer } = require('./customerModel');

const Address = sequelize.define('Address', {
  addressId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'address_id',
  },
  c_id: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'c_id',
    references: {
      model: Customer,
      key: 'c_id',
    },
    onDelete: 'CASCADE',
  },
  addressType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'address_type',
  },
  addressLine1: {
    type: DataTypes.TEXT,
    field: 'address_line_1',
  },
  addressLine2: {
    type: DataTypes.TEXT,
    field: 'address_line_2',
  },
  city: {
    type: DataTypes.STRING,
    field: 'city',
  },
  state: {
    type: DataTypes.STRING,
    field: 'state',
  },
  postalCode: {
    type: DataTypes.STRING,
    field: 'postal_code',
  },
  country: {
    type: DataTypes.STRING,
    field: 'country',
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
  },
}, {
  tableName: 'Addresses',
  timestamps: false,
  underscored: true,
});

Address.belongsTo(Customer, { foreignKey: 'c_id', as: 'customer' });

module.exports = { Address };
