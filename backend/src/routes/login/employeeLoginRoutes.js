const express = require('express');
const router = express.Router();
const {
  getEmployees,
  login,
  getCurrentUser,
  authMiddleware,
  refreshToken
} = require('../../controllers/login/employeeLoginControllers');

router.post('/', login);

router.get('/me', authMiddleware, getCurrentUser);

router.get('/employees', authMiddleware, getEmployees);

router.post('/refresh-token', refreshToken);

module.exports = router;
