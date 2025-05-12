const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require('../../controllers/login/employeeLoginControllers');
const { 
  getEmployeeProfile, 
  updateEmployeeProfile, 
  updateProfilePicture, 
  changePassword 
} = require('../../controllers/employees/settingsController');
const { upload } = require('../../utils/cloudinaryConfig');

// Configure multer for temporary file uploads with custom file filter
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, and PNG files are allowed!'));
  }
}

// Get employee profile
router.get('/profile', authMiddleware, getEmployeeProfile);

// Update employee profile
router.put('/profile', authMiddleware, updateEmployeeProfile);

// Update profile picture
router.put('/profile-picture', authMiddleware, upload.single('profilePicture'), updateProfilePicture);

// Change password
router.put('/password', authMiddleware, changePassword);

module.exports = router;
