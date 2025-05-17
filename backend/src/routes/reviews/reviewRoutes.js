const express = require('express');
const router = express.Router();
const { createReview, getArtisanReviews } = require('../../controllers/reviews/reviewController');
const { upload } = require('../../utils/cloudinaryConfig');

// POST /api/reviews - Create a new review
router.post('/', upload.array('images', 5), createReview);
// GET /api/reviews?artisan_id=... - Get reviews for artisan's orders
router.get('/', getArtisanReviews);

module.exports = router; 