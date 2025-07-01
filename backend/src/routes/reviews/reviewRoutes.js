const express = require('express');
const router = express.Router();
const { createReview, getArtisanReviews, respondToReview, getReviewsByStatus, getApprovedProductReviews } = require('../../controllers/reviews/reviewController');
const { upload } = require('../../utils/cloudinaryConfig');

// Route: Create a new review (with optional images)
router.post('/', upload.array('images', 5), createReview);

// Route: Get reviews for artisan's orders
router.get('/', getArtisanReviews);

// Route: Add artisan's response to a review
router.post('/respond', respondToReview);

// Route: Get reviews filtered by status
router.get('/filtered', getReviewsByStatus);

// Route: Get only approved reviews for a product
router.get('/product', getApprovedProductReviews);

module.exports = router;