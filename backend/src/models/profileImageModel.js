const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { Customer } = require('./customerModel');

const ProfileImage = sequelize.define('ProfileImage', {
  profile_image_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  c_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Customer,
      key: 'c_id',
    },
    onDelete: 'CASCADE',
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
}, {
  tableName: 'ProfileImages',
  timestamps: false,
  underscored: true,
});

module.exports = { ProfileImage };
