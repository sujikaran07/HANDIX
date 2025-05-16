const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Discount = sequelize.define('Discount', {
  discountId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'DiscountId'
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
  discountCode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'DiscountCode'
  },
  description: {
    type: DataTypes.TEXT,
    field: 'Description'
  },
  discountType: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'DiscountType',
    validate: {
      isIn: [['percentage', 'fixed']]
    }
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'Value'
  },
  minOrderValue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'MinOrderValue'
  },
  startDate: {
    type: DataTypes.DATE,
    field: 'StartDate'
  },
  endDate: {
    type: DataTypes.DATE,
    field: 'EndDate'
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'UsageLimit'
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'active',
    field: 'Status',
    validate: {
      isIn: [['active', 'expired', 'disabled']]
    }
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'LastUpdated'
  },
  c_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Customer',
      key: 'c_id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'Discounts',
  timestamps: false
});

module.exports = { Discount };
