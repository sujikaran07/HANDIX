const pool = require("../config/db");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Employee = require('../models/employeeModel'); 

// Middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Controllers
const getEmployees = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM employees");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching employees", err);
    res.status(500).json({ message: "Error fetching employees" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt with email: ${email}`);
  try {
    const employee = await Employee.findOne({ where: { email } });
    if (!employee) {
      console.log('Invalid email');
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: employee.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful');
    res.json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getEmployees,
  login,
  authMiddleware,
};
