const express = require('express');
const { login, refreshToken } = require('../../controllers/login/employeeLoginControllers'); // Corrected import path
const router = express.Router();

router.post('/', login);
router.post('/refresh-token', refreshToken); // Add route for refreshing token

module.exports = router;
