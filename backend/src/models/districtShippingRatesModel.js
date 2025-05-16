const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DistrictShippingRates = sequelize.define('DistrictShippingRates', {
  districtShippingRateId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'DistrictShippingRateId'
  },
  districtName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'DistrictName'
  },
  fixedRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'FixedRate'
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'LastUpdated'
  }
}, {
  tableName: 'DistrictShippingRates',
  timestamps: false
});

module.exports = DistrictShippingRates;
