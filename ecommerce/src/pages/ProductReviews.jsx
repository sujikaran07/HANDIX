import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { fetchProductById } from '../data/products';
import axios from 'axios';

const ProductReviews = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('highest');
  const [filterRating, setFilterRating] = useState('all');
  const [page, setPage] = useState(1);
  const reviewsPerPage = 8;
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch product details
        const productDetails = await fetchProductById(id);
        if (!productDetails) {
          setError("Product not found");
          setLoading(false);
          return;
        }
        
        setProduct(productDetails);
        
        // Use the reviews from product if already loaded
        if (productDetails.reviews && productDetails.reviews.length > 0) {
          setReviews(productDetails.reviews);
          setLoading(false);
        } else {
          // Try to fetch reviews directly if not in the product data
          try {
            const reviewsResponse = await axios.get(`http://localhost:5000/api/reviews/product?product_id=${id}`);
            if (reviewsResponse.data && reviewsResponse.data.reviews) {
              setReviews(reviewsResponse.data.reviews);
            }
          } catch (reviewError) {
            console.error('Failed to fetch additional reviews:', reviewError);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading product reviews:", err);
        setError("Failed to load reviews data");
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);
  
  // Filter reviews by rating
  const filteredReviews = reviews.filter(review => {
    if (filterRating === 'all') return true;
    return review.rating === parseInt(filterRating);
  });
  
  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
    return 0;
  });
  
  // Paginate reviews
  const indexOfLastReview = page * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = sortedReviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);
  
  // Rating summary calculation
  const calculateRatingSummary = () => {
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingCounts[review.rating]++;
      }
    });
    
    return {
      avg: reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
        : 0,
      counts: ratingCounts,
      total: reviews.length
    };
  };
  
  const ratingSummary = calculateRatingSummary();
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%] py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%] py-16 text-center">
          <p className="text-xl">{error || "Product not found"}</p>
          <Link to="/products" className="text-primary hover:underline mt-4 inline-block">
            Return to shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow py-16">
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
          {/* Breadcrumb */}
          <div className="flex items-center mb-6 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight size={14} className="mx-2" />
            <Link to="/products" className="hover:text-primary">Shop</Link>
            <ChevronRight size={14} className="mx-2" />
            <Link to={`/products/${id}`} className="hover:text-primary">{product.name}</Link>
            <ChevronRight size={14} className="mx-2" />
            <span>Reviews</span>
          </div>
          
          {/* Back to product link */}
          <div className="mb-8">
            <Link 
              to={`/products/${id}`}
              className="inline-flex items-center text-primary hover:underline"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to product
            </Link>
          </div>
          
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-6 md:items-center mb-8">
            <div className="w-full md:w-1/4">
              <div className="aspect-square overflow-hidden rounded-lg shadow-sm">
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="w-full md:w-3/4">
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center mb-3">
                <div className="flex items-center mr-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star}
                      size={18} 
                      className={`${star <= Math.round(ratingSummary.avg) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="font-medium">{ratingSummary.avg}</span>
                <span className="mx-2 text-gray-500">·</span>
                <span className="text-gray-500">{ratingSummary.total} {ratingSummary.total === 1 ? 'review' : 'reviews'}</span>
              </div>
              <p className="text-gray-600 line-clamp-2">{product.description}</p>
            </div>
          </div>
          
          {/* Rating summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Rating Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <div className="text-5xl font-bold text-primary mr-4">{ratingSummary.avg}</div>
                <div>
                  <div className="flex mb-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star}
                        size={18} 
                        className={`${star <= Math.round(ratingSummary.avg) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">
                    Based on {ratingSummary.total} {ratingSummary.total === 1 ? 'review' : 'reviews'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center">
                    <div className="w-12 text-sm">{rating} stars</div>
                    <div className="w-full mx-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ 
                            width: `${ratingSummary.total > 0 ? (ratingSummary.counts[rating] / ratingSummary.total * 100) : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-8 text-sm text-right">
                      {ratingSummary.counts[rating]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="w-full md:w-auto">
              <label className="block text-sm text-gray-600 mb-1">Filter by</label>
              <select 
                value={filterRating}
                onChange={(e) => {setFilterRating(e.target.value); setPage(1);}}
                className="w-full md:w-48 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            
            <div className="w-full md:w-auto">
              <label className="block text-sm text-gray-600 mb-1">Sort by</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-48 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
          
          {/* Reviews */}
          <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
          
          {currentReviews.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No reviews match your current filter.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-5">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                      {review.customer.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{review.customer}</p>
                      <div className="flex items-center">
                        <div className="flex mr-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star}
                              size={14} 
                              className={`${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{review.review}</p>
                  
                  {/* Review images */}
                  {review.images && review.images.length > 0 && (
                    <div className="mt-4 mb-4">
                      <h4 className="text-sm font-medium mb-2">Photos from this review</h4>
                      <div className="flex flex-wrap gap-2">
                        {review.images.map((img, idx) => (
                          <div key={idx} className="h-20 w-20 rounded-md overflow-hidden">
                            <img 
                              src={img} 
                              alt={`Review ${idx+1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Artisan response */}
                  {review.response && (
                    <div className="bg-blue-50 p-4 mt-3 rounded-md">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Artisan Response:</h4>
                      <p className="text-gray-700 text-sm">{review.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className={`flex items-center justify-center h-8 w-8 rounded-md ${
                  page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`flex items-center justify-center h-8 w-8 rounded-md ${
                    num === page 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {num}
                </button>
              ))}
              
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className={`flex items-center justify-center h-8 w-8 rounded-md ${
                  page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductReviews;
