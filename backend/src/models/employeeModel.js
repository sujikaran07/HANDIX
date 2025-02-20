const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const Employee = sequelize.define('Employee', {
  eId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING },
  password: { type: DataTypes.TEXT, allowNull: false },
  role: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: {
      isIn: [['Admin', 'Artisan']]
    }
  },
  profileImage: { type: DataTypes.TEXT },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
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
    const newAdmin = await Employee.create({
      eId: 'E001',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@gmail.com',
      phone: '1234567890',
      password: 'adminpassword', 
      role: 'Admin',
      profileImage: 'https://example.com/profiles/admin.jpg'
    });
  }
};

module.exports = { Employee, setupAdminUser };
