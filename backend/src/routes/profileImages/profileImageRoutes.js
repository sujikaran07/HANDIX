const express = require('express');
const router = express.Router();
const {
  uploadProfileImage,
  getProfileImage,
  deleteProfileImage
} = require('../../controllers/profileImages/profileImageController');

// Upload/update profile image
router.post('/:c_id', uploadProfileImage);

// Get profile image
router.get('/:c_id', getProfileImage);

// Delete profile image
router.delete('/:c_id', deleteProfileImage);

module.exports = router;
