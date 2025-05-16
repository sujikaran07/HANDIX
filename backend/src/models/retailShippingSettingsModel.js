const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RetailShippingSettings = sequelize.define('RetailShippingSettings', {
  retailShippingSettingId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'RetailShippingSettingId'
  },
  pickUpEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'PickUpEnabled'
  },
  codEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'CodEnabled'
  },
  additionalChargesMessage: {
    type: DataTypes.TEXT,
    defaultValue: 'Additional shipping charges may apply based on package weight.',
    field: 'AdditionalChargesMessage'
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'LastUpdated'
  }
}, {
  tableName: 'RetailShippingSettings',
  timestamps: false
});

module.exports = RetailShippingSettings;
