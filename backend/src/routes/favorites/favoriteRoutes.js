const express = require('express');
const router = express.Router();
const favoriteController = require('../../controllers/favorites/favoriteControllers');

// Route: Get all favorites for a customer
router.get('/:customerId', favoriteController.getFavorites);

// Route: Add a product to favorites
router.post('/:customerId', favoriteController.addFavorite);

// Route: Remove a product from favorites
router.delete('/:customerId/:productId', favoriteController.removeFavorite);

// Route: Check if a product is in favorites
router.get('/:customerId/check/:productId', favoriteController.checkFavorite);

module.exports = router;
