const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { Customer } = require('./customerModel');
const Inventory = require('./inventoryModel');

const Favorite = sequelize.define('Favorite', {
  favorite_id: {
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
  product_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Inventory',
      key: 'product_id'
    }
  },
  date_added: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Favorites',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['c_id', 'product_id']
    }
  ]
});

Favorite.belongsTo(Customer, { foreignKey: 'c_id', as: 'customer' });
Customer.hasMany(Favorite, { foreignKey: 'c_id', as: 'favorites', onDelete: 'CASCADE' });

Favorite.belongsTo(Inventory, { foreignKey: 'product_id', as: 'product' });
Inventory.hasMany(Favorite, { foreignKey: 'product_id', as: 'favoritedBy', onDelete: 'CASCADE' });

module.exports = Favorite;
