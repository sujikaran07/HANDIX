import React, { useState, useEffect } from 'react';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import { FaStar, FaThumbsUp, FaThumbsDown, FaFilter, FaSort, FaSearch, FaBox, FaReply, FaCheck, FaImage } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../../styles/artisan/ArtisanDashboard.css';
import '../../styles/artisan/ArtisanReviews.css';

const ArtisanReviews = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [responseText, setResponseText] = useState({});
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage('');
    
    try {
      // Get artisan ID from the various possible storage locations
      // Based on what we see in employeeLoginControllers.js, artisans likely use artisanToken
      let eId = null;
      
      // Try to get the JWT token first
      const artisanToken = localStorage.getItem('artisanToken') || sessionStorage.getItem('artisanToken');
      
      if (artisanToken) {
        // If token exists, try to decode it to get the ID
        try {
          // JWT tokens have three parts separated by dots
          const tokenParts = artisanToken.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            eId = payload.id; // The ID will be in the payload
            console.log('Found eId from token:', eId);
          }
        } catch (err) {
          console.error('Error decoding token:', err);
        }
      }
      
      // If no eId from token, try direct storage
      if (!eId) {
        eId = localStorage.getItem('eId') || 
              sessionStorage.getItem('eId') || 
              localStorage.getItem('e_id') || 
              sessionStorage.getItem('e_id') ||
              localStorage.getItem('employee_id') ||
              sessionStorage.getItem('employee_id');
      
        // Final attempt - check if there's an employee object with ID
        if (!eId) {
          const employeeStr = localStorage.getItem('employee') || sessionStorage.getItem('employee');
          if (employeeStr) {
            try {
              const employee = JSON.parse(employeeStr);
              eId = employee.eId || employee.id || employee.e_id || employee.employee_id;
            } catch (err) {
              console.error('Error parsing employee object:', err);
            }
          }
        }
      }
    
      if (!eId) {
        console.error('No artisan ID found in storage', {
          localStorage: Object.keys(localStorage),
          sessionStorage: Object.keys(sessionStorage)
        });
        setError('No artisan ID found. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      console.log('Using artisan ID for reviews:', eId);
      
      // Fetch reviews for products handled by this artisan
      const response = await axios.get(`/api/reviews?e_id=${eId}`);
      console.log('Review API response:', response.data);
    
      const { products, message, debug } = response.data;
    
      if (debug) {
        console.log('Debug info from API:', debug);
      }
    
      if (products && products.length > 0) {
        setProducts(products);
      } else {
        setProducts([]);
        const debugInfo = debug ? ` (${JSON.stringify(debug)})` : '';
        setStatusMessage(`${message || 'No reviews found for your orders.'}${debugInfo}`);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch reviews');
    
      // Add more detailed debugging for network errors
      if (err.response) {
        console.error('Error response:', {
          status: err.response.status,
          data: err.response.data
        });
      } else if (err.request) {
        console.error('No response received:', err.request);
      }
    }
    
    setIsLoading(false);
  };

  // Get all reviews across all products
  const getAllReviews = () => {
    return products.flatMap(product => 
      product.reviews.map(review => ({
        ...review,
        productId: product.id,
        productName: product.name,
        productImage: product.image
      }))
    );
  };

  // Filter and sort reviews
  const getFilteredReviews = () => {
    let reviewsToProcess = selectedProduct === 'all' 
      ? getAllReviews()
      : products.find(p => p.id === selectedProduct)?.reviews.map(review => ({
          ...review,
          productId: selectedProduct,
          productName: products.find(p => p.id === selectedProduct)?.name,
          productImage: products.find(p => p.id === selectedProduct)?.image
        })) || [];
    
    return reviewsToProcess
      .filter(review => {
        // Filter by rating
        if (filterRating !== 'all') {
          if (filterRating === '5' && review.rating !== 5) return false;
          if (filterRating === '4' && review.rating !== 4) return false;
          if (filterRating === '3' && review.rating !== 3) return false;
          if (filterRating === '1-2' && review.rating > 2) return false;
        }
        
        // Filter by search term
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return review.productName?.toLowerCase().includes(searchLower) ||
                review.review?.toLowerCase().includes(searchLower) ||
                review.customer?.toLowerCase().includes(searchLower) ||
                review.orderInfo?.orderId?.toLowerCase().includes(searchLower);
        }
        
        // Filter by status
        if (statusFilter !== 'all') {
          return review.status === statusFilter;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort by selected option
        if (sortBy === 'newest') {
          return new Date(b.date) - new Date(a.date);
        }
        if (sortBy === 'oldest') {
          return new Date(a.date) - new Date(b.date);
        }
        if (sortBy === 'highest') {
          return b.rating - a.rating;
        }
        if (sortBy === 'lowest') {
          return a.rating - b.rating;
        }
        if (sortBy === 'most-helpful') {
          return b.helpful - a.helpful;
        }
        
        return 0;
      });
  };

  const filteredReviews = getFilteredReviews();

  // Calculate average rating for the selected product or all products
  const calculateRatingData = () => {
    if (products.length === 0) return { avg: 0, counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, total: 0 };
    
    if (selectedProduct === 'all') {
      // Calculate overall stats
      const allReviews = getAllReviews();
      const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let sum = 0;
      
      allReviews.forEach(review => {
        counts[review.rating] = (counts[review.rating] || 0) + 1;
        sum += review.rating;
      });
      
      return {
        avg: allReviews.length > 0 ? (sum / allReviews.length).toFixed(1) : 0,
        counts,
        total: allReviews.length
      };
    } else {
      // Return stats for selected product
      const product = products.find(p => p.id === selectedProduct);
      if (!product) return { avg: 0, counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, total: 0 };
      
      return { 
        avg: product.avgRating || 0, 
        counts: product.ratingCounts || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, 
        total: product.totalReviews || 0 
      };
    }
  };

  const ratingData = calculateRatingData();

  const handleResponseChange = (reviewId, text) => {
    setResponseText(prev => ({
      ...prev,
      [reviewId]: text
    }));
  };

  const handleSubmitResponse = async (productId, reviewId) => {
    if (!responseText[reviewId] || responseText[reviewId].trim() === '') {
      toast.error('Response cannot be empty');
      return;
    }

    setSubmittingResponse(true);
    try {
      // Use the same token retrieval logic as in fetchReviews
      let eId = null;
      
      // Try to get the JWT token first
      const artisanToken = localStorage.getItem('artisanToken') || sessionStorage.getItem('artisanToken');
      
      if (artisanToken) {
        try {
          const tokenParts = artisanToken.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            eId = payload.id;
          }
        } catch (err) {
          console.error('Error decoding token:', err);
        }
      }
      
      if (!eId) {
        eId = localStorage.getItem('eId') || 
              sessionStorage.getItem('eId') || 
              localStorage.getItem('e_id') || 
              sessionStorage.getItem('e_id');
      }
      
      if (!eId) {
        toast.error('Session expired. Please log in again.');
        return;
      }

      await axios.post(`/api/reviews/respond?e_id=${eId}`, {
        review_id: reviewId,
        response: responseText[reviewId]
      });
      
      // Update local state
      setProducts(products.map(product => 
        product.id === productId 
          ? {
              ...product,
              reviews: product.reviews.map(review =>
                review.id === reviewId 
                  ? { ...review, response: responseText[reviewId] } 
                  : review
              )
            }
          : product
      ));
      
      // Clear the response text
      setResponseText(prev => ({
        ...prev,
        [reviewId]: ''
      }));
      
      toast.success('Response added successfully');
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error(error.response?.data?.message || 'Failed to submit response');
    } finally {
      setSubmittingResponse(false);
    }
  };

  // Add new functions to handle approve/reject
  const handleStatusChange = async (productId, reviewId, status) => {
    setSubmittingResponse(true);
    try {
      let eId = null;
      // Use the same token retrieval logic as in handleSubmitResponse
      const artisanToken = localStorage.getItem('artisanToken') || sessionStorage.getItem('artisanToken');
      
      if (artisanToken) {
        try {
          const tokenParts = artisanToken.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            eId = payload.id;
          }
        } catch (err) {
          console.error('Error decoding token:', err);
        }
      }
      
      if (!eId) {
        eId = localStorage.getItem('eId') || 
              sessionStorage.getItem('eId') || 
              localStorage.getItem('e_id') || 
              sessionStorage.getItem('e_id');
      }
      
      if (!eId) {
        toast.error('Session expired. Please log in again.');
        return;
      }

      // Log the request for debugging
      console.log(`Sending request to update review ${reviewId} status to ${status}`);

      const response = await axios.post(`/api/reviews/respond?e_id=${eId}`, {
        review_id: reviewId,
        status: status
      });
      
      console.log('Status update response:', response.data);
      
      // Update local state - make sure product with ID exists and the review is in the reviews array
      const updatedProducts = [...products];
      let reviewUpdated = false;
      
      for (const product of updatedProducts) {
        const reviewIndex = product.reviews.findIndex(r => r.id === reviewId);
        if (reviewIndex !== -1) {
          product.reviews[reviewIndex] = {
            ...product.reviews[reviewIndex],
            status: status
          };
          reviewUpdated = true;
          break;
        }
      }
      
      if (reviewUpdated) {
        setProducts(updatedProducts);
        toast.success(`Review ${status === 'Approved' ? 'approved' : 'rejected'} successfully`);
      } else {
        console.error(`Could not find review ${reviewId} in local products state`);
        // Refresh data to ensure UI reflects current server state
        fetchReviews();
      }
    } catch (error) {
      console.error(`Error ${status.toLowerCase()}ing review:`, error);
      toast.error(error.response?.data?.message || `Failed to ${status.toLowerCase()} review`);
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleEditResponse = (reviewId, currentResponse) => {
    setResponseText(prev => ({
      ...prev,
      [reviewId]: currentResponse
    }));
    
    // Find the review and set response to null to show the edit form
    setProducts(products.map(product => ({
      ...product,
      reviews: product.reviews.map(review =>
        review.id === reviewId 
          ? { ...review, isEditing: true } 
          : review
      )
    })));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < rating ? "text-warning" : "text-muted"} />
    ));
  };

  return (
    <div className="artisan-reviews-page">
      <ArtisanSidebar />
      <div className="artisan-main-content">
        <ArtisanTopBar />
        
        <div className="container mt-4 reviews-container">
          <div className="card reviews-card">
            <div className="reviews-header d-flex justify-content-between align-items-center mb-0">
              <div className="title-section d-flex align-items-center">
                <FaStar className="reviews-icon" />
                <div className="text-section">
                  <h2>Your Order Reviews</h2>
                  <p>View and respond to customer feedback for products from orders you've completed</p>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <span className="badge bg-primary reviews-badge">{getAllReviews().length} Total Reviews</span>
              </div>
            </div>

            {products.length > 0 && (
              <div className="product-filter-bar">
                <div className="product-selector">
                  <div className="product-selector-label">
                    <FaBox className="icon" />
                    <span>Select Product:</span>
                  </div>
                  <div className="product-dropdown-wrapper">
                    <select
                      className="form-select product-select"
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                      <option value="all">All Products ({getAllReviews().length} reviews)</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.reviews.length} reviews)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="reviews-content">
              {isLoading ? (
                <div className="text-center my-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading product reviews...</p>
                </div>
              ) : error ? (
                <div className="text-center my-5 error-message">
                  <p className="text-danger">{error}</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center my-5 no-reviews">
                  <FaStar size={64} className="text-muted mb-3" />
                  <h4>No customers have left reviews for your completed orders yet</h4>
                  <p className="text-muted">Once customers leave reviews for orders you've completed, they'll appear here.</p>
                </div>
              ) : (
                <>
                  {/* Reviews summary */}
                  <div className="review-summary">
                    <div className="row align-items-center">
                      <div className="col-md-3 text-center">
                        <div className="rating-card">
                          <h2 className="display-3 fw-bold">{ratingData.avg}</h2>
                          <div className="mb-2 rating-stars">
                            {renderStars(Math.round(ratingData.avg))}
                          </div>
                          <p className="text-muted">{ratingData.total} total reviews</p>
                        </div>
                      </div>
                      <div className="col-md-9">
                        <div className="rating-bars">
                          <div className="row align-items-center mb-2">
                            <div className="col-2 col-md-1 text-end">5 <FaStar className="text-warning" /></div>
                            <div className="col-8 col-md-9">
                              <div className="progress">
                                <div className="progress-bar bg-success" style={{ width: `${ratingData.total > 0 ? (ratingData.counts[5] / ratingData.total * 100) : 0}%` }}></div>
                              </div>
                            </div>
                            <div className="col-2 col-md-2">{ratingData.counts[5]} ({ratingData.total > 0 ? Math.round(ratingData.counts[5] / ratingData.total * 100) : 0}%)</div>
                          </div>
                          <div className="row align-items-center mb-2">
                            <div className="col-2 col-md-1 text-end">4 <FaStar className="text-warning" /></div>
                            <div className="col-8 col-md-9">
                              <div className="progress">
                                <div className="progress-bar bg-success" style={{ width: `${ratingData.total > 0 ? (ratingData.counts[4] / ratingData.total * 100) : 0}%` }}></div>
                              </div>
                            </div>
                            <div className="col-2 col-md-2">{ratingData.counts[4]} ({ratingData.total > 0 ? Math.round(ratingData.counts[4] / ratingData.total * 100) : 0}%)</div>
                          </div>
                          <div className="row align-items-center mb-2">
                            <div className="col-2 col-md-1 text-end">3 <FaStar className="text-warning" /></div>
                            <div className="col-8 col-md-9">
                              <div className="progress">
                                <div className="progress-bar bg-warning" style={{ width: `${ratingData.total > 0 ? (ratingData.counts[3] / ratingData.total * 100) : 0}%` }}></div>
                              </div>
                            </div>
                            <div className="col-2 col-md-2">{ratingData.counts[3]} ({ratingData.total > 0 ? Math.round(ratingData.counts[3] / ratingData.total * 100) : 0}%)</div>
                          </div>
                          <div className="row align-items-center mb-2">
                            <div className="col-2 col-md-1 text-end">2 <FaStar className="text-warning" /></div>
                            <div className="col-8 col-md-9">
                              <div className="progress">
                                <div className="progress-bar bg-danger" style={{ width: `${ratingData.total > 0 ? (ratingData.counts[2] / ratingData.total * 100) : 0}%` }}></div>
                              </div>
                            </div>
                            <div className="col-2 col-md-2">{ratingData.counts[2]} ({ratingData.total > 0 ? Math.round(ratingData.counts[2] / ratingData.total * 100) : 0}%)</div>
                          </div>
                          <div className="row align-items-center">
                            <div className="col-2 col-md-1 text-end">1 <FaStar className="text-warning" /></div>
                            <div className="col-8 col-md-9">
                              <div className="progress">
                                <div className="progress-bar bg-danger" style={{ width: `${ratingData.total > 0 ? (ratingData.counts[1] / ratingData.total * 100) : 0}%` }}></div>
                              </div>
                            </div>
                            <div className="col-2 col-md-2">{ratingData.counts[1]} ({ratingData.total > 0 ? Math.round(ratingData.counts[1] / ratingData.total * 100) : 0}%)</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="review-filters">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <div className="input-group search-reviews">
                          <span className="input-group-text">
                            <FaSearch size={14} />
                          </span>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Search reviews..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="input-group filter-rating">
                          <span className="input-group-text">
                            <FaFilter size={14} />
                          </span>
                          <select 
                            className="form-select"
                            value={filterRating}
                            onChange={(e) => setFilterRating(e.target.value)}
                          >
                            <option value="all">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="1-2">1-2 Stars</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="input-group sort-reviews">
                          <span className="input-group-text">
                            <FaSort size={14} />
                          </span>
                          <select 
                            className="form-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                          >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest">Highest Rating</option>
                            <option value="lowest">Lowest Rating</option>
                            <option value="most-helpful">Most Helpful</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  {filteredReviews.length === 0 ? (
                    <div className="empty-reviews">
                      <FaStar size={48} className="text-muted mb-3" />
                      <h5>No reviews found</h5>
                      <p className="text-muted">There are no reviews matching your current filters.</p>
                    </div>
                  ) : (
                    <div className="reviews-list">
                      {filteredReviews.map(review => (
                        <div key={review.id} className="review-card">
                          <div className="row">
                            {selectedProduct === 'all' && (
                              <div className="col-md-12 mb-3">
                                <div className="product-info-banner">
                                  {review.productImage ? (
                                    <img 
                                      src={review.productImage} 
                                      alt={review.productName} 
                                      className="product-thumbnail"
                                      onError={(e) => {
                                        e.target.src = '/placeholder-product.jpg'; // Fallback image on error
                                        e.target.onerror = null; // Prevent infinite loop
                                      }}
                                    />
                                  ) : (
                                    <div className="placeholder-image">
                                      <FaBox size={24} />
                                    </div>
                                  )}
                                  <span className="product-name">
                                    {review.productName}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            <div className="col-md-12">
                              <div className="review-content">
                                <div className="review-header">
                                  <div className="reviewer-avatar">
                                    {review.customerAvatar ? (
                                      <img src={review.customerAvatar} alt={review.customer} />
                                    ) : (
                                      <div className="default-avatar">
                                        {review.customer ? review.customer.charAt(0) : 'A'}
                                      </div>
                                    )}
                                  </div>
                                  <div className="reviewer-info">
                                    <h5>{review.customer}</h5>
                                    <div className="review-meta">
                                      <div className="stars">
                                        {renderStars(review.rating)}
                                      </div>
                                      <span className="review-date">
                                        {formatDate(review.date)}
                                      </span>
                                      {review.orderInfo && (
                                        <span className="order-info">
                                          Order: {review.orderInfo.orderId}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="review-text">
                                  <p>{review.review}</p>
                                  
                                  {review.images && review.images.length > 0 && (
                                    <div className="review-images">
                                      <div className="images-label">
                                        <FaImage className="me-1" /> Customer Photos:
                                      </div>
                                      <div className="image-gallery">
                                        {review.images.map((img, idx) => (
                                          <div key={idx} className="review-image-container">
                                            <img src={img} alt={`Review ${idx+1}`} />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                {review.response && !review.isEditing ? (
                                  <div className="response-container">
                                    <div className="response-header">
                                      <FaReply className="response-icon" />
                                      <h6>Your Response</h6>
                                    </div>
                                    <p>{review.response}</p>
                                    <div className="response-actions">
                                      <button 
                                        className="btn btn-sm btn-link edit-response"
                                        onClick={() => handleEditResponse(review.id, review.response)}
                                      >
                                        Edit Response
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="add-response">
                                    <div className="response-header">
                                      <FaReply className="response-icon" />
                                      <h6>{review.response ? 'Edit Your Response' : 'Add Your Response'}</h6>
                                    </div>
                                    <div className="response-form">
                                      <textarea 
                                        className="form-control" 
                                        rows="3" 
                                        placeholder="Write a public response to this review..."
                                        value={responseText[review.id] || ''}
                                        onChange={(e) => handleResponseChange(review.id, e.target.value)}
                                      ></textarea>
                                      <button 
                                        className="btn btn-primary mt-2"
                                        onClick={() => handleSubmitResponse(review.productId, review.id)}
                                        disabled={submittingResponse || !responseText[review.id] || responseText[review.id].trim() === ''}
                                      >
                                        {submittingResponse ? (
                                          <>
                                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                            Submitting...
                                          </>
                                        ) : review.response ? (
                                          <>
                                            <FaCheck className="me-1" /> Save Changes
                                          </>
                                        ) : (
                                          <>
                                            <FaReply className="me-1" /> Post Response
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Add review status indicator and actions */}
                              <div className="review-status-controls mt-3">
                                <div className="d-flex align-items-center justify-content-between">
                                  <div>
                                    <span className={`badge bg-${
                                      review.status === 'Approved' ? 'success' : 
                                      review.status === 'Rejected' ? 'danger' : 'warning'
                                    } me-2`}>
                                      {review.status || 'Pending'}
                                    </span>
                                  </div>
                                  <div className="review-action-buttons">
                                    <button 
                                      className="btn btn-sm btn-outline-success me-2"
                                      onClick={() => handleStatusChange(review.productId, review.id, 'Approved')}
                                      disabled={submittingResponse || review.status === 'Approved'}
                                    >
                                      <i className="fas fa-check me-1"></i> 
                                      {review.status === 'Approved' ? 'Approved' : 'Approve'}
                                    </button>
                                    <button 
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => handleStatusChange(review.productId, review.id, 'Rejected')}
                                      disabled={submittingResponse || review.status === 'Rejected'}
                                    >
                                      <i className="fas fa-times me-1"></i>
                                      {review.status === 'Rejected' ? 'Rejected' : 'Reject'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisanReviews;
