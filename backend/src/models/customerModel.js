const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcrypt');

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
  totalOrders: {
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
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: true, 
    field: 'is_email_verified'
  },
  verificationToken: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'verification_token'
  },
  verificationExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verification_expires'
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    field: 'reset_password_token',
    allowNull: true
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    field: 'reset_password_expires',
    allowNull: true
  },
  addedByAdmin: {
    type: DataTypes.VIRTUAL, // Changed from BOOLEAN to VIRTUAL
    defaultValue: false,
    get() {
      // Return based on other fields in the model
      // For example, assume admin-added if already verified without token
      return this.isEmailVerified && !this.verificationToken;
    }
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
        // Use a consistent salt rounds number (10 is standard)
        const salt = await bcrypt.genSalt(10);
        customer.password = await bcrypt.hash(customer.password, salt);
        console.log('Hashed password for new user:', customer.password.substring(0, 20) + '...');
      }
      
      // Remove references to addedByAdmin field
      if (customer.get('isEmailVerified') && customer.get('accountType') === 'Retail') {
        customer.accountStatus = 'Approved';
      }
      
      // Only approve retail accounts after email verification
      // This will be handled in the verifyEmail function
    },
    beforeUpdate: async (customer) => {
      // Only hash if password field is being modified
      if (customer.changed('password') && customer.password) {
        const salt = await bcrypt.genSalt(10);
        customer.password = await bcrypt.hash(customer.password, salt);
      }
    }
  }
});

module.exports = { Customer };
