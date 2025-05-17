import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingCart, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoriteContext';

const ProductCard = ({ product, onRemove, showRemoveButton = false }) => {
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();
  
  // Enhanced debugging for rating information
  console.log('ProductCard received product with ratings:', {
    id: product?.id, 
    name: product?.name,
    rating: product?.rating,
    reviewCount: product?.reviewCount,
    ratingType: typeof product?.rating
  });

  // Check if product is valid
  if (!product || !product.id) {
    console.error('Invalid product passed to ProductCard:', product);
    return null;
  }
  
  // Check authentication status
  const isLoggedIn = () => {
    return localStorage.getItem('isAuthenticated') === 'true';
  };
  
  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is logged in
    if (!isLoggedIn()) {
      navigate('/login', { 
        state: { from: window.location.pathname, message: 'Please login to add items to favorites' } 
      });
      return;
    }
    
    toggleFavorite(product);
  };
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is logged in
    if (!isLoggedIn()) {
      // Store current URL and redirect to login
      navigate('/login', { 
        state: { 
          from: window.location.pathname,
          message: 'Please login to add items to cart' 
        } 
      });
      return;
    }
    
    // Create a cart-ready product with required properties
    const cartReadyProduct = {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      images: Array.isArray(product.images) && product.images.length > 0 
        ? product.images 
        : ['/images/placeholder.png'],
      quantity: product.quantity || 10,
      inStock: product.inStock !== false
    };
    
    // Log the prepared product for debugging
    console.log('Adding to cart from ProductCard:', cartReadyProduct);
    
    // Add to cart
    addItem(cartReadyProduct, 1);
  };
  
  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) onRemove(product.id);
  };

  // Make sure price is a number for display
  const displayPrice = Number(product.price || 0).toLocaleString();
  
  // Properly parse rating and review count to ensure they're numbers
  const rating = parseFloat(product.rating || 0);
  const reviewCount = parseInt(product.reviewCount || 0);
  // Determine if this product has any ratings
  const hasRatings = !isNaN(rating) && rating > 0 && !isNaN(reviewCount) && reviewCount > 0;

  return (
    <Link to={`/products/${product.id}`} className="group">
      <div className="bg-white overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow relative">
        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full 
            ${isFavorite && isFavorite(product.id) ? 'bg-primary text-white' : 'bg-white/80 text-gray-500 hover:text-primary'}`}
        >
          <Heart size={18} fill={isFavorite && isFavorite(product.id) ? "currentColor" : "none"} />
        </button>
        
        {/* Remove Button (for favorites page) */}
        {showRemoveButton && (
          <button
            onClick={handleRemove}
            className="absolute top-2 left-2 z-10 bg-white/80 p-1.5 rounded-full text-gray-500 hover:text-red-500"
            aria-label="Remove from favorites"
          >
            <X size={18} />
          </button>
        )}
        
        {/* Top Rated Badge */}
        {hasRatings && rating >= 4.5 && (
          <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
            Top Rated
          </div>
        )}
        
        {/* Product Image */}
        <div className="aspect-square overflow-hidden">
          <img
            src={product.images && product.images.length > 0 ? product.images[0] : '/images/placeholder.png'}
            alt={product.name || 'Product'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        {/* Product Info */}
        <div className="p-3">
          <h3 className="font-medium line-clamp-1 mb-1">{product.name || 'Unnamed Product'}</h3>
          
          <div className="flex items-center mb-1.5">
            <div className="flex items-center">
              <Star 
                size={14} 
                className={hasRatings ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
              />
              <span className="ml-1 text-xs">
                {hasRatings ? rating.toFixed(1) : "0.0"}
              </span>
            </div>
            <span className="mx-1.5 text-gray-300">|</span>
            <span className="text-xs text-gray-500">{reviewCount} reviews</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-bold text-primary">
              LKR {displayPrice}
            </span>
            
            <button
              onClick={handleAddToCart}
              className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
