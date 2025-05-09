const Cart = require('../../models/cartModel');
const CartItem = require('../../models/cartItemModel');
const Inventory = require('../../models/inventoryModel');
const ProductImage = require('../../models/productImageModel');
const { Customer } = require('../../models/customerModel');
const ProductVariation = require('../../models/productVariationModel');
const { sequelize } = require('../../config/db');

exports.getUserCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const customer = await Customer.findByPk(userId);
    if (!customer) {
      return res.status(404).json({ message: 'User not found' });
    }

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

    const formattedItems = await Promise.all(cartItems.map(async (item) => {
      const product = item.product;
      const images = product.productImages.map(img => img.image_url);
      
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

exports.addItemToCart = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { userId } = req.params;
    const { productId, quantity, customization, price } = req.body;

    if (!productId || !quantity || !price) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const product = await Inventory.findByPk(productId);
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }

    const availableQuantity = product.quantity || 0;
    const safeQuantity = Math.min(quantity, availableQuantity);

    if (safeQuantity <= 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Product is out of stock' });
    }

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

    let cartItem = await CartItem.findOne({
      where: {
        cart_id: cart.cart_id,
        product_id: productId,
        customization: customization || null
      },
      transaction
    });

    if (cartItem) {

      const newQuantity = Math.min(cartItem.quantity + safeQuantity, availableQuantity);
      cartItem.quantity = newQuantity;
      await cartItem.save({ transaction });
    } else {
      cartItem = await CartItem.create({
        cart_id: cart.cart_id,
        product_id: productId,
        quantity: safeQuantity,
        unit_price: price,
        customization: customization || null
      }, { transaction });
      
      console.log(`Cart item created with customization: ${customization || 'None'}, quantity: ${safeQuantity}/${availableQuantity}`);
    }

    await Cart.update(
      { updated_at: new Date() },
      { where: { cart_id: cart.cart_id }, transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      message: 'Item added to cart successfully',
      cartItemId: cartItem.cart_item_id,
      customization: cartItem.customization,
      quantity: cartItem.quantity,
      availableQuantity
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error adding item to cart:', error);
    return res.status(500).json({ message: 'Failed to add item to cart' });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const cart = await Cart.findOne({
      where: {
        c_id: userId,
        status: 'active'
      }
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const cartItem = await CartItem.findOne({
      where: {
        cart_item_id: itemId,
        cart_id: cart.cart_id
      },
      include: [{
        model: Inventory,
        as: 'product'
      }]
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    const availableQuantity = cartItem.product.quantity || 0;
    const safeQuantity = Math.min(quantity, availableQuantity);
    
    if (safeQuantity <= 0) {
      return res.status(400).json({ 
        message: 'Product is out of stock',
        availableQuantity
      });
    }

    cartItem.quantity = safeQuantity;
    await cartItem.save();

    await Cart.update(
      { updated_at: new Date() },
      { where: { cart_id: cart.cart_id } }
    );

    return res.status(200).json({
      message: 'Cart item updated successfully',
      itemId: cartItem.cart_item_id,
      quantity: cartItem.quantity,
      availableQuantity
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return res.status(500).json({ message: 'Failed to update cart item' });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    const cart = await Cart.findOne({
      where: {
        c_id: userId,
        status: 'active'
      }
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const result = await CartItem.destroy({
      where: {
        cart_item_id: itemId,
        cart_id: cart.cart_id
      }
    });

    if (result === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

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

exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({
      where: {
        c_id: userId,
        status: 'active'
      }
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    await CartItem.destroy({
      where: {
        cart_id: cart.cart_id
      }
    });

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
