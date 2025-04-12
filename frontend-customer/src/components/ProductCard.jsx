
import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import '../styles/ProductCard.css';

const ProductCard = ({ product, addToCart }) => {
  const { id, name, price, image, category, featured } = product;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <div className="product-card group">
      <Link to={`/product/${id}`} className="block">
        <div className="product-image">
          <img src={image} alt={name} />
          {featured && (
            <span className="featured-badge">Featured</span>
          )}
        </div>
        <div className="product-details">
          <h3 className="product-title">{name}</h3>
          <div className="product-price-category">
            <p className="product-price">${price.toFixed(2)}</p>
            <span className="product-category">{category.replace('-', ' ')}</span>
          </div>
          <button
            onClick={handleAddToCart}
            className="add-to-cart"
          >
            <FaShoppingCart className="add-to-cart-icon" />
            Add to Cart
          </button>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;