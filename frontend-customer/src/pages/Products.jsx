
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { products, categories } from '../data/products';
import ProductCard from '../components/ProductCard';
import '../styles/Products.css';

const Products = ({ addToCart }) => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortOrder, setSortOrder] = useState('featured');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 300 });
  const { category } = useParams();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    let result = [...products];

    if (category) {
      result = result.filter(product => product.category === category);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    result = result.filter(product =>
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    if (sortOrder === 'price-low-high') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-high-low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOrder === 'name-a-z') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'name-z-a') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    setFilteredProducts(result);
  }, [category, searchQuery, sortOrder, priceRange]);

  
  const currentCategory = category
    ? categories.find(cat => cat.id === category)
    : null;

  return (
    <div className="products-container">
      <div className="container">
        {}
        <div className="page-header">
          <h1 className="page-title">
            {currentCategory ? currentCategory.name : 'All Products'}
          </h1>
          {currentCategory && (
            <p className="page-description">{currentCategory.description}</p>
          )}
          {searchQuery && (
            <p className="search-results">
              Search results for: <span className="font-medium">"{searchQuery}"</span>
            </p>
          )}
        </div>

        {}
        <div className="filter-sort-controls">
          {}
          <div className="lg:hidden w-full filter-section">
            <label htmlFor="mobile-category" className="filter-label">
              Select Category
            </label>
            <select
              id="mobile-category"
              className="filter-select"
              value={category || ''}
              onChange={(e) => window.location.href = e.target.value ? `/products/${e.target.value}` : '/products'}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {}
          <div className="w-full lg:w-1/3 filter-section">
            <label htmlFor="sort-order" className="filter-label">
              Sort By
            </label>
            <select
              id="sort-order"
              className="sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="name-a-z">Name: A to Z</option>
              <option value="name-z-a">Name: Z to A</option>
            </select>
          </div>

          {}
          <div className="w-full lg:w-2/3 filter-section">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="price-range" className="filter-label">
                Price Range: ${priceRange.min} - ${priceRange.max}
              </label>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="300"
                step="10"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                className="price-slider"
              />
              <a
                href="/products"
                className="reset-button"
                onClick={(e) => {
                  e.preventDefault();
                  setPriceRange({ min: 0, max: 300 });
                }}
              >
                Reset
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {}
          <div className="hidden lg:block w-full lg:w-1/4 xl:w-1/5">
            <div className="sidebar">
              <h3 className="sidebar-title">Categories</h3>
              <ul className="category-list">
                <li>
                  <a
                    href="/products"
                    className={`category-link ${!category ? 'active' : ''}`}
                  >
                    All Products
                  </a>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <a
                      href={`/products/${cat.id}`}
                      className={`category-link ${category === cat.id ? 'active' : ''}`}
                    >
                      {cat.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {}
          <div className="w-full lg:w-3/4 xl:w-4/5">
            {filteredProducts.length === 0 ? (
              <div className="no-products">
                <h3 className="no-products-title">No products found</h3>
                <p className="no-products-text">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    addToCart={addToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;