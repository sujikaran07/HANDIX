import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category, image, count }) => {
  return (
    <Link 
      to={`/products?category=${encodeURIComponent(category.toLowerCase())}`}
      className="flex flex-col items-center group w-full"
    >
      <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-3 sm:mb-4 transition-transform duration-300 group-hover:scale-105 shadow-md group-hover:shadow-lg">
        <img 
          src={image} 
          alt={category}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-center group-hover:text-primary transition-colors">{category}</h3>
      {count && <p className="text-xs sm:text-sm text-gray-500">{count} products</p>}
    </Link>
  );
};

export default CategoryCard;
