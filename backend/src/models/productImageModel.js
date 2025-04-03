const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProductImage = sequelize.define('ProductImage', {
  image_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    references: {
      model: 'Products',
      key: 'product_id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName: 'ProductImages',
  timestamps: false,
  underscored: true,
});

ProductImage.associate = (models) => {
  if (models.Product) {
    ProductImage.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' }); // Define reverse association
  }
};

module.exports = ProductImage;
