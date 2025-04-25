const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProductImage = sequelize.define('ProductImage', {
  product_image_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    references: {
      model: 'Inventory', 
      key: 'product_id',
    },
    onDelete: 'NO ACTION',
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  entry_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'ProductEntries',
      key: 'entry_id',
    },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'ProductImages',
  timestamps: false,
  underscored: true,
});

ProductImage.associate = (models) => {
  if (models.ProductEntry) {
    ProductImage.belongsTo(models.ProductEntry, { foreignKey: 'entry_id', as: 'productEntry' }); 
  }
  if (models.Inventory) {
    ProductImage.belongsTo(models.Inventory, { foreignKey: 'product_id', as: 'product' });
  }
};

module.exports = ProductImage;
