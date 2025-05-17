const Review = require('../../models/reviewModel');
const ReviewImage = require('../../models/reviewImageModel');
const { Order } = require('../../models/orderModel');
const Inventory = require('../../models/inventoryModel');
const { Customer } = require('../../models/customerModel');
const { Employee } = require('../../models/employeeModel');
const ProductImage = require('../../models/productImageModel');
const { uploadToCloudinary } = require('../../utils/cloudinaryConfig');
const { sequelize, Sequelize } = require('../../config/db');
const Op = Sequelize.Op; // Import the operators

// Create a new review
exports.createReview = async (req, res) => {
  try {
    console.log('Review submission body:', req.body);
    console.log('Review submission files:', req.files);
    const { order_id, product_id, c_id, rating, review_text } = req.body;
    if (!order_id || !product_id || !c_id || !rating) {
      return res.status(400).json({ message: 'Missing required fields', data: { order_id, product_id, c_id, rating } });
    }
    let images = req.body.images || [];

    // If images are files (multipart/form-data), upload to Cloudinary
    if (req.files && req.files.length > 0) {
      const uploadResults = await Promise.all(
        req.files.map(async (file) => {
          const result = await uploadToCloudinary(file.path);
          return result.image_url;
        })
      );
      images = uploadResults;
    }

    // Create the review
    const review = await Review.create({
      order_id,
      product_id,
      c_id,
      rating,
      review_text,
      status: 'Pending',
    });

    // If images are provided, create ReviewImage records
    if (images && Array.isArray(images) && images.length > 0) {
      const reviewImages = images.map((url) => ({
        review_id: review.review_id,
        image_url: url,
      }));
      await ReviewImage.bulkCreate(reviewImages);
    }

    // Fetch the order to get the assigned artisan
    const order = await Order.findOne({ where: { order_id } });
    let artisanInfo = null;
    if (order && order.assignedArtisan) {
      const artisan = await Employee.findOne({ where: { eId: order.assignedArtisan } });
      if (artisan) {
        artisanInfo = {
          e_id: artisan.eId,
          firstName: artisan.firstName,
          lastName: artisan.lastName,
          email: artisan.email,
        };
      }
    }

    return res.status(201).json({
      message: 'Review submitted successfully',
      review_id: review.review_id,
      artisan: artisanInfo,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({ message: 'Failed to submit review', error: error.message });
  }
};

// GET /api/reviews?e_id=...
exports.getArtisanReviews = async (req, res) => {
  try {
    const { e_id } = req.query;
    if (!e_id) {
      return res.status(400).json({ message: 'e_id is required' });
    }
    console.log('Looking up reviews for artisan with e_id:', e_id);
    
    // First, get the employee's name since assigned_artisan stores the full name
    const employee = await Employee.findOne({ 
      where: { eId: e_id },
      attributes: ['firstName', 'lastName'] 
    });
    
    if (!employee) {
      return res.status(404).json({ 
        message: 'Artisan not found', 
        debug: { providedId: e_id } 
      });
    }
    
    // Create the full name to match against the assigned_artisan field
    const artisanFullName = `${employee.firstName} ${employee.lastName}`;
    console.log(`Looking for orders assigned to: "${artisanFullName}"`);
    
    // Find orders where assigned_artisan matches the artisan's name
    // We use LIKE query to handle partial/case sensitive matches
    const orders = await Order.findAll({ 
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('assigned_artisan')),
        'LIKE', 
        `%${artisanFullName.toLowerCase()}%`
      ),
      attributes: ['order_id', 'c_id', 'orderDate', 'customerName', 'totalAmount', 'assignedArtisan'],
      include: [
        { 
          model: Customer, 
          as: 'customerInfo',
          attributes: ['c_id', 'firstName', 'lastName', 'email'] // No profileImage
        }
      ]
    });
    
    console.log(`Found ${orders.length} orders for artisan ${artisanFullName}`);

    // If no orders found, try a direct SQL query approach
    if (orders.length === 0) {
      try {
        const [directResults] = await sequelize.query(
          `SELECT order_id, c_id, order_date as "orderDate", customer_name as "customerName", 
                  total_amount as "totalAmount", assigned_artisan as "assignedArtisan" 
           FROM "Orders" 
           WHERE LOWER(assigned_artisan) LIKE :artisanName`,
          {
            replacements: { artisanName: `%${artisanFullName.toLowerCase()}%` },
            type: sequelize.QueryTypes.SELECT
          }
        );
        
        console.log('Direct SQL query results:', directResults);
        
        // Get all assigned artisans for debugging
        const [allArtisans] = await sequelize.query(
          `SELECT DISTINCT assigned_artisan FROM "Orders" WHERE assigned_artisan IS NOT NULL`
        );
        
        return res.json({ 
          products: [], 
          message: 'No orders have been assigned to you yet',
          debug: { 
            artisanId: e_id,
            artisanName: artisanFullName,
            orderCount: orders.length,
            sqlResults: directResults ? directResults.length : 0,
            availableArtisans: allArtisans
          }
        });
      } catch (sqlError) {
        console.error('SQL query error:', sqlError);
      }
      
      return res.json({ 
        products: [], 
        message: 'No orders have been assigned to you yet',
        debug: { 
          artisanId: e_id,
          artisanName: artisanFullName,
          orderCount: orders.length
        }
      });
    }

    const orderIds = orders.map(o => o.order_id);
    console.log('Order IDs found:', orderIds);

    // Fetch all reviews for these orders with related data
    const reviews = await Review.findAll({
      where: { order_id: orderIds },
      include: [
        { 
          model: ReviewImage, 
          as: 'reviewImages' 
        },
        { 
          model: Customer, 
          as: 'customer',
          attributes: ['c_id', 'firstName', 'lastName'] // Remove profileImage
        },
        { 
          model: Inventory, 
          as: 'product',
          attributes: ['product_id', 'product_name', 'default_image_url', 'description'],
          include: [
            {
              model: ProductImage,
              as: 'productImages',
              attributes: ['image_url'],
              limit: 1,  // We just need one image
            }
          ]
        },
        {
          model: Order,
          as: 'orderInfo',
          attributes: ['order_id', 'orderDate', 'customerName', 'totalAmount']
        }
      ]
    });
    
    console.log(`Found ${reviews.length} reviews for orders handled by artisan ${e_id}`);
    
    if (reviews.length === 0) {
      return res.json({ 
        products: [], 
        message: 'No customers have left reviews for your completed orders yet',
        debug: { orderIds }
      });
    }

    // Group reviews by product for better display
    const productMap = {};
    
    reviews.forEach(review => {
      const product = review.product;
      if (!product) return;
      
      if (!productMap[product.product_id]) {
        // Set the product image, prefer default_image_url, but fallback to productImages if available
        let productImage = product.default_image_url;
        
        // Use the first productImage if available and default_image_url is missing
        if (!productImage && product.productImages && product.productImages.length > 0) {
          productImage = product.productImages[0].image_url;
        }
        
        productMap[product.product_id] = {
          id: product.product_id,
          name: product.product_name,
          image: productImage || '/placeholder-product.jpg', // Fallback image if none found
          description: product.description,
          reviews: []
        };
      }
      
      // Get customer info either from the review.customer or from the order
      const customerFirstName = review.customer?.firstName || review.orderInfo?.customerName?.split(' ')[0] || 'Anonymous';
      const customerLastName = review.customer?.lastName || review.orderInfo?.customerName?.split(' ')[1] || '';
      // Set a default avatar instead of using the non-existent profileImage field
      const customerProfileImage = null; // No profile image available
      
      productMap[product.product_id].reviews.push({
        id: review.review_id,
        customer: `${customerFirstName} ${customerLastName}`.trim(),
        customerAvatar: customerProfileImage,
        rating: review.rating,
        review: review.review_text,
        date: review.review_date,
        status: review.status, // Explicitly include the status field
        helpful: 0, // Placeholder, implement if needed
        unhelpful: 0, // Placeholder
        response: review.response,
        orderInfo: {
          orderId: review.order_id,
          orderDate: review.orderInfo?.orderDate
        },
        images: review.reviewImages ? review.reviewImages.map(img => img.image_url) : []
      });
    });
    
    // Calculate average ratings and counts for each product
    Object.values(productMap).forEach(product => {
      const ratings = product.reviews.map(r => r.rating);
      product.avgRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
      product.totalReviews = ratings.length;
      product.ratingCounts = {
        1: ratings.filter(r => r === 1).length,
        2: ratings.filter(r => r === 2).length,
        3: ratings.filter(r => r === 3).length,
        4: ratings.filter(r => r === 4).length,
        5: ratings.filter(r => r === 5).length,
      };
    });
    
    const productsResult = Object.values(productMap);
    return res.json({ 
      products: productsResult, 
      message: 'Successfully retrieved reviews',
      orderCount: orderIds.length,
      reviewCount: reviews.length
    });
  } catch (error) {
    // Add more detailed error logging
    console.error('Error fetching artisan reviews:', error);
    console.error('SQL query that caused the error:', error.sql || 'SQL not available');
    
    return res.status(500).json({ 
      message: 'Failed to fetch reviews', 
      error: error.message,
      stack: error.stack,
      // Add a user-friendly error message
      userMessage: 'There was an issue retrieving your reviews. Please try again later.'
    });
  }
};

// Add a new method to respond to reviews and update status
exports.respondToReview = async (req, res) => {
  try {
    const { review_id, response, status } = req.body;
    const { e_id } = req.query;

    if (!review_id || !e_id || (!response && !status)) {
      return res.status(400).json({ message: 'Missing required fields: review_id, status/response, and e_id' });
    }

    // Find the review
    const review = await Review.findByPk(review_id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Get the employee's name
    const employee = await Employee.findOne({ 
      where: { eId: e_id },
      attributes: ['firstName', 'lastName'] 
    });
    
    if (!employee) {
      return res.status(404).json({ message: 'Artisan not found' });
    }
    
    // Create the full name to match
    const artisanFullName = `${employee.firstName} ${employee.lastName}`;
    
    // Use LIKE instead of iLike for better compatibility
    const order = await Order.findOne({ 
      where: { 
        order_id: review.order_id,
        assigned_artisan: {
          [Op.like]: `%${artisanFullName}%` // Use Op.like instead of Op.iLike
        }
      }
    });

    if (!order) {
      // Debug query to see what artisan is actually assigned
      const orderInfo = await Order.findOne({
        where: { order_id: review.order_id },
        attributes: ['order_id', 'assignedArtisan', 'customerName']
      });
      
      return res.status(403).json({ 
        message: 'You do not have permission to respond to this review',
        debug: {
          providedEid: e_id,
          artisanName: artisanFullName,
          orderInfo: orderInfo ? {
            orderExists: true,
            assignedArtisan: orderInfo.assignedArtisan,
            customerName: orderInfo.customerName
          } : {
            orderExists: false
          }
        }
      });
    }

    // Prepare update data
    const updateData = {};
    
    // Add response if provided
    if (response) {
      updateData.response = response;
    }
    
    // Update status if provided (only allow Approved or Rejected)
    if (status && ['Approved', 'Rejected'].includes(status)) {
      updateData.status = status;
    }

    // Update the review
    await review.update(updateData);

    return res.status(200).json({
      message: 'Review updated successfully',
      review_id: review.review_id,
      response: updateData.response,
      status: updateData.status
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({ 
      message: 'Failed to update review', 
      error: error.message,
      stack: error.stack // Include stack trace for debugging
    });
  }
};

// Add new method to get reviews by status (for admin/artisan filtering)
exports.getReviewsByStatus = async (req, res) => {
  try {
    const { status, e_id } = req.query;
    
    if (!e_id) {
      return res.status(400).json({ message: 'e_id is required' });
    }
    
    // First get artisan info
    const employee = await Employee.findOne({ 
      where: { eId: e_id },
      attributes: ['firstName', 'lastName'] 
    });
    
    if (!employee) {
      return res.status(404).json({ message: 'Artisan not found' });
    }
    
    const artisanFullName = `${employee.firstName} ${employee.lastName}`;
    
    // Find orders for this artisan
    const orders = await Order.findAll({ 
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('assigned_artisan')), 
        'LIKE', 
        `%${artisanFullName.toLowerCase()}%`
      ),
      attributes: ['order_id']
    });
    
    const orderIds = orders.map(o => o.order_id);
    
    if (orderIds.length === 0) {
      return res.json({ products: [], message: 'No orders found for this artisan' });
    }
    
    // Build the where clause
    const whereClause = {
      order_id: orderIds
    };
    
    // Add status filter if provided
    if (status && ['Pending', 'Approved', 'Rejected'].includes(status)) {
      whereClause.status = status;
    }
    
    // Fetch reviews with the filter
    const reviews = await Review.findAll({
      where: whereClause,
      include: [
        { model: ReviewImage, as: 'reviewImages' },
        { model: Customer, as: 'customer', attributes: ['c_id', 'firstName', 'lastName'] },
        { model: Inventory, as: 'product', attributes: ['product_id', 'product_name', 'default_image_url'] },
        { model: Order, as: 'orderInfo', attributes: ['order_id', 'orderDate', 'customerName'] }
      ]
    });
    
    // Process reviews as in getArtisanReviews method
    // ...

    return res.json({
      reviews,
      message: `Retrieved ${reviews.length} reviews with status: ${status || 'any'}`
    });
  } catch (error) {
    console.error('Error fetching filtered reviews:', error);
    return res.status(500).json({
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

// Add this new method to get only approved reviews for public display
exports.getApprovedProductReviews = async (req, res) => {
  try {
    const { product_id } = req.query;
    
    if (!product_id) {
      return res.status(400).json({ message: 'product_id is required' });
    }
    
    // Find only approved reviews for this product
    const reviews = await Review.findAll({
      where: { 
        product_id: product_id,
        status: 'Approved'  // Only get approved reviews
      },
      include: [
        { 
          model: ReviewImage, 
          as: 'reviewImages' 
        },
        { 
          model: Customer, 
          as: 'customer',
          attributes: ['c_id', 'firstName', 'lastName'] 
        },
        {
          model: Order,
          as: 'orderInfo',
          attributes: ['order_id', 'orderDate', 'customerName']
        }
      ],
      order: [['review_date', 'DESC']] // Most recent first
    });
    
    // Calculate average rating with more precision
    let avgRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((total, review) => total + review.rating, 0);
      avgRating = sum / reviews.length;
    }
    
    // Calculate the count of each rating
    const ratingCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingCounts[review.rating]++;
      }
    });
    
    const formattedReviews = reviews.map(review => {
      const customerFirstName = review.customer?.firstName || review.orderInfo?.customerName?.split(' ')[0] || 'Anonymous';
      const customerLastName = review.customer?.lastName || review.orderInfo?.customerName?.split(' ')[1] || '';
      
      return {
        id: review.review_id,
        customer: `${customerFirstName} ${customerLastName}`.trim(),
        rating: review.rating,
        review: review.review_text,
        date: review.review_date,
        images: review.reviewImages ? review.reviewImages.map(img => img.image_url) : [],
        response: review.response // Include artisan response if any
      };
    });
    
    return res.json({
      product_id,
      avgRating: parseFloat(avgRating.toFixed(1)),
      reviewCount: reviews.length,
      ratingCounts: ratingCounts,
      reviews: formattedReviews
    });
  } catch (error) {
    console.error('Error fetching approved product reviews:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch reviews', 
      error: error.message
    });
  }
};