const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PurchaseLimit = sequelize.define('PurchaseLimit', {
  purchaseLimitId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'PurchaseLimitId'
  },
  productId: {
    type: DataTypes.STRING(10),
    allowNull: false,
    field: 'ProductId',
    references: {
      model: 'Inventory',
      key: 'product_id'
    },
    onDelete: 'CASCADE'
  },
  maxUnits: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    field: 'MaxUnits'
  },
  appliesToRetail: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'AppliesToRetail'
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'LastUpdated'
  }
}, {
  tableName: 'PurchaseLimits',
  timestamps: false
});

module.exports = PurchaseLimit;
