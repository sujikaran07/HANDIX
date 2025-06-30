const express = require('express');
const router = express.Router();
const {
  getEmployees,
  login,
  getCurrentUser,
  authMiddleware,
  refreshToken
} = require('../../controllers/login/employeeLoginControllers');

// Route: Employee login
router.post('/', login);

// Route: Get current logged-in employee info
router.get('/me', authMiddleware, getCurrentUser);

// Route: Get all employees (protected)
router.get('/employees', authMiddleware, getEmployees);

// Route: Refresh JWT token
router.post('/refresh-token', refreshToken);

module.exports = router;
