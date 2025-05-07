const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProfileImage = sequelize.define('ProfileImage', {
  profile_image_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'profile_image_id',
  },
  c_id: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'c_id',
    references: {
      model: 'Customers',
      key: 'c_id',
    },
    onDelete: 'CASCADE',
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'image_url',
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.fn('now')
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
    defaultValue: Sequelize.fn('now')
  }
}, {
  tableName: 'ProfileImages',
  timestamps: true,
  underscored: true,
});

module.exports = { ProfileImage };
