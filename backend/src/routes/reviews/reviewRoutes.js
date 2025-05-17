const express = require('express');
const router = express.Router();
const { createReview, getArtisanReviews, respondToReview, getReviewsByStatus, getApprovedProductReviews } = require('../../controllers/reviews/reviewController');
const { upload } = require('../../utils/cloudinaryConfig');

// POST /api/reviews - Create a new review
router.post('/', upload.array('images', 5), createReview);
// GET /api/reviews?artisan_id=... - Get reviews for artisan's orders
router.get('/', getArtisanReviews);
// POST /api/reviews/respond?e_id=... - Add artisan's response to a review
router.post('/respond', respondToReview);
// GET /api/reviews/filtered?status=...&e_id=... - Get reviews filtered by status
router.get('/filtered', getReviewsByStatus);
// GET /api/reviews/product?product_id=... - Get only approved reviews for a product
router.get('/product', getApprovedProductReviews);

module.exports = router;