const express = require('express');
const { getEmployees, getEmployeeEIds, addEmployee, updateEmployee, deleteEmployee } = require('../../controllers/employees/employeeController');
const router = express.Router();

router.get('/', getEmployees);
router.get('/eids', getEmployeeEIds);
router.post('/', addEmployee); // Ensure this route is correctly mapped to the addEmployee controller
router.put('/:id', updateEmployee); // Ensure this route is correctly mapped to the updateEmployee controller
router.delete('/:id', deleteEmployee);

module.exports = router;