
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Hero.css'; 

const Hero = () => {
  return (
    <div className="hero-container">
      <div className="hero-content">
        <div className="hero-grid">
          <div className="hero-text">
            <h1>
              Handcrafted with <span className="text-primary">Love</span>
            </h1>
            <p>
              Discover our unique collection of handmade products created with passion and
              attention to detail. Each piece tells a story of craftsmanship and creativity.
            </p>
            <div className="hero-buttons">
              <Link
                to="/products"
                className="shop-now"
              >
                Shop Now
              </Link>
              <Link
                to="/about"
                className="our-story"
              >
                Our Story
              </Link>
            </div>
          </div>
          <div className="hero-image-grid">
            <div className="hero-image">
              <img
                src="https://images.unsplash.com/photo-1565193566173-7a0af771fe10?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
                alt="Handmade crafts"
                className="img-fluid"
              />
            </div>
            <div className="hero-image">
              <img
                src="https://images.unsplash.com/photo-1591561954557-26941169b49e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
                alt="Tote bag"
                className="img-fluid"
              />
            </div>
            <div className="hero-image">
              <img
                src="https://images.unsplash.com/photo-1612336307429-8a898d10e223?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
                alt="Aari work dress"
                className="img-fluid"
              />
            </div>
            <div className="hero-image">
              <img
                src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
                alt="Handcrafted bookmark"
                className="img-fluid"
              />
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="decorative-circle decorative-circle-1"></div>
      <div className="decorative-circle decorative-circle-2"></div>

      {}
      <div className="wave-decoration">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;