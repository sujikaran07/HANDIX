const express = require('express');
const cartController = require('../../controllers/cart/cartController');
const router = express.Router();

// Get user's cart
router.get('/:userId', cartController.getUserCart);

// Add item to cart
router.post('/:userId/items', cartController.addItemToCart);

// Update cart item quantity
router.patch('/:userId/items/:itemId', cartController.updateCartItem);

// Remove item from cart
router.delete('/:userId/items/:itemId', cartController.removeCartItem);

// Clear all items from cart
router.delete('/:userId', cartController.clearCart);

module.exports = router;
