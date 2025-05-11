const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { Employee } = require('./employeeModel');

const EmployeeProfile = sequelize.define('EmployeeProfile', {
  employeeProfileId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'employee_profile_id'
  },
  eId: {
    type: DataTypes.STRING(10),
    allowNull: false,
    field: 'e_id',
    references: {
      model: 'Employees',
      key: 'e_id'
    }
  },
  profileUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'profile_url'
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
  tableName: 'Employee_profiles',
  timestamps: true
});


Employee.hasOne(EmployeeProfile, {
  foreignKey: 'e_id',
  sourceKey: 'eId',
  as: 'profile',
  onDelete: 'CASCADE'
});

EmployeeProfile.belongsTo(Employee, {
  foreignKey: 'e_id',
  targetKey: 'eId', 
  as: 'employee'
});

module.exports = EmployeeProfile;
