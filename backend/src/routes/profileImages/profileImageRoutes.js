const express = require('express');
const router = express.Router();
const {
  uploadProfileImage,
  getProfileImage,
  deleteProfileImage
} = require('../../controllers/profileImages/profileImageController');

router.post('/:c_id', uploadProfileImage);
router.get('/:c_id', getProfileImage);
router.delete('/:c_id', deleteProfileImage);

module.exports = router;
