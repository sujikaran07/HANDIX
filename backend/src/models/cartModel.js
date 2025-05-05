const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { Customer } = require('./customerModel');

const Cart = sequelize.define('Cart', {
  cart_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  c_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Customers',
      key: 'c_id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'active'
  }
}, {
  tableName: 'Cart',
  timestamps: false
});

// Define relationship to Customer
Cart.belongsTo(Customer, { foreignKey: 'c_id', as: 'customer' });
Customer.hasMany(Cart, { foreignKey: 'c_id', as: 'customerCarts' }); // Changed alias to avoid conflict

module.exports = Cart;
