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
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'last_name'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
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
      values: ['Personal', 'Business'],
      name: 'enum_Customers_account_type'
    }),
    defaultValue: 'Personal',
    field: 'account_type'
  },
  accountStatus: {
    type: DataTypes.ENUM({
      values: ['Pending', 'Approved', 'Rejected', 'Deactivated', 'Active'],
      name: 'enum_Customers_account_status'
    }),
    defaultValue: 'Pending',
    field: 'account_status'
  },
  registrationDate: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
    field: 'registration_date'
  },
  totalOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_orders'
  },
  totalSpent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'total_spent'
  },
  lastOrderDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_order_date'
  },

  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
    type: DataTypes.VIRTUAL,
    defaultValue: false,
    get() {
      return this.isEmailVerified && !this.verificationToken;
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
    field: 'updated_at'
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
       
        const originalPassword = String(customer.password);
        
        try {
          if (originalPassword.startsWith('$2b$') || originalPassword.startsWith('$2a$')) {
            console.log('Password appears to already be a hash, skipping hashing');
            return;
          }
          const salt = await bcrypt.genSalt(10);
          customer.password = await bcrypt.hash(originalPassword, salt);
          console.log('Hashed password for new user:', customer.password.substring(0, 20) + '...');
          
          const verifyWorks = await bcrypt.compare(originalPassword, customer.password);
          console.log('New user password verification test:', verifyWorks ? 'PASSED ✓' : 'FAILED ✗');
          
          if (!verifyWorks) {
            console.error('CRITICAL: New user password verification failed!');

            customer.password = await bcrypt.hash(originalPassword, 10);
          }
        } catch (e) {
          console.error('Password hashing error:', e);
        }
      }
      if (customer.get('isEmailVerified') && ['Personal', 'personal', 'Retail', 'retail'].includes(customer.get('accountType'))) {
        customer.accountStatus = 'Approved';
      }
    },
    beforeUpdate: async (customer) => {
      if (customer.changed('password') && customer.password) {
        if (customer.password.startsWith('$2b$') || customer.password.startsWith('$2a$')) {
          console.log('Update: password appears to already be a hash, skipping hashing');
          return;
        }
        const originalPassword = String(customer.password);
        
        try {
          const salt = await bcrypt.genSalt(10);
          customer.password = await bcrypt.hash(originalPassword, salt);
          
          const verifyWorks = await bcrypt.compare(originalPassword, customer.password);
          console.log('Updated password verification test:', verifyWorks ? 'PASSED ✓' : 'FAILED ✗');
          
          if (!verifyWorks) {
            console.error('CRITICAL: Updated password verification failed!');

            customer.password = await bcrypt.hash(originalPassword, 10);
          }
        } catch (e) {
          console.error('Password update error:', e);
        }
      }
    }
  }
});

module.exports = { Customer };
