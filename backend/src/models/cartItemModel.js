const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Cart = require('./cartModel');
const Inventory = require('./inventoryModel');

const CartItem = sequelize.define('CartItem', {
  cart_item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cart_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Cart',
      key: 'cart_id'
    }
  },
  product_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    references: {
      model: 'Inventory',
      key: 'product_id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  added_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  customization: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'Cart_Items',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['cart_id', 'product_id', 'customization'] 
    }
  ]
});

CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items', onDelete: 'CASCADE' });

CartItem.belongsTo(Inventory, { foreignKey: 'product_id', as: 'product' });
Inventory.hasMany(CartItem, { foreignKey: 'product_id', as: 'cartItems' });

module.exports = CartItem;
