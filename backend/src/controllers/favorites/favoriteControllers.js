const Favorite = require('../../models/favoriteModel');
const Inventory = require('../../models/inventoryModel');
const ProductImage = require('../../models/productImageModel');
const { sequelize } = require('../../config/db');

// Get all favorites for a customer
exports.getFavorites = async (req, res) => {
  try {
    const { customerId } = req.params;

    console.log("Fetching favorites for customer:", customerId);

    // Get favorites with product details
    const favorites = await Favorite.findAll({
      where: { c_id: customerId },
      include: [
        {
          model: Inventory,
          as: 'product',
          include: [
            { model: ProductImage, as: 'productImages' }
          ]
        }
      ],
      order: [['date_added', 'DESC']]
    });

    console.log("Raw database response:", favorites.map(f => ({
      favoriteId: f.favorite_id,
      productId: f.product_id,
      unitPrice: f.product?.unit_price,
      price: f.product?.price
    })));

    // Format response
    const formattedFavorites = favorites.map(favorite => {
      const product = favorite.product;
      const images = product.productImages.map(img => img.image_url);
      
      // Use unit_price from the inventory table as the price field
      const productPrice = Number(product.unit_price || product.price || 0);
      
      return {
        id: product.product_id,
        name: product.product_name,
        price: productPrice,
        category: product.category,
        images: images.length ? images : ['/images/placeholder.png'],
        inStock: product.quantity > 0,
        rating: product.rating || 0,
        reviewCount: product.review_count || 0,
        favoriteId: favorite.favorite_id,
        dateAdded: favorite.date_added,
        quantity: product.quantity
      };
    });

    // Debug the first product to see price values
    if (formattedFavorites.length > 0) {
      console.log('First favorite formatted data:', {
        id: formattedFavorites[0].id,
        name: formattedFavorites[0].name,
        price: formattedFavorites[0].price,
        priceType: typeof formattedFavorites[0].price
      });
    }

    res.status(200).json(formattedFavorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Failed to fetch favorites', error: error.message });
  }
};

// Add a product to favorites
exports.addFavorite = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { customerId } = req.params;
    const { productId } = req.body;

    // No middleware check anymore - just use customerId from URL params
    // Skip the authorization check since we're not using middleware

    // Check if the favorite already exists
    const existingFavorite = await Favorite.findOne({
      where: {
        c_id: customerId,
        product_id: productId
      },
      transaction
    });

    if (existingFavorite) {
      await transaction.rollback();
      return res.status(409).json({ message: 'Product is already in favorites' });
    }

    // Create new favorite
    const favorite = await Favorite.create({
      c_id: customerId,
      product_id: productId
    }, { transaction });

    await transaction.commit();
    
    res.status(201).json({
      message: 'Product added to favorites',
      favoriteId: favorite.favorite_id
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error adding favorite:', error);
    res.status(500).json({ message: 'Failed to add product to favorites', error: error.message });
  }
};

// Remove a product from favorites
exports.removeFavorite = async (req, res) => {
  try {
    const { customerId, productId } = req.params;
    
    // No middleware check - use customerId from URL params

    const result = await Favorite.destroy({
      where: {
        c_id: customerId,
        product_id: productId
      }
    });

    if (result === 0) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.status(200).json({ message: 'Product removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ message: 'Failed to remove product from favorites', error: error.message });
  }
};

// Check if a product is in favorites
exports.checkFavorite = async (req, res) => {
  try {
    const { customerId, productId } = req.params;
    
    // No middleware check - use customerId from URL params

    const favorite = await Favorite.findOne({
      where: {
        c_id: customerId,
        product_id: productId
      }
    });

    res.status(200).json({
      isFavorite: !!favorite,
      favoriteId: favorite ? favorite.favorite_id : null
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({ message: 'Failed to check favorite status', error: error.message });
  }
};
