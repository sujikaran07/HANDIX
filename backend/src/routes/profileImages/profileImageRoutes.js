const express = require('express');
const router = express.Router();
const {
  uploadProfileImage,
  getProfileImage,
  deleteProfileImage
} = require('../../controllers/profileImages/profileImageController');

// Route: Upload customer profile image
router.post('/:c_id', uploadProfileImage);

// Route: Get customer profile image
router.get('/:c_id', getProfileImage);

// Route: Delete customer profile image
router.delete('/:c_id', deleteProfileImage);

module.exports = router;
