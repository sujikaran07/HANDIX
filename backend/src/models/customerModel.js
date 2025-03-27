const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { Address } = require('./addressModel'); // Ensure this import resolves properly
const { Order } = require('./orderModel'); // Ensure this import resolves properly

const Customer = sequelize.define('Customer', {
  c_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    unique: true, 
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  accountType: {
    type: DataTypes.ENUM({
      values: ['Retail', 'Wholesale'],
      name: 'account_type_enum'  
    }),
    defaultValue: 'Retail',
  },
  accountStatus: {
    type: DataTypes.ENUM({
      values: ['Pending', 'Approved', 'Rejected'],
      name: 'enum_Customers_account_status' 
    }),
    defaultValue: 'Pending',
  },  
  registrationDate: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalSpent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  lastOrderDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  billingAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  shippingAddress: {
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
  postalCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
}, {
  tableName: 'Customers',
  timestamps: false,  
  underscored: true,  
  getterMethods: {
    fullName() {
      return `${this.firstName} ${this.lastName}`;
    }
  },
  hooks: {
    beforeCreate: async (customer) => {
      if (customer.password) {
        const salt = await bcrypt.genSalt(10);
        customer.password = await bcrypt.hash(customer.password, salt);
      }
    },
    beforeUpdate: async (customer) => {
      if (customer.password) {
        const salt = await bcrypt.genSalt(10);
        customer.password = await bcrypt.hash(customer.password, salt);
      }
    }
  }
});

// Ensure associations are defined after all models are imported
Customer.hasMany(Address, { foreignKey: 'c_id', as: 'addresses' });
Customer.hasMany(Order, { foreignKey: 'c_id', as: 'customerOrders' });

module.exports = { Customer };
