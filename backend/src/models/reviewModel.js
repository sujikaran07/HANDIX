const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { Customer } = require('./customerModel');
const { Order } = require('./orderModel');
const Inventory = require('./inventoryModel');
const ReviewImage = require('./reviewImageModel');

const Review = sequelize.define('Review', {
  review_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'review_id',
  },
  order_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Order,
      key: 'order_id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    field: 'order_id',
  },
  product_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    references: {
      model: Inventory,
      key: 'product_id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    field: 'product_id',
  },
  c_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Customer,
      key: 'c_id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    field: 'c_id',
  },
  rating: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
    field: 'rating',
  },
  review_text: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'review_text',
  },
  review_date: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
    field: 'review_date',
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Pending', // Status can be 'Pending', 'Approved', or 'Rejected'
    field: 'status',
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true,
    field: 'images',
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'response',
  },
}, {
  tableName: 'Reviews',
  timestamps: false,
  underscored: true,
});

// Fix the associate function to prevent duplicate alias usage
Review.associate = (models) => {
  Review.belongsTo(models.Customer, { foreignKey: 'c_id', as: 'customer' });
  // Change the alias to 'orderInfo' instead of 'order' to avoid conflict
  Review.belongsTo(models.Order, { foreignKey: 'order_id', as: 'orderInfo' });
  Review.belongsTo(models.Inventory, { foreignKey: 'product_id', as: 'product' });
  Review.hasMany(models.ReviewImage || ReviewImage, { foreignKey: 'review_id', as: 'reviewImages' });
  (models.ReviewImage || ReviewImage).belongsTo(Review, { foreignKey: 'review_id', as: 'review' });
};

module.exports = Review;