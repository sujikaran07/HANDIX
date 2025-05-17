const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { Customer } = require('./customerModel');

const Order = sequelize.define('Order', {
  order_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    field: 'order_id',
  },
  c_id: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'c_id',
    references: {
      model: Customer,
      key: 'c_id',
    },
    onDelete: 'SET NULL',
  },
  orderStatus: {
    type: DataTypes.STRING,
    defaultValue: 'Pending',
    field: 'order_status',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount',
  },
  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: 'Pending',
    field: 'payment_status',
  },
  shippingMethodId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'shipping_method_id',
  },
  orderDate: {
    type: DataTypes.DATE,
    field: 'order_date',
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'customer_name',
  },
  customized: {
    type: DataTypes.STRING,
    defaultValue: 'no',
    field: 'customized',
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'payment_method',
  },
  assignedArtisan: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'assigned_artisan',
  },
  deliveryStartDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'delivery_start_date',
  },
  deliveryEndDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'delivery_end_date',
  },
}, {
  tableName: 'Orders',
  timestamps: false,
  underscored: true,
});

Order.belongsTo(Customer, { 
  foreignKey: 'c_id', 
  as: 'customerInfo'
});
module.exports = { Order };
