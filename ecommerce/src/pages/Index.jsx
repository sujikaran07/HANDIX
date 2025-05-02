import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, ArrowRight, ShoppingBag } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import ProductSection from '../components/ProductSection';
import CategoryCard from '../components/CategoryCard';
import { products, categories } from '../data/products';
import { Progress } from '../components/ui/progress';

const HomePage = () => {
  // Get featured products (first 4)
  const featuredProducts = products.slice(0, 4);
  // Get popular products (based on rating)
  const popularProducts = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);
  // New arrivals (simulating with last 4 products)
  const newArrivals = products.slice(-4).reverse();
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow">
        {/* Hero Section - Simple Banner */}
        <section className="hero-banner relative h-[500px] flex items-center justify-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200')" }}>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 justify-items-center">
              {[
                { name: "Carry Goods", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158", count: 24 },
                { name: "Clothing", image: "https://images.unsplash.com/photo-1472396961693-142e6e269027", count: 18 },
                { name: "Artistry", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5", count: 32 },
                { name: "Crafts", image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7", count: 15 },
                { name: "Accessories", image: "https://images.unsplash.com/photo-1500673922987-e212871fec22", count: 27 }
              ].map((category, index) => (
                <CategoryCard 
                  key={index}
                  category={category.name}
                  image={category.image}
                  count={category.count}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* Featured Products Section */}
        <ProductSection 
          title="Featured Products"
          products={featuredProducts}
          bgColor="bg-gray-50"
        />
        
        {/* Popular Right Now Section */}
        <ProductSection 
          title="Popular Right Now"
          products={popularProducts}
          viewAllLink="/products?sort=popular"
        />
        
        {/* New Arrivals Section */}
        <ProductSection 
          title="New Arrivals"
          products={newArrivals}
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