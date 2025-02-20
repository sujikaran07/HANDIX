const express = require("express");
const { Employee } = require('../models/employeeModel');
const router = express.Router();
const { getEmployees, authMiddleware } = require("../controllers/employeeLoginControllers");

router.get("/employees", authMiddleware, getEmployees);

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const employee = await Employee.findOne({ where: { email } });
    if (employee && (await employee.matchPassword(password))) {
      res.json({
        eId: employee.eId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        profileImage: employee.profileImage,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
