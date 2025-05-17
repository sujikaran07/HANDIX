const Review = require('../../models/reviewModel');
const ReviewImage = require('../../models/reviewImageModel');
const { Order } = require('../../models/orderModel');
const Inventory = require('../../models/inventoryModel');
const { Customer } = require('../../models/customerModel');
const { Employee } = require('../../models/employeeModel');
const { uploadToCloudinary } = require('../../utils/cloudinaryConfig');

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
    console.log('Requested e_id:', e_id);
    // Find all orders assigned to this artisan
    const orders = await Order.findAll({ where: { assignedArtisan: e_id } });
    const orderIds = orders.map(o => o.order_id);
    console.log('Orders for artisan:', orderIds);
    if (orderIds.length === 0) {
      console.log('No orders found for this artisan.');
      return res.json({ products: [], debug: 'No orders found for this artisan.' });
    }
    // Find all reviews for these orders
    const reviews = await Review.findAll({
      where: { order_id: orderIds },
      include: [
        { model: ReviewImage, as: 'reviewImages' },
        { model: Customer, as: 'customer' },
        { model: Inventory, as: 'product' }
      ]
    });
    console.log('Reviews found:', reviews.length);
    if (reviews.length === 0) {
      console.log('No reviews found for these orders.');
      return res.json({ products: [], debug: 'No reviews found for these orders.' });
    }
    // Group reviews by product
    const productMap = {};
    reviews.forEach(review => {
      const product = review.product;
      if (!product) return;
      if (!productMap[product.product_id]) {
        productMap[product.product_id] = {
          id: product.product_id,
          name: product.product_name,
          image: product.default_image_url,
          reviews: []
        };
      }
      productMap[product.product_id].reviews.push({
        id: review.review_id,
        customer: review.customer ? `${review.customer.firstName} ${review.customer.lastName}` : 'Unknown',
        customerAvatar: null, // Add avatar if available
        rating: review.rating,
        review: review.review_text,
        date: review.review_date,
        helpful: 0, // Placeholder, add logic if needed
        unhelpful: 0, // Placeholder
        response: review.response,
        images: review.reviewImages ? review.reviewImages.map(img => img.image_url) : []
      });
    });
    const productsResult = Object.values(productMap);
    console.log('Final grouped products:', productsResult);
    return res.json({ products: productsResult, debug: 'Success', orderIds, reviewCount: reviews.length });
  } catch (error) {
    console.error('Error fetching artisan reviews:', error);
    return res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
}; 