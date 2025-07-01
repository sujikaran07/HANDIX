const Inventory = require('../../models/inventoryModel');
const Category = require('../../models/categoryModel');
const ProductEntry = require('../../models/productEntryModel');
const ProductImage = require('../../models/productImageModel');
const Review = require('../../models/reviewModel');

// Get inventory with images, categories, and review stats
const getInventory = async (req, res) => {
  try {
    console.log("Fetching inventory with images");

    const inventory = await Inventory.findAll({
      include: [
        {
          model: ProductEntry,
          as: 'inventoryEntries',
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['category_name']
            }
          ]
        },
        {
          model: ProductImage,
          as: 'productImages',
          attributes: ['image_url']
        }
      ],
      attributes: ['product_id', 'product_name', 'quantity', 'unit_price', 'description', 'product_status', 'date_added', 'default_image_url', 'customization_available'],
    });
    
    console.log(`Found ${inventory.length} inventory items`);
    
    if (inventory.length > 0) {
      const firstItem = inventory[0];
      console.log(`First item (${firstItem.product_id}) has ${firstItem.productImages ? firstItem.productImages.length : 0} images`);
      console.log(`Default image URL: ${firstItem.default_image_url || 'none'}`);
    }
    
    const formattedInventory = inventory.map(item => {
      const entry = item.inventoryEntries && item.inventoryEntries[0];
      const category = entry ? entry.category : null;
      
      const images = [];
      
      if (item.default_image_url) {
        images.push(item.default_image_url);
        console.log(`Added default image for ${item.product_id}: ${item.default_image_url}`);
      }
      
      if (item.productImages && item.productImages.length > 0) {
        item.productImages.forEach(img => {
          if (img.image_url && !images.includes(img.image_url)) {
            images.push(img.image_url);
            console.log(`Added product image for ${item.product_id}: ${img.image_url}`);
          }
        });
      }
      
      const result = {
        ...item.toJSON(),
        category: category,
        images: images,
        inventoryEntries: undefined,
        productImages: undefined
      };
      
      console.log(`Product ${item.product_id} has ${images.length} images`);
      return result;
    });
    
    // After formatting inventory, fetch and add review data
    try {
      // Get all product IDs
      const productIds = formattedInventory.map(item => item.product_id);
      
      // Fetch only approved reviews for these products
      const reviews = await Review.findAll({
        where: { 
          product_id: productIds,
          status: 'Approved'
        },
        attributes: ['product_id', 'rating']
      });
      
      console.log(`Found ${reviews.length} approved reviews for ${productIds.length} products`);
      
      // Calculate average rating and count for each product
      const reviewStats = {};
      reviews.forEach(review => {
        if (!reviewStats[review.product_id]) {
          reviewStats[review.product_id] = {
            totalRating: 0,
            count: 0
          };
        }
        reviewStats[review.product_id].totalRating += review.rating;
        reviewStats[review.product_id].count++;
      });
      
      // Add rating data to each inventory item
      formattedInventory.forEach(item => {
        const stats = reviewStats[item.product_id];
        if (stats && stats.count > 0) {
          item.rating = parseFloat((stats.totalRating / stats.count).toFixed(1));
          item.review_count = stats.count;
          console.log(`Added rating ${item.rating} (${item.review_count} reviews) to product ${item.product_id}`);
        } else {
          item.rating = 0;
          item.review_count = 0;
        }
      });
    } catch (reviewError) {
      console.error('Error adding review data to inventory:', reviewError);
      // Continue with the inventory data we have, just without ratings
    }
    
    res.status(200).json({ inventory: formattedInventory });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory', message: error.message });
  }
};

// Get public inventory with images and review stats
const getPublicInventory = async (req, res) => {
  try {
    // Fetch product data with related models
    const inventoryItems = await Inventory.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['category_name', 'category_id']
        },
        {
          model: ProductImage,
          as: 'productImages',
          attributes: ['image_url']
        }
      ],
      attributes: [
        'product_id', 'product_name', 'description', 'unit_price', 
        'quantity', 'customization_available', 'default_image_url', 'product_status'
      ]
    });
    
    // Format inventory items (similar to getInventory)
    let formattedItems = inventoryItems.map(item => {
      // Format image data
      const images = [];
      if (item.default_image_url) images.push(item.default_image_url);
      if (item.productImages) {
        item.productImages.forEach(img => {
          if (img.image_url && !images.includes(img.image_url)) {
            images.push(img.image_url);
          }
        });
      }
      
      return {
        ...item.toJSON(),
        images,
        productImages: undefined
      };
    });
    
    // After fetching inventory items, add review data
    try {
      // Get all product IDs
      const productIds = formattedItems.map(item => item.product_id);
      
      // Fetch only approved reviews for these products
      const reviews = await Review.findAll({
        where: { 
          product_id: productIds,
          status: 'Approved'
        },
        attributes: ['product_id', 'rating']
      });
      
      // Calculate average rating and count for each product
      const reviewStats = {};
      reviews.forEach(review => {
        if (!reviewStats[review.product_id]) {
          reviewStats[review.product_id] = {
            totalRating: 0,
            count: 0
          };
        }
        reviewStats[review.product_id].totalRating += review.rating;
        reviewStats[review.product_id].count++;
      });
      
      // Add rating data to each inventory item
      formattedItems = formattedItems.map(item => {
        const stats = reviewStats[item.product_id];
        if (stats && stats.count > 0) {
          return {
            ...item,
            rating: parseFloat((stats.totalRating / stats.count).toFixed(1)),
            review_count: stats.count
          };
        }
        return {
          ...item,
          rating: 0,
          review_count: 0
        };
      });
    } catch (reviewError) {
      console.error('Error adding review data to public inventory:', reviewError);
    }
    
    res.status(200).json({
      message: "Public inventory retrieved successfully",
      inventory: formattedItems
    });
  } catch (error) {
    console.error('Error fetching public inventory:', error);
    res.status(500).json({
      message: "Error fetching inventory",
      error: error.message
    });
  }
};

module.exports = {
  getInventory,
  getPublicInventory
};
