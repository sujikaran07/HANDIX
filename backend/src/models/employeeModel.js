const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const Employee = sequelize.define('Employee', {
  eId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    unique: true,
    field: 'e_id',
    defaultValue: sequelize.literal(`'E' || lpad(nextval('employee_seq')::text, 3, '0')`)
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
    type: DataTypes.STRING 
  },
  password: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  roleId: { 
    type: DataTypes.INTEGER,
    field: 'role_id',
    references: {
      model: 'Roles', 
      key: 'role_id'
    },
    onUpdate: 'CASCADE', 
    onDelete: 'SET NULL'
  },
  createdAt: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW,
    field: 'created_at' 
  },
  updatedAt: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW,
    field: 'updated_at' 
  }
}, {
  hooks: {
    beforeSave: async (employee) => {
      if (employee.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        employee.password = await bcrypt.hash(employee.password, salt);
      }
    }
  }
});

Employee.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const setupAdminUser = async () => {
  const admin = await Employee.findOne({ where: { email: 'admin@gmail.com' } });
  if (!admin) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('adminpassword', salt);
    const newAdmin = await Employee.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@gmail.com',
      phone: '1234567890',
      password: hashedPassword, 
      roleId: 1, 
      profileImage: 'https://example.com/profiles/admin.jpg'
    });
  }
};

module.exports = { Employee, setupAdminUser };