const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Review = require('./reviewModel');

const ReviewImage = sequelize.define('ReviewImage', {
  image_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'image_id',
  },
  review_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Review,
      key: 'review_id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    field: 'review_id',
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'image_url',
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
    field: 'uploaded_at',
  },
}, {
  tableName: 'ReviewImages',
  timestamps: false,
  underscored: true,
});

// No associate function needed here; handled in reviewModel.js

module.exports = ReviewImage; 