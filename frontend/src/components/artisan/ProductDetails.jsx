import React from 'react';
import '../../styles/artisan/ProductDetails.css';

// Component for displaying detailed product information with navigation back to product list
const ProductDetails = ({ product, onBack }) => {
  return (
    <div className="product-details">
      {/* Navigation back to products list */}
      <button className="btn btn-secondary" onClick={onBack}>Back to Products</button>
      
      {/* Product information display */}
      <h2>{product.name}</h2>
      <p><strong>Category:</strong> {product.category}</p>
      <p><strong>Price:</strong> {product.price}</p>
      <p><strong>Quantity:</strong> {product.quantity}</p>
      <p><strong>Uploaded Date:</strong> {product.date}</p>
      <p><strong>Status:</strong> {product.status}</p>
    </div>
  );
};

export default ProductDetails;
