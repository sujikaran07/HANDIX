const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const bcrypt = require('bcrypt');

const Employee = sequelize.define("Employee", {
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
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const setupAdminUser = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123';
    const adminUser = await Employee.findOne({ where: { email: adminEmail } });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await Employee.create({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        phoneNumber: '1234567890',
        role: 'admin',
        password: hashedPassword,
      });
      console.log('Admin user created.');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (error) {
    console.error('Error setting up admin user:', error);
    throw error;
  }
};

module.exports = { Employee, setupAdminUser };
