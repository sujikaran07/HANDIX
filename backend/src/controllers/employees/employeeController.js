const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../../config/db');
const { Employee } = require('../../models/employeeModel'); 
const { sendStatusChangeEmail } = require('../../utils/emailService');

Employee.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const setupAdminUser = async () => {
  const admin = await Employee.findOne({ where: { email: 'admin@gmail.com' } });
  if (!admin) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('adminpassword', salt);
    const newAdmin = await Employee.create({
      eId: 'E001',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@gmail.com',
      phone: '1234567890',
      password: hashedPassword, 
      role: 'Admin',
      profileImage: 'https://example.com/profiles/admin.jpg'
    });
  }
};

const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees' });
  }
};

const getEmployeeEIds = async (req, res) => {
  try {
    const employees = await Employee.findAll({ attributes: ['eId'] });
    const eIds = employees.map(employee => employee.eId);
    res.status(200).json(eIds);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee E-IDs' });
  }
};

const addEmployee = async (req, res) => {
  try {
    const { role, ...employeeData } = req.body;
    const newEmployee = await Employee.create({
      ...employeeData,
      roleId: role 
    });
    res.status(201).json({ newEmployee, eId: newEmployee.eId });
  } catch (error) {
    console.error('Error adding employee:', error); 
    res.status(500).json({ message: 'Error adding employee', error: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params; 
    const [updated] = await Employee.update(req.body, { where: { eId: id } }); 
    if (updated) {
      const updatedEmployee = await Employee.findOne({ where: { eId: id } }); 
      res.status(200).json(updatedEmployee); 
    } else {
      res.status(404).json({ message: 'Employee not found' }); 
    }
  } catch (error) {
    console.error('Error updating employee:', error); 
    res.status(500).json({ message: 'Error updating employee', error: error.message }); 
  }
};

const toggleEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findOne({ where: { eId: id } });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    const newStatus = employee.status === 'active' ? 'deactivated' : 'active';
    employee.status = newStatus;
    await employee.save();
    // Send status change email
    await sendStatusChangeEmail({
      to: employee.email,
      name: employee.firstName,
      role: 'employee',
      status: newStatus
    });
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling employee status', error: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeEIds,
  addEmployee,
  updateEmployee,
  toggleEmployeeStatus,
};