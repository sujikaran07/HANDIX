const express = require('express');
const { getEmployees, getEmployeeEIds, addEmployee, updateEmployee, deleteEmployee } = require('../../controllers/employees/employeeController');
const router = express.Router();
// Fix the import to use the correct authentication middleware
const { authMiddleware } = require('../../controllers/login/employeeLoginControllers');
const { Employee } = require('../../models/employeeModel');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { role } = req.query;
    
    if (role) {
      // If role parameter is provided, filter employees by role
      const employees = await Employee.findAll({
        where: { roleId: role === 'artisan' ? 2 : undefined },
      });
      
      res.status(200).json(employees);
    } else {
      // If no role parameter, return all employees
      const employees = await Employee.findAll();
      
      res.status(200).json(employees);
    }
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
});

router.get('/eids', getEmployeeEIds);
router.post('/', addEmployee); 
router.put('/:id', updateEmployee); 
router.delete('/:id', deleteEmployee);

module.exports = router;