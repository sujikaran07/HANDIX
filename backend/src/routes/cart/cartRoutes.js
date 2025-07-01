const express = require('express');
const cartController = require('../../controllers/cart/cartController');
const router = express.Router();

// Route: Get user's cart
router.get('/:userId', cartController.getUserCart);

// Route: Add item to cart
router.post('/:userId/items', cartController.addItemToCart);

// Route: Update cart item quantity
router.patch('/:userId/items/:itemId', cartController.updateCartItem);

// Route: Remove item from cart
router.delete('/:userId/items/:itemId', cartController.removeCartItem);

// Route: Clear all items from cart
router.delete('/:userId', cartController.clearCart);

module.exports = router;
