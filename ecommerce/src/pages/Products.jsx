import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import ProductGrid from '../components/ProductGrid';
import { fetchProducts, categories } from '../data/products';

const ProductsPage = () => {
  // State for products, filters, UI
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minRating, setMinRating] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        console.log('Products loaded:', data);
        setProducts(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Parse URL params for category
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    
    if (categoryParam) {
      // Find matching category (case-insensitive)
      const matchedCategory = categories.find(
        cat => cat.toLowerCase() === categoryParam.toLowerCase()
      );
      
      if (matchedCategory) {
        setSelectedCategory(matchedCategory);
      }
    }
  }, [location.search]);

  // Apply filters when dependencies change
  useEffect(() => {
    if (products.length > 0) {
      applyFilters();
    }
  }, [products, selectedCategory, priceRange, minRating, searchTerm]);

  // Filter logic
  const applyFilters = () => {
    let result = [...products];
    
    // Apply category filter
    if (selectedCategory) {
      result = result.filter(p => 
        p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Apply price range filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    
    // Apply rating filter
    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term)) ||
        (p.category && p.category.toLowerCase().includes(term))
      );
    }
    
    setFilteredProducts(result);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory(null);
    setPriceRange([0, 10000]);
    setMinRating(0);
    setSearchTerm('');
    
    // Also clear URL parameters
    const url = new URL(window.location);
    url.searchParams.delete('category');
    window.history.pushState({}, '', url);
  };
  
  // Handle category selection and update URL
  const handleCategoryChange = (category) => {
    // If already selected, clear the selection
    if (selectedCategory === category) {
      setSelectedCategory(null);
      
      // Update URL to remove category parameter
      const url = new URL(window.location);
      url.searchParams.delete('category');
      window.history.pushState({}, '', url);
    } else {
      setSelectedCategory(category);
      
      // Update URL to include category parameter
      const url = new URL(window.location);
      url.searchParams.set('category', category.toLowerCase());
      window.history.pushState({}, '', url);
    }
  };
  
  // Toggle filter sidebar
  const toggleFilters = () => {
    setFilterOpen(!filterOpen);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow py-16">
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
          {/* Header and search */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">
              {selectedCategory ? `${selectedCategory} Products` : 'Shop All Products'}
            </h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-primary"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
          
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Mobile filter button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={toggleFilters}
                className="w-full flex items-center justify-center space-x-2 border border-gray-300 rounded-md py-2"
              >
                <SlidersHorizontal size={18} />
                <span>Filters</span>
              </button>
            </div>
            
            {/* Filters sidebar (desktop always visible, mobile conditional) */}
            <div className={`
              lg:block
              ${filterOpen ? 'block' : 'hidden'}
              lg:col-span-1 mb-6 lg:mb-0
            `}>
              <div className="bg-white p-4 shadow-sm rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Filters</h2>
                  <button 
                    onClick={clearFilters}
                    className="text-primary text-sm hover:underline"
                  >
                    Clear all
                  </button>
                </div>
                
                {/* Categories filter */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label key={category} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === category}
                          onChange={() => handleCategoryChange(category)}
                          className="mr-2 accent-primary"
                        />
                        <span>{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Price range filter */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Price Range (LKR)</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full p-2 border rounded-md"
                      min="0"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full p-2 border rounded-md"
                      min={priceRange[0]}
                    />
                  </div>
                </div>
                
                {/* Rating filter */}
                <div>
                  <h3 className="font-medium mb-3">Minimum Rating</h3>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="0">Any Rating</option>
                    <option value="4.5">4.5 & above</option>
                    <option value="4">4.0 & above</option>
                    <option value="3.5">3.5 & above</option>
                    <option value="3">3.0 & above</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Products grid */}
            <div className="lg:col-span-3">
              {selectedCategory && (
                <div className="mb-4">
                  <div className="inline-flex items-center bg-blue-50 text-primary px-3 py-1 rounded-full">
                    <span className="mr-2">{selectedCategory}</span>
                    <button 
                      onClick={() => handleCategoryChange(selectedCategory)}
                      className="focus:outline-none"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
              
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600">
                  {loading ? 'Loading products...' : `Showing ${filteredProducts.length} products`}
                </p>
                <select className="border rounded-md p-2">
                  <option>Sort by: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating: High to Low</option>
                  <option>Newest First</option>
                </select>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 p-4 rounded-md text-red-600 text-center">
                  <p>{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 text-primary hover:underline"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <ProductGrid products={filteredProducts} />
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductsPage;