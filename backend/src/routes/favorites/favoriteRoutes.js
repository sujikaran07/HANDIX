const express = require('express');
const router = express.Router();
const favoriteController = require('../../controllers/favorites/favoriteControllers');

// Get all favorites for a customer
router.get('/:customerId', favoriteController.getFavorites);

// Add product to favorites
router.post('/:customerId', favoriteController.addFavorite);

// Remove product from favorites
router.delete('/:customerId/:productId', favoriteController.removeFavorite);

// Check if a product is favorited
router.get('/:customerId/check/:productId', favoriteController.checkFavorite);

module.exports = router;
