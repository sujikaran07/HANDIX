const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Attachment = sequelize.define('Attachment', {
  attachment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  message_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  file_path: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  file_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'Attachments',
  timestamps: false,
});

module.exports = Attachment; 