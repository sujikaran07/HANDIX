const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Conversation = sequelize.define('Conversation', {
  conversations_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'order_id'
    }
  },
  customer_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Customers',
      key: 'c_id'
    }
  },
  artisan_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Employees',
      key: 'e_id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Conversations',
  timestamps: false
});

module.exports = Conversation;
