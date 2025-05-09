const express = require('express');
const router = express.Router();
const favoriteController = require('../../controllers/favorites/favoriteControllers');

router.get('/:customerId', favoriteController.getFavorites);
router.post('/:customerId', favoriteController.addFavorite);
router.delete('/:customerId/:productId', favoriteController.removeFavorite);
router.get('/:customerId/check/:productId', favoriteController.checkFavorite);

module.exports = router;
