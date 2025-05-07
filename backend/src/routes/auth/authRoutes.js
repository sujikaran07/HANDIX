const express = require('express');
const router = express.Router();
const {
  login,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  changePassword,
  resendVerification,
  fixAccountPassword,
  testPasswordVerification,
  emergencyLogin
} = require('../../controllers/auth/authController');

// Authentication routes
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);
router.post('/change-password', changePassword);
router.post('/resend-verification', resendVerification);
router.post('/fix-account', fixAccountPassword);
router.post('/test-password', testPasswordVerification);

// Emergency login route - development only
router.post('/emergency-login', emergencyLogin);

module.exports = router;
