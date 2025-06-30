import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, ArrowRight, ShoppingBag, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import ProductSection from '../components/ProductSection';
import CategoryCard from '../components/CategoryCard';
import { fetchProducts } from '../data/products';
import { Progress } from '../components/ui/progress';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallbackCategories, setUsingFallbackCategories] = useState(false);

  // Fallback categories if API fails
  const fallbackCategories = [
    { category_id: 1, category_name: "Carry Goods", product_count: 0 },
    { category_id: 2, category_name: "Clothing", product_count: 0 },
    { category_id: 3, category_name: "Artistry", product_count: 0 },
    { category_id: 4, category_name: "Crafts", product_count: 0 },
    { category_id: 5, category_name: "Accessories", product_count: 0 }
  ];

  // Fetch categories from API or fallback
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`, {
        timeout: 5000
      });
      setUsingFallbackCategories(false);
      return response.data.data;
    } catch (error) {
      setUsingFallbackCategories(true);
      return fallbackCategories;
    }
  };

  // Calculate correct product counts for categories
  const getCorrectCategoryProductCounts = (productsList, categoriesList) => {
    const categoryProductMap = {};
    categoriesList.forEach(cat => {
      categoryProductMap[cat.category_id] = {
        count: 0,
        distinctProductIds: new Set()
      };
    });
    productsList.forEach(product => {
      const categoryId = categoriesList.find(
        cat => cat.category_name === product.category
      )?.category_id;
      if (categoryId && product.id) {
        categoryProductMap[categoryId].distinctProductIds.add(product.id);
      }
    });
    Object.keys(categoryProductMap).forEach(catId => {
      categoryProductMap[catId].count = categoryProductMap[catId].distinctProductIds.size;
    });
    return categoriesList.map(cat => ({
      ...cat,
      product_count: categoryProductMap[cat.category_id]?.count || 0
    }));
  };

  // Load products and categories on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data);
        return data;
      } catch (err) {
        setError("Failed to load products");
        return [];
      } finally {
        setLoading(false);
      }
    };
    const loadCategories = async (productsList) => {
      try {
        setCategoriesLoading(true);
        let data = await fetchCategories();
        if (productsList.length > 0) {
          data = getCorrectCategoryProductCounts(productsList, data);
        }
        setCategories(data);
      } catch (err) {
        setCategories(getCorrectCategoryProductCounts(productsList, fallbackCategories));
        setUsingFallbackCategories(true);
      } finally {
        setCategoriesLoading(false);
      }
    };
    // Load products first, then categories
    loadProducts().then(productsList => {
      loadCategories(productsList);
    });
  }, []);

  // Featured, popular, and new products
  const featuredProducts = products.slice(0, 4);
  const popularProducts = [...products]
    .filter(p => p.rating !== undefined)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);
  const newArrivals = products.slice(-4).reverse();

  // Category images mapping
  const categoryImages = {
    "Carry Goods": "https://i.pinimg.com/736x/aa/54/65/aa5465fbf05cc1227a770a23704f8cdf.jpg",
    "Clothing": "https://i.pinimg.com/736x/25/af/8a/25af8af775b256edb23e34a1ad02a8d8.jpg",
    "Artistry": "https://i.pinimg.com/736x/5b/f3/80/5bf3804de21db62d78a8281be01cc026.jpg",
    "Crafts": "https://i.pinimg.com/736x/fb/6a/e5/fb6ae547e543e097408b974b7889cbfd.jpg",
    "Accessories": "https://i.pinimg.com/736x/e4/b9/35/e4b935d3a0537aa49b76be1e8666e53b.jpg"
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow">
        {/* Hero Section - Simple Banner */}
        <section className="hero-banner relative h-[500px] flex items-center justify-center"
          style={{ backgroundImage: "url(/images/Hero4.png)", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="hero-overlay absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%] hero-content relative z-10 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Unique Handcrafted Treasures</h1>
            <p className="text-xl mb-6">Find one-of-a-kind items made with love by Sri Lankan artisans</p>
            <Link to="/products" className="btn-primary">Shop Now</Link>
          </div>
        </section>
        
        {/* Categories Section - Using CategoryCard component */}
        <section className="py-16 bg-white">
          <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
            <h2 className="text-3xl font-bold mb-12 text-center">Shop by Category</h2>
           
            {categoriesLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="text-center">
                  <Progress className="w-56 mb-2" />
                  <p className="text-sm text-gray-500">Loading categories...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 justify-items-center">
                {categories.map((category) => (
                  <CategoryCard 
                    key={category.category_id}
                    category={category.category_name}
                    image={categoryImages[category.category_name] || 
                          "https://placehold.co/300x300?text=Category"}
                    count={parseInt(category.product_count)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* Featured Products Section */}
        <ProductSection 
          title="Featured Products"
          products={featuredProducts}
          loading={loading}
          bgColor="bg-gray-50"
        />
        
        {/* Popular Right Now Section */}
        <ProductSection 
          title="Popular Right Now"
          products={popularProducts}
          loading={loading}
          viewAllLink="/products?sort=popular"
        />
        
        {/* New Arrivals Section */}
        <ProductSection 
          title="New Arrivals"
          products={newArrivals}
          loading={loading}
          viewAllLink="/products?sort=new"
          bgColor="bg-gray-50"
        />
        
        {/* Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
            <h2 className="text-3xl font-bold mb-8 text-center">What Our Customers Say</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  text: "The craftsmanship and attention to detail in every Handix product is exceptional. I love supporting local artisans while getting unique, beautiful items.",
                  name: "Sarah Johnson",
                  role: "Loyal Customer"
                },
                {
                  text: "I've been shopping at Handix for over a year now and love everything I've purchased. The quality is outstanding and the customer service is excellent!",
                  name: "Michael Chen",
                  role: "Art Collector"
                },
                {
                  text: "Every piece I've bought has a story behind it. It's wonderful to know I'm helping preserve traditional crafts while getting beautiful, one-of-a-kind items.",
                  name: "Priya Sharma",
                  role: "Interior Designer"
                }
              ].map((testimonial, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;