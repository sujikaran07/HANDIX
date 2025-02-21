const express = require('express');
const { getEmployees, addEmployee, updateEmployee, deleteEmployee } = require('../../controllers/employees/employeeController'); // Corrected import path
const router = express.Router();

router.get('/', getEmployees);
router.post('/', addEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;