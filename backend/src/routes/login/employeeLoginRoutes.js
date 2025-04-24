const express = require('express');
const router = express.Router();
const {
  getEmployees,
  login,
  getCurrentUser,
  authMiddleware,
  refreshToken
} = require('../../controllers/login/employeeLoginControllers');

// Login route
router.post('/', login);

// Get current user route (protected)
router.get('/me', authMiddleware, getCurrentUser);

// Get all employees (if needed)
router.get('/employees', authMiddleware, getEmployees);

// Add the refresh token route
router.post('/refresh-token', refreshToken);

module.exports = router;
