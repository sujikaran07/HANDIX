import React, { useState, useEffect } from 'react';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import { FaStar, FaThumbsUp, FaThumbsDown, FaFilter, FaSort, FaSearch, FaBox, FaReply } from 'react-icons/fa';
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

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Get artisan e_id from localStorage (adjust key as needed)
        const eId = localStorage.getItem('e_id');
        if (!eId) {
          setError('No artisan e_id found.');
          setIsLoading(false);
          return;
        }
        // Fetch reviews for products created by this artisan
        const res = await fetch(`/api/reviews?e_id=${eId}`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const data = await res.json();
        // Expecting data to be an array of products with reviews
        setProducts(data.products || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch reviews');
      }
      setIsLoading(false);
    };
    fetchReviews();
  }, []);

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
                review.review.toLowerCase().includes(searchLower) ||
                review.customer.toLowerCase().includes(searchLower);
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
      return product 
        ? { 
            avg: product.avgRating, 
            counts: product.ratingCounts, 
            total: product.totalReviews 
          }
        : { avg: 0, counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, total: 0 };
    }
  };

  const ratingData = calculateRatingData();

  const handleAddResponse = (productId, reviewId, response) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? {
            ...product,
            reviews: product.reviews.map(review =>
              review.id === reviewId ? { ...review, response } : review
            )
          }
        : product
    ));
  };

  const formatDate = (dateString) => {
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
                  <h2>Product Reviews</h2>
                  <p>View and respond to customer feedback for your handcrafted items</p>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <span className="badge bg-primary reviews-badge">{getAllReviews().length} Total Reviews</span>
              </div>
            </div>

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

            <div className="reviews-content">
              {isLoading ? (
                <div className="text-center my-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading product reviews...</p>
                </div>
              ) : error ? (
                <div className="text-center my-5">
                  <p className="text-danger">{error}</p>
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
                                  <img 
                                    src={review.productImage} 
                                    alt={review.productName} 
                                    className="product-thumbnail"
                                  />
                                  <span className="product-name">
                                    {review.productName}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            <div className="col-md-12">
                              <div className="review-content">
                                <div className="review-header">
                                  <img 
                                    src={review.customerAvatar} 
                                    alt={review.customer} 
                                    className="reviewer-avatar"
                                  />
                                  <div className="reviewer-info">
                                    <h5>{review.customer}</h5>
                                    <div className="review-meta">
                                      <div className="stars">
                                        {renderStars(review.rating)}
                                      </div>
                                      <span className="review-date">{formatDate(review.date)}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="review-text">
                                  <p>{review.review}</p>
                                </div>
                                
                                <div className="review-actions">
                                  <div className="helpful-buttons">
                                    <span className="text-muted me-2">Was this helpful?</span>
                                    <button className="btn btn-sm helpful-btn">
                                      <FaThumbsUp className="me-1" /> {review.helpful}
                                    </button>
                                    <button className="btn btn-sm not-helpful-btn">
                                      <FaThumbsDown className="me-1" /> {review.unhelpful}
                                    </button>
                                  </div>
                                </div>
                                
                                {review.response && (
                                  <div className="response-container">
                                    <div className="response-header">
                                      <FaReply className="response-icon" />
                                      <h6>Your Response</h6>
                                    </div>
                                    <p>{review.response}</p>
                                    <div className="response-actions">
                                      <button className="btn btn-sm btn-link edit-response">
                                        Edit Response
                                      </button>
                                    </div>
                                  </div>
                                )}
                                
                                {!review.response && (
                                  <div className="add-response">
                                    <div className="response-form">
                                      <textarea 
                                        className="form-control" 
                                        rows="2" 
                                        placeholder="Write a public response to this review..."
                                        id={`response-${review.id}`}
                                      ></textarea>
                                      <button 
                                        className="btn btn-sm btn-primary mt-2"
                                        onClick={() => {
                                          const responseText = document.getElementById(`response-${review.id}`).value;
                                          if (responseText.trim()) {
                                            handleAddResponse(review.productId, review.id, responseText);
                                            document.getElementById(`response-${review.id}`).value = '';
                                          }
                                        }}
                                      >
                                        <FaReply className="me-1" /> Post Response
                                      </button>
                                    </div>
                                  </div>
                                )}
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
