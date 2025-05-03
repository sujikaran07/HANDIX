const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/authController');

// Authentication routes
router.post('/login', authController.login);
router.post('/resend-verification', authController.resendVerification);

module.exports = router;
