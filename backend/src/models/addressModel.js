const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Address = sequelize.define('Address', {
  address_id: {
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
      model: 'Customers',
      key: 'c_id',
    },
    onDelete: 'CASCADE',
  },
  name: {
    type: DataTypes.STRING(100),
    field: 'address_name',
    allowNull: true,
  },
  addressType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'address_type',
    validate: {
      isIn: [['shipping', 'billing']]
    }
  },
  street_address: {
    type: DataTypes.TEXT,
    field: 'street_address',
  },
  city: {
    type: DataTypes.STRING,
    field: 'city',
  },
  district: {
    type: DataTypes.STRING,
    field: 'district',
  },
  postalCode: {
    type: DataTypes.STRING,
    field: 'postal_code',
  },
  country: {
    type: DataTypes.STRING,
    field: 'country',
    defaultValue: 'Sri Lanka'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.fn('now')
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
    defaultValue: Sequelize.fn('now')
  },
}, {
  tableName: 'Addresses',
  timestamps: true,
  underscored: true,
});

module.exports = { Address };
