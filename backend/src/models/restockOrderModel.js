const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RestockOrder = sequelize.define('RestockOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    references: {
      model: 'Inventory',
      key: 'product_id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  artisan_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    references: {
      model: 'Employees',
      key: 'e_id'
    }
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Assigned', 'In Progress', 'Completed', 'Cancelled', 'Pending'),
    defaultValue: 'Assigned'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  tableName: 'restock_orders',
  timestamps: false
});

RestockOrder.associate = (models) => {
  if (models.Inventory) {
    RestockOrder.belongsTo(models.Inventory, { foreignKey: 'product_id' });
  }
  if (models.Employee) {
    RestockOrder.belongsTo(models.Employee, { foreignKey: 'artisan_id', as: 'artisan' });
  }
};

module.exports = RestockOrder;
