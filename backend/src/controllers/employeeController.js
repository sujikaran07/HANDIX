const Employee = require('../models/employeeModel');

// Get all employees
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new employee
const addEmployee = async (req, res) => {
  const { firstName, lastName, email, phone, eId, password, role, profilePicture } = req.body;
  const newEmployee = new Employee({ firstName, lastName, email, phone, eId, password, role, profilePicture });

  try {
    const savedEmployee = await newEmployee.save();
    res.status(201).json(savedEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an employee
const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phone, eId, password, role, profilePicture } = req.body;

  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(id, { firstName, lastName, email, phone, eId, password, role, profilePicture }, { new: true });
    res.json(updatedEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an employee
const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    await Employee.findByIdAndDelete(id);
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
};
