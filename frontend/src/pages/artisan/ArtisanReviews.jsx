import React, { useState, useEffect } from 'react';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import { FaStar, FaThumbsUp, FaThumbsDown, FaFilter, FaSort, FaSearch } from 'react-icons/fa';
import '../../styles/artisan/ArtisanDashboard.css';
import '../../styles/artisan/ArtisanReviews.css';

const ArtisanReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem('artisanToken');
        if (!token) {
          console.error('No token found for artisan');
          return;
        }

        // Simulate API response
        setTimeout(() => {
          // Dummy data
          const data = [
            {
              id: 1,
              customer: 'John S.',
              customerAvatar: 'https://randomuser.me/api/portraits/men/41.jpg',
              productId: 'P001',
              productName: 'Handwoven Basket',
              rating: 5,
              review: "The basket is beautifully made with incredible attention to detail. Exactly what I was looking for!",
              date: '2023-08-01T14:30:00',
              helpful: 12,
              unhelpful: 0,
              response: null
            },
            {
              id: 2,
              customer: 'Emma L.',
              customerAvatar: 'https://randomuser.me/api/portraits/women/32.jpg',
              productId: 'P002',
              productName: 'Handcrafted Wooden Bowl',
              rating: 4,
              review: 'Beautiful craftsmanship. The bowl is slightly smaller than I expected, but the quality is excellent.',
              date: '2023-07-29T09:15:00',
              helpful: 8,
              unhelpful: 1,
              response: 'Thank you for your feedback! Our product descriptions include dimensions, but we appreciate your comment about size expectations.'
            },
            {
              id: 3,
              customer: 'Michael R.',
              customerAvatar: 'https://randomuser.me/api/portraits/men/55.jpg',
              productId: 'P003',
              productName: 'Macrame Wall Hanging',
              rating: 5,
              review: "This wall hanging exceeded my expectations. The craftsmanship is top-notch and it looks amazing in my living room.",
              date: '2023-07-25T16:50:00',
              helpful: 15,
              unhelpful: 0,
              response: "We're so happy you love your wall hanging! Thank you for supporting traditional crafts."
            },
            {
              id: 4,
              customer: 'Sarah T.',
              customerAvatar: 'https://randomuser.me/api/portraits/women/65.jpg',
              productId: 'P001',
              productName: 'Handwoven Basket',
              rating: 3,
              review: 'The basket is well-made but the colors don\'t match what was shown on the website.',
              date: '2023-07-22T11:20:00',
              helpful: 4,
              unhelpful: 2,
              response: null
            },
            {
              id: 5,
              customer: 'David K.',
              customerAvatar: 'https://randomuser.me/api/portraits/men/22.jpg',
              productId: 'P004',
              productName: 'Ceramic Vase',
              rating: 5,
              review: 'Absolutely beautiful vase. The artisan is truly skilled - you can see the dedication in every detail.',
              date: '2023-07-20T13:45:00',
              helpful: 10,
              unhelpful: 0,
              response: 'Thank you for your kind words, David! We take great pride in our ceramic work.'
            },
          ];
          
          setReviews(data);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Filter and sort reviews
  const processedReviews = reviews
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
        return review.productName.toLowerCase().includes(searchLower) ||
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

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const handleAddResponse = (reviewId, response) => {
    setReviews(reviews.map(review => 
      review.id === reviewId ? { ...review, response } : review
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
          <div className="card p-4 reviews-card">
            <div className="manage-orders-header d-flex justify-content-between align-items-center mb-3">
              <div className="title-section">
                <div className="icon-and-title">
                  <FaStar className="reviews-icon" />
                  <div className="text-section">
                    <h2>Customer Reviews</h2>
                    <p>View and respond to feedback for your products</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="reviews-content">
              {isLoading ? (
                <div className="text-center my-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading reviews...</p>
                </div>
              ) : (
                <>
                  {/* Reviews summary */}
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-3 text-center border-end">
                          <h2 className="display-4 fw-bold">{calculateAverageRating()}</h2>
                          <div className="mb-2">
                            {renderStars(Math.round(calculateAverageRating()))}
                          </div>
                          <p className="text-muted">{reviews.length} total reviews</p>
                        </div>
                        <div className="col-md-9">
                          <div className="row align-items-center mb-2">
                            <div className="col-2 col-md-1 text-end">5 <FaStar className="text-warning" /></div>
                            <div className="col-8 col-md-10">
                              <div className="progress" style={{ height: '8px' }}>
                                <div className="progress-bar bg-success" style={{ width: `${reviews.filter(r => r.rating === 5).length / reviews.length * 100}%` }}></div>
                              </div>
                            </div>
                            <div className="col-2 col-md-1">{reviews.filter(r => r.rating === 5).length}</div>
                          </div>
                          <div className="row align-items-center mb-2">
                            <div className="col-2 col-md-1 text-end">4 <FaStar className="text-warning" /></div>
                            <div className="col-8 col-md-10">
                              <div className="progress" style={{ height: '8px' }}>
                                <div className="progress-bar bg-success" style={{ width: `${reviews.filter(r => r.rating === 4).length / reviews.length * 100}%` }}></div>
                              </div>
                            </div>
                            <div className="col-2 col-md-1">{reviews.filter(r => r.rating === 4).length}</div>
                          </div>
                          <div className="row align-items-center mb-2">
                            <div className="col-2 col-md-1 text-end">3 <FaStar className="text-warning" /></div>
                            <div className="col-8 col-md-10">
                              <div className="progress" style={{ height: '8px' }}>
                                <div className="progress-bar bg-warning" style={{ width: `${reviews.filter(r => r.rating === 3).length / reviews.length * 100}%` }}></div>
                              </div>
                            </div>
                            <div className="col-2 col-md-1">{reviews.filter(r => r.rating === 3).length}</div>
                          </div>
                          <div className="row align-items-center mb-2">
                            <div className="col-2 col-md-1 text-end">2 <FaStar className="text-warning" /></div>
                            <div className="col-8 col-md-10">
                              <div className="progress" style={{ height: '8px' }}>
                                <div className="progress-bar bg-danger" style={{ width: `${reviews.filter(r => r.rating === 2).length / reviews.length * 100}%` }}></div>
                              </div>
                            </div>
                            <div className="col-2 col-md-1">{reviews.filter(r => r.rating === 2).length}</div>
                          </div>
                          <div className="row align-items-center">
                            <div className="col-2 col-md-1 text-end">1 <FaStar className="text-warning" /></div>
                            <div className="col-8 col-md-10">
                              <div className="progress" style={{ height: '8px' }}>
                                <div className="progress-bar bg-danger" style={{ width: `${reviews.filter(r => r.rating === 1).length / reviews.length * 100}%` }}></div>
                              </div>
                            </div>
                            <div className="col-2 col-md-1">{reviews.filter(r => r.rating === 1).length}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-4">
                          <div className="input-group">
                            <span className="input-group-text bg-light border-0">
                              <FaSearch />
                            </span>
                            <input 
                              type="text" 
                              className="form-control border-0 bg-light" 
                              placeholder="Search reviews..." 
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="input-group">
                            <span className="input-group-text bg-light border-0">
                              <FaFilter />
                            </span>
                            <select 
                              className="form-select border-0 bg-light"
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
                          <div className="input-group">
                            <span className="input-group-text bg-light border-0">
                              <FaSort />
                            </span>
                            <select 
                              className="form-select border-0 bg-light"
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
                  </div>

                  {/* Reviews List */}
                  {processedReviews.length === 0 ? (
                    <div className="text-center my-5">
                      <FaStar size={48} className="text-muted mb-3" />
                      <h5>No reviews found</h5>
                      <p className="text-muted">There are no reviews matching your current filters.</p>
                    </div>
                  ) : (
                    <div className="reviews-list">
                      {processedReviews.map(review => (
                        <div key={review.id} className="card border-0 shadow-sm mb-4">
                          <div className="card-body">
                            <div className="d-flex mb-3">
                              <img 
                                src={review.customerAvatar} 
                                alt={review.customer} 
                                className="rounded-circle me-3"
                                width="50" 
                                height="50" 
                              />
                              <div>
                                <h5 className="mb-1">{review.customer}</h5>
                                <div className="mb-2">
                                  {renderStars(review.rating)}
                                </div>
                                <div className="text-muted small">
                                  <span className="me-3">Product: {review.productName}</span>
                                  <span>Reviewed on: {formatDate(review.date)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <p className="mb-3">{review.review}</p>
                            
                            <div className="d-flex align-items-center mb-3">
                              <div className="text-muted small me-3">
                                Was this review helpful?
                              </div>
                              <div className="me-3">
                                <button className="btn btn-sm btn-outline-secondary">
                                  <FaThumbsUp className="me-1" /> {review.helpful}
                                </button>
                              </div>
                              <div>
                                <button className="btn btn-sm btn-outline-secondary">
                                  <FaThumbsDown className="me-1" /> {review.unhelpful}
                                </button>
                              </div>
                            </div>
                            
                            {review.response && (
                              <div className="bg-light p-3 rounded mb-3">
                                <h6 className="mb-2">Your Response:</h6>
                                <p className="mb-1">{review.response}</p>
                                <div className="text-end">
                                  <button className="btn btn-sm btn-link">Edit</button>
                                </div>
                              </div>
                            )}
                            
                            {!review.response && (
                              <div className="mt-3">
                                <textarea 
                                  className="form-control mb-2" 
                                  rows="2" 
                                  placeholder="Write a response to this review..."
                                  id={`response-${review.id}`}
                                ></textarea>
                                <button 
                                  className="btn btn-sm btn-primary"
                                  onClick={() => {
                                    const responseText = document.getElementById(`response-${review.id}`).value;
                                    if (responseText.trim()) {
                                      handleAddResponse(review.id, responseText);
                                      document.getElementById(`response-${review.id}`).value = '';
                                    }
                                  }}
                                >
                                  Submit Response
                                </button>
                              </div>
                            )}
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
