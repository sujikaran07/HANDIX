const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Inventory = sequelize.define('Inventory', { 
  product_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    primaryKey: true, 
  },
  product_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  category_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Categories',
      key: 'category_id',
    },
    onDelete: 'SET NULL',
  },
  default_image_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  date_added: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW, 
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  customization_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  product_status: {
    type: DataTypes.STRING(10), 
    defaultValue: 'In Stock',
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'), 
    allowNull: false,
    defaultValue: 'pending',
  },
  e_id: {
    type: DataTypes.STRING(10), 
    allowNull: false,
    references: {
      model: 'Employees',
      key: 'e_id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
}, {
  tableName: 'Inventory', 
  timestamps: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['product_id', 'e_id', 'date_added'], 
    },
  ],
  
  defaultScope: {
    attributes: { exclude: ['id'] },
  },
});

Inventory.associate = (models) => {
  if (models.Category) {
    Inventory.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
  }
  if (models.ProductVariation) {
    Inventory.hasMany(models.ProductVariation, { foreignKey: 'product_id', as: 'variations' }); 
  }
  if (models.ProductImage) {
    Inventory.hasMany(models.ProductImage, { foreignKey: 'product_id', as: 'inventoryImages' });
  }
  if (models.ProductEntry) {
    Inventory.hasMany(models.ProductEntry, { foreignKey: 'product_id', as: 'inventoryEntries' }); 
  }
};

module.exports = Inventory;
