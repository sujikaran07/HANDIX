
import React from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import ProductCard from './ProductCard';
import '../styles/FeaturedProducts.css'; 

const FeaturedProducts = ({ addToCart }) => {
  const featuredProducts = products.filter(product => product.featured);

  return (
    <section className="featured-products">
      <div className="container">
        <div className="text-center">
          <h2>Featured Products</h2>
          <p>
            Our most popular handcrafted items, chosen for their exceptional quality and design.
            Discover unique pieces created by skilled artisans.
          </p>
        </div>

        <div className="product-grid">
          {featuredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
            />
          ))}
        </div>

        <div className="text-center">
          <a href="/products" className="view-all">
            View All Products
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;