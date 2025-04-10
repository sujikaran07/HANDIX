const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProductEntry = sequelize.define('ProductEntry', {
  entry_id: {
    type: DataTypes.INTEGER, 
    autoIncrement: true,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.STRING(10), 
    allowNull: false,
    references: {
      model: 'ProductEntries',
      key: 'product_id',
    },
    onDelete: 'CASCADE',
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
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  product_status: {
    type: DataTypes.STRING(10),
    defaultValue: 'In Stock',
  },
  status: {
    type: DataTypes.STRING(10),
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
  },
  date_added: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  customization_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Categories',
      key: 'category_id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  variation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ProductVariations',
      key: 'variation_id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
}, {
  tableName: 'ProductEntries',
  timestamps: false,
  underscored: true,
  hooks: {
    beforeCreate: (productEntry, options) => {
      if (!productEntry.e_id && options.user) {
        productEntry.e_id = options.user.id; 
      }
    },
  },
});

ProductEntry.associate = (models) => {
  if (models.Inventory) {
    ProductEntry.belongsTo(models.Inventory, { foreignKey: 'product_id', as: 'inventory' });
  }
  if (models.Category) {
    ProductEntry.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
  }
  if (models.ProductImage) {
    ProductEntry.hasMany(models.ProductImage, { foreignKey: 'entry_id', as: 'entryImages' }); 
  }
  if (models.ProductVariation) {
    ProductEntry.hasMany(models.ProductVariation, { foreignKey: 'product_id', as: 'entryVariations' }); 
    ProductEntry.belongsTo(models.ProductVariation, { foreignKey: 'variation_id', as: 'variation' });
  }
};

module.exports = ProductEntry;