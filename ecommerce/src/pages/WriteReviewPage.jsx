import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Star, ArrowLeft, Camera, X, AlertCircle, Check } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const WriteReviewPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [photos, setPhotos] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [artisan, setArtisan] = useState(null);

  useEffect(() => {
    // Only allow if product is present in location.state
    if (location.state?.product) {
      setProduct(location.state.product);
    } else {
      // No product info, redirect to purchases or show error
      setProduct(null);
    }
  }, [location, orderId]);

  const handleRatingClick = (value) => {
    setRating(value);
    setErrors({ ...errors, rating: false });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPhotos = files.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setPhotos(prev => [...prev, ...newPhotos].slice(0, 5)); // Limit to 5 photos
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    if (rating === 0) newErrors.rating = 'Please select a rating';
    if (reviewText.trim().length < 10) newErrors.review = 'Please write a review with at least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      // Get c_id from user object in localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const c_id = userData.c_id;
      // Defensive check for all required fields
      console.log('Submitting review:', {
        order_id: orderId,
        product_id: product?.id,
        c_id,
        rating,
        review_text: reviewText
      });
      if (!orderId || !product?.id || !c_id || !rating) {
        setErrors({ api: 'Missing required review information.' });
        setIsLoading(false);
        return;
      }
      // Log what will be sent
      const formData = new FormData();
      formData.append('order_id', orderId);
      formData.append('product_id', product.id);
      formData.append('c_id', c_id);
      formData.append('rating', rating);
      formData.append('review_text', reviewText);
      photos.forEach((photo) => {
        formData.append('images', photo.file);
      });
      const res = await fetch('/api/reviews', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setArtisan(data.artisan || null);
        setSubmitted(true);
        setTimeout(() => {
          navigate('/purchases');
        }, 3000);
      } else {
        setErrors({ api: data.message || 'Failed to submit review.' });
      }
    } catch (err) {
      setErrors({ api: 'Failed to submit review. Please try again.' });
    }
    setIsLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow bg-gray-50 py-12 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-2">Your review has been submitted successfully.</p>
            {artisan && (
              <div className="mb-4">
                <h3 className="font-semibold text-lg">Your artisan:</h3>
                <div className="text-gray-700">{artisan.firstName} {artisan.lastName}</div>
                <div className="text-gray-500 text-sm">{artisan.email}</div>
              </div>
            )}
            <button
              onClick={() => navigate('/purchases')}
              className="w-full py-3 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Purchases
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    // Redirect or show error if no product context
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow bg-gray-50 py-12 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Invalid Access</h2>
            <p className="text-gray-600 mb-4">No product information found. Please access the review page from your purchases.</p>
            <button
              onClick={() => navigate('/purchases')}
              className="w-full py-3 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Purchases
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <button 
            onClick={() => navigate('/purchases')}
            className="flex items-center text-gray-600 hover:text-primary mb-6"
          >
            <ArrowLeft size={18} className="mr-1" />
            Back to Purchases
          </button>
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Write a Review</h1>
            {errors.api && (
              <div className="mb-4 text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" /> {errors.api}
              </div>
            )}
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              {/* Rating */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">Overall Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-2xl focus:outline-none"
                    >
                      <Star
                        fill={(hoverRating || rating) >= star ? '#FFC107' : 'none'}
                        color={(hoverRating || rating) >= star ? '#FFC107' : '#D1D5DB'}
                        size={28}
                      />
                    </button>
                  ))}
                </div>
                {errors.rating && (
                  <p className="mt-2 text-red-600 text-sm flex items-center">
                    <AlertCircle size={16} className="mr-1" /> {errors.rating}
                  </p>
                )}
              </div>
              {/* Review Text */}
              <div className="mb-6">
                <label htmlFor="reviewText" className="block text-gray-700 mb-2 font-medium">
                  Write Your Review
                </label>
                <textarea
                  id="reviewText"
                  rows="4"
                  value={reviewText}
                  onChange={(e) => {
                    setReviewText(e.target.value);
                    if (e.target.value.trim().length >= 10) {
                      setErrors({ ...errors, review: false });
                    }
                  }}
                  placeholder="Share your experience with this product..."
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.review ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.review ? (
                  <p className="mt-2 text-red-600 text-sm flex items-center">
                    <AlertCircle size={16} className="mr-1" /> {errors.review}
                  </p>
                ) : (
                  <p className="mt-2 text-gray-500 text-sm">
                    Minimum 10 characters required
                  </p>
                )}
              </div>
              {/* Photo Upload */}
              <div className="mb-8">
                <label className="block text-gray-700 mb-2 font-medium">
                  Add Photos (Optional)
                </label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative w-24 h-24 border rounded-md overflow-hidden group">
                      <img src={photo.preview} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {photos.length < 5 && (
                    <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <Camera size={20} className="text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                        multiple={photos.length < 4}
                      />
                    </label>
                  )}
                </div>
                <p className="text-gray-500 text-sm">
                  You can upload up to 5 photos
                </p>
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={isLoading || !orderId || !product || !product.id || !rating}
              >
                {isLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WriteReviewPage;
