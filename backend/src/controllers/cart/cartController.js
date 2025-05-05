const Cart = require('../../models/cartModel');
const CartItem = require('../../models/cartItemModel');
const Inventory = require('../../models/inventoryModel');
const ProductImage = require('../../models/productImageModel');
const { Customer } = require('../../models/customerModel');
const ProductVariation = require('../../models/productVariationModel');
const { sequelize } = require('../../config/db');

// Get cart for a user
exports.getUserCart = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const customer = await Customer.findByPk(userId);
    if (!customer) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find or create an active cart for the user
    let [cart, created] = await Cart.findOrCreate({
      where: {
        c_id: userId,
        status: 'active'
      },
      defaults: {
        c_id: userId,
        status: 'active'
      }
    });

    // Get cart items with product details
    const cartItems = await CartItem.findAll({
      where: { cart_id: cart.cart_id },
      include: [
        {
          model: Inventory,
          as: 'product',
          include: [
            {
              model: ProductImage,
              as: 'productImages',
              attributes: ['image_url']
            }
          ]
        }
      ],
      order: [['added_at', 'DESC']]
    });

    // Format the response
    const formattedItems = await Promise.all(cartItems.map(async (item) => {
      const product = item.product;
      const images = product.productImages.map(img => img.image_url);
      
      // Get variation details if size is specified
      let variationDetails = null;
      if (item.size) {
        const variation = await ProductVariation.findOne({
          where: {
            product_id: product.product_id,
            size: item.size
          }
        });
        if (variation) {
          variationDetails = {
            size: variation.size,
            additionalPrice: parseFloat(variation.additional_price || 0),
            stockLevel: variation.stock_level
          };
        }
      }

      return {
        itemId: item.cart_item_id,
        product: {
          id: product.product_id,
          name: product.product_name,
          price: parseFloat(item.unit_price),
          images: images.length ? images : ['/images/placeholder.png'],
          category: product.category,
          customizationFee: product.customization_fee ? parseFloat(product.customization_fee) : 0,
          isCustomizable: product.customizable
        },
        quantity: item.quantity,
        customization: item.customization || null,
        selectedSize: item.size || null,
        selectedVariation: variationDetails,
        addedAt: item.added_at
      };
    }));

    // Calculate cart totals
    const subtotal = formattedItems.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0);
    
    const customizationTotal = formattedItems.reduce((sum, item) => 
      sum + (item.customization && item.product.customizationFee ? 
        item.product.customizationFee * item.quantity : 0), 0);
    
    const total = subtotal + customizationTotal;
    const itemCount = formattedItems.reduce((sum, item) => sum + item.quantity, 0);

    return res.status(200).json({
      cartId: cart.cart_id,
      items: formattedItems,
      subtotal,
      customizationTotal,
      total,
      itemCount,
      createdAt: cart.created_at,
      updatedAt: cart.updated_at
    });
  } catch (error) {
    console.error('Error getting user cart:', error);
    return res.status(500).json({ message: 'Failed to retrieve cart' });
  }
};

// Add item to cart
exports.addItemToCart = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { userId } = req.params;
    const { productId, quantity, customization, size, price } = req.body;

    if (!productId || !quantity || !price) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate that the product exists
    const product = await Inventory.findByPk(productId);
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find or create user's active cart
    const [cart, created] = await Cart.findOrCreate({
      where: {
        c_id: userId,
        status: 'active'
      },
      defaults: {
        c_id: userId,
        status: 'active'
      },
      transaction
    });

    // Check if this product already exists in the cart
    let cartItem = await CartItem.findOne({
      where: {
        cart_id: cart.cart_id,
        product_id: productId,
        customization: customization || null,
        size: size || null
      },
      transaction
    });

    if (cartItem) {
      // Update existing item
      cartItem.quantity += quantity;
      await cartItem.save({ transaction });
    } else {
      // Create new cart item
      cartItem = await CartItem.create({
        cart_id: cart.cart_id,
        product_id: productId,
        quantity,
        unit_price: price,
        customization: customization || null,
        size: size || null
      }, { transaction });
    }

    // Update cart timestamp
    await Cart.update(
      { updated_at: new Date() },
      { where: { cart_id: cart.cart_id }, transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      message: 'Item added to cart successfully',
      cartItemId: cartItem.cart_item_id
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error adding item to cart:', error);
    return res.status(500).json({ message: 'Failed to add item to cart' });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    // Find the user's active cart
    const cart = await Cart.findOne({
      where: {
        c_id: userId,
        status: 'active'
      }
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find and update the cart item
    const cartItem = await CartItem.findOne({
      where: {
        cart_item_id: itemId,
        cart_id: cart.cart_id
      }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    // Update cart timestamp
    await Cart.update(
      { updated_at: new Date() },
      { where: { cart_id: cart.cart_id } }
    );

    return res.status(200).json({
      message: 'Cart item updated successfully',
      itemId: cartItem.cart_item_id,
      quantity: cartItem.quantity
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return res.status(500).json({ message: 'Failed to update cart item' });
  }
};

// Remove item from cart
exports.removeCartItem = async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    // Find the user's active cart
    const cart = await Cart.findOne({
      where: {
        c_id: userId,
        status: 'active'
      }
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Delete the cart item
    const result = await CartItem.destroy({
      where: {
        cart_item_id: itemId,
        cart_id: cart.cart_id
      }
    });

    if (result === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Update cart timestamp
    await Cart.update(
      { updated_at: new Date() },
      { where: { cart_id: cart.cart_id } }
    );

    return res.status(200).json({
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    return res.status(500).json({ message: 'Failed to remove item from cart' });
  }
};

// Clear all items from cart
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user's active cart
    const cart = await Cart.findOne({
      where: {
        c_id: userId,
        status: 'active'
      }
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Delete all cart items
    await CartItem.destroy({
      where: {
        cart_id: cart.cart_id
      }
    });

    // Update cart timestamp
    await Cart.update(
      { updated_at: new Date() },
      { where: { cart_id: cart.cart_id } }
    );

    return res.status(200).json({
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({ message: 'Failed to clear cart' });
  }
};
