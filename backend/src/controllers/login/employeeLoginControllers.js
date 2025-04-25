const pool = require("../../config/db");
const { Employee } = require('../../models/employeeModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Token received in request:', token); 

    if (!token) {
      console.error('Authorization token is missing');
      return res.status(401).json({ error: 'Authorization token is required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded); 
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.error('Authorization token has expired');
        return res.status(401).json({ error: 'Authorization token has expired' });
      }
      console.error('Error verifying token:', error.message);
      return res.status(401).json({ error: 'Invalid authorization token' });
    }
  } catch (error) {
    console.error('Unexpected error in authMiddleware:', error.message);
    res.status(500).json({ error: 'Internal server error in authMiddleware' });
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

    const token = jwt.sign({ id: user.eId, role: user.roleId }, process.env.JWT_SECRET, { expiresIn: '3h' });
    console.log('Token generated:', token);
    console.log('Login successful, token generated');


    let redirectUrl = '';
    let tokenKey = ''; 
    if (user.roleId === 1) {
      redirectUrl = '/admin/dashboard';
      tokenKey = 'adminToken'; 
    } else if (user.roleId === 2) {
      redirectUrl = '/artisan/dashboard';
      tokenKey = 'artisanToken'; 
    }

    res.json({ token, redirectUrl, tokenKey }); 
  } catch (error) {
    console.error(`Error logging in: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Employee.findByPk(userId, {
      attributes: ['eId', 'firstName', 'lastName', 'email', 'roleId'], 
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

const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }
    
    
    let decoded;
    try {
     
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
      decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const newToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      JWT_SECRET,
      { expiresIn: '3h' }  
    );
    
    res.status(200).json({ token: newToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
};

module.exports = {
  getEmployees,
  login,
  authMiddleware,
  getCurrentUser,
  refreshToken,
};
