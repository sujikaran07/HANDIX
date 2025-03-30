const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  product_id: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    allowNull: false,
    defaultValue: Sequelize.literal(`'P' || lpad(nextval('product_id_seq')::text, 3, '0')`),
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
}, {
  tableName: 'Products',
  timestamps: false,
  underscored: true,
});

Product.associate = (models) => {
  Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
  Product.hasMany(models.ProductVariation, { foreignKey: 'product_id', as: 'variations' });
};

module.exports = Product; // Ensure the model is exported directly
