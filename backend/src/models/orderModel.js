const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { Customer } = require('./customerModel');
const { OrderDetail } = require('./orderDetailModel');

const Order = sequelize.define('Order', {
  o_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    field: 'order_id',
    defaultValue: Sequelize.literal(`'O' || LPAD(nextval('order_id_seq')::text, 3, '0')`),
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
    defaultValue: Sequelize.NOW,
    field: 'order_date',
  },
  deliveryDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'delivery_date',
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
}, {
  tableName: 'Orders',
  timestamps: false,
  underscored: true,
});

Order.belongsTo(Customer, { foreignKey: 'c_id', as: 'customer' });
Order.hasMany(OrderDetail, { foreignKey: 'o_id', as: 'orderDetails' });

module.exports = { Order };
