const express = require('express');
const cartController = require('../../controllers/cart/cartController');
const router = express.Router();

router.get('/:userId', cartController.getUserCart);

router.post('/:userId/items', cartController.addItemToCart);

router.patch('/:userId/items/:itemId', cartController.updateCartItem);

router.delete('/:userId/items/:itemId', cartController.removeCartItem);

router.delete('/:userId', cartController.clearCart);

module.exports = router;
