const pool = require("../../config/db");
const { Employee } = require('../../models/employeeModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader); // Debugging: Log the Authorization header

  if (!authHeader) {
    console.error('Authorization header missing');
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    console.error('Token missing');
    return res.status(401).json({ message: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('Decoded token:', decoded);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.error('Token expired:', error);
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    console.error('Invalid token:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const getEmployees = async (req, res) => {
  try {
    const result = await Employee.findAll();
    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching employees", err);
    res.status(500).json({ message: "Error fetching employees" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt with email: ${email}`);
  try {
    const user = await Employee.findOne({ where: { email } });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.eId, role: user.roleId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Token generated:', token); // Log the generated JWT token
    console.log('Login successful, token generated');

    // Role-based redirection logic
    let redirectUrl = '';
    let tokenKey = ''; // Key to store the token in localStorage
    if (user.roleId === 1) {
      redirectUrl = '/admin/dashboard';
      tokenKey = 'adminToken'; // Use a separate key for admin
    } else if (user.roleId === 2) {
      redirectUrl = '/artisan/dashboard';
      tokenKey = 'artisanToken'; // Use a separate key for artisan
    }

    res.json({ token, redirectUrl, tokenKey }); // Return the token key to the frontend
  } catch (error) {
    console.error(`Error logging in: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from the token
    const user = await Employee.findByPk(userId, {
      attributes: ['eId', 'firstName', 'lastName', 'email', 'roleId'], // Include eId in the response
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Failed to fetch current user' });
  }
};

const refreshToken = (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true }); // Ignore expiration
    const newToken = jwt.sign({ id: decoded.id, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token: newToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = {
  getEmployees,
  login,
  authMiddleware,
  getCurrentUser,
  refreshToken,
};
