const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Address = sequelize.define('Address', {
  address_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  c_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Customers', 
      key: 'c_id',
    },
    onDelete: 'CASCADE',
  },
  address_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address_line_1: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  address_line_2: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  postal_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
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
  tableName: 'Addresses',
  timestamps: false,
  underscored: true,
});

Address.associate = (models) => {
  Address.belongsTo(models.Customer, { foreignKey: 'c_id', as: 'associatedCustomer' }); 
};

module.exports = { Address };
