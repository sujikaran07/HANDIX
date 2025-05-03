const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/authController');

// Authentication routes
router.post('/login', authController.login);
router.post('/resend-verification', authController.resendVerification);

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-otp', authController.verifyResetOTP);
router.post('/reset-password', authController.resetPassword);

// Password change route
router.post('/change-password', authController.changePassword);

// Make the emergency fix available without auth middleware
router.post('/fix-account', authController.fixAccountPassword);

// Development-only routes
if (process.env.NODE_ENV !== 'production') {
  router.post('/fix-account', authController.fixAccountPassword);
  router.post('/test-password', authController.testPasswordVerification);
}

module.exports = router;
