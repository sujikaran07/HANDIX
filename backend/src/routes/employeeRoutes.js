const express = require('express');
const router = express.Router();
const { getEmployees, addEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');

// Get all employees
router.get('/employees', getEmployees);

// Add a new employee
router.post('/employees', addEmployee);

// Update an employee
router.put('/employees/:id', updateEmployee);

// Delete an employee
router.delete('/employees/:id', deleteEmployee);

module.exports = router;
