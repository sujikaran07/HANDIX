const express = require('express');
const { getEmployees, getEmployeeEIds, addEmployee, updateEmployee, deleteEmployee } = require('../../controllers/employees/employeeController');
const router = express.Router();

router.get('/', getEmployees);
router.get('/eids', getEmployeeEIds);
router.post('/', addEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;