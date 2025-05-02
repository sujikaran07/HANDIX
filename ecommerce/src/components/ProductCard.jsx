import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProductCard = ({ product }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if product is in favorites
    const savedFavorites = localStorage.getItem('handixFavorites');
    if (savedFavorites) {
      const favorites = JSON.parse(savedFavorites);
      const isInFavorites = favorites.some((fav) => fav.id === product.id);
      setIsFavorite(isInFavorites);
    }
  }, [product.id]);

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    let favorites = [];
    const savedFavorites = localStorage.getItem('handixFavorites');
    
    if (savedFavorites) {
      favorites = JSON.parse(savedFavorites);
    }
    
    if (isFavorite) {
      // Remove from favorites
      favorites = favorites.filter((fav) => fav.id !== product.id);
      toast({
        title: "Removed from favorites",
        description: `${product.name} has been removed from your favorites`,
      });
    } else {
      // Add to favorites
      favorites.push(product);
      toast({
        title: "Added to favorites",
        description: `${product.name} has been added to your favorites`,
      });
    }
    
    localStorage.setItem('handixFavorites', JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="product-card group w-full h-full transition-all">
      <Link to={`/products/${product.id}`} className="relative block w-full">
        <div className="relative h-52 sm:h-56 md:h-60 overflow-hidden rounded-t-md">
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {!product.inStock && (
            <div className="stock-badge stock-badge-out">
              Out of Stock
            </div>
          )}
          {product.inStock && (
            <div className="stock-badge stock-badge-in">
              In Stock
            </div>
          )}
          {product.isCustomizable && (
            <div className="customizable-badge">
              Customizable
            </div>
          )}
          <button 
            onClick={toggleFavorite}
            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart 
              size={18} 
              className={`${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'} transition-colors`} 
            />
          </button>
        </div>
      </Link>

      <div className="p-3 sm:p-4 border-x border-b rounded-b-md">
        <div className="flex items-center justify-between mb-2">
          <Link to={`/products?category=${product.category.toLowerCase()}`} className="text-xs sm:text-sm text-gray-500 category-badge">
            {product.category}
          </Link>
          <div className="product-rating flex items-center">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs sm:text-sm ml-1">{product.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <Link to={`/products/${product.id}`}>
          <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-1 hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <p className="price-tag text-sm sm:text-base font-semibold text-gray-900">
          LKR {product.price.toLocaleString()}
          {product.isCustomizable && (
            <span className="text-xs text-gray-500 ml-2 block sm:inline">
              +Customization available
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
