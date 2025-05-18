const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Message = sequelize.define('Message', {
  message_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Conversations',
      key: 'conversations_id'
    }
  },
  sender_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sender_role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['customer', 'artisan']]
    }
  },
  message_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  sent_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Messages',
  timestamps: false
});

module.exports = Message;
