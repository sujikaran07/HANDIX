const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../../config/db');
const { Employee } = require('../../models/employeeModel'); 

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
      roleId: role // Assuming the client sends `role` as the role ID
    });
    res.status(201).json({ newEmployee, eId: newEmployee.eId });
  } catch (error) {
    console.error('Error adding employee:', error); // Log the error for debugging
    res.status(500).json({ message: 'Error adding employee', error: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params; // Extract employee ID from the request parameters
    const [updated] = await Employee.update(req.body, { where: { eId: id } }); // Update the employee
    if (updated) {
      const updatedEmployee = await Employee.findOne({ where: { eId: id } }); // Fetch the updated employee
      res.status(200).json(updatedEmployee); // Return the updated employee
    } else {
      res.status(404).json({ message: 'Employee not found' }); // Handle case where employee is not found
    }
  } catch (error) {
    console.error('Error updating employee:', error); // Log the error for debugging
    res.status(500).json({ message: 'Error updating employee', error: error.message }); // Return error response
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Employee.destroy({ where: { eId: id } });
    if (deleted) {
      res.status(204).json();
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting employee' });
  }
};

module.exports = {
  getEmployees,
  getEmployeeEIds,
  addEmployee,
  updateEmployee,
  deleteEmployee,
};