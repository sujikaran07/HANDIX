
import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaLeaf, FaPaintBrush, FaHandsHelping } from 'react-icons/fa';
import '../styles/About.css'; 

const About = () => {
  return (
    <div className="about-container">
      <div className="container">
        {}
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">About Handix</h1>
            <p className="hero-text">
              We are passionate about preserving traditional craftsmanship and supporting artisans
              while bringing unique, high-quality handmade products to our customers.
            </p>
            <Link to="/products" className="explore-button">
              Explore Our Products
            </Link>
          </div>
        </div>

        {}
        <div className="story-section">
          <div className="story-grid">
            <div className="story-content">
              <h2>Our Story</h2>
              <p>
                Handix began with a simple belief: that handmade items carry stories, traditions, and a level
                of quality that mass-produced products simply cannot match.
              </p>
              <p>
                Founded in 2018 by Jane Doe, Handix started as a small collection of handmade items from
                local artisans in her community. What began as a passion project quickly grew into a platform
                connecting skilled craftspeople with customers who appreciate the value of handmade goods.
              </p>
              <p>
                Today, we work with over 50 artisans from around the world, bringing their unique creations
                to a wider audience while ensuring they receive fair compensation for their work. Each product
                in our collection has been carefully selected for its quality, craftsmanship, and the story behind it.
              </p>
            </div>
            <div className="story-image">
              <img
                src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                alt="Handix founder working with artisans"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {}
        <div className="values-section">
          <h2 className="values-title">Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <FaHeart />
              </div>
              <h3 className="value-title">Passion</h3>
              <p className="value-text">
                We're passionate about preserving traditional crafts and connecting artisans with appreciative customers.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FaLeaf />
              </div>
              <h3 className="value-title">Sustainability</h3>
              <p className="value-text">
                We prioritize eco-friendly materials and processes, minimizing our environmental impact.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FaPaintBrush />
              </div>
              <h3 className="value-title">Craftsmanship</h3>
              <p className="value-text">
                We celebrate the skill, patience, and dedication that goes into creating each handmade item.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FaHandsHelping />
              </div>
              <h3 className="value-title">Community</h3>
              <p className="value-text">
                We support artisan communities by ensuring fair compensation and promoting their cultural heritage.
              </p>
            </div>
          </div>
        </div>

        {}
        <div className="artisans-section">
          <h2 className="artisans-title">Meet Our Artisans</h2>
          <div className="artisans-grid">
            <div className="artisan-card">
              <div className="artisan-image">
                <img
                  src="https://images.unsplash.com/photo-1612336307429-8a898d10e223?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
                  alt="Artisan working on Aari embroidery"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="artisan-details">
                <h3 className="artisan-name">Maya R.</h3>
                <p className="artisan-role">Aari Work Specialist, India</p>
                <p className="artisan-bio">
                  Maya has been practicing the traditional art of Aari embroidery for over 20 years, learning the craft from her grandmother.
                </p>
              </div>
            </div>
            <div className="artisan-card">
              <div className="artisan-image">
                <img
                  src="https://images.unsplash.com/photo-1565193566173-7a0af771fe10?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
                  alt="Artisan working on pottery"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="artisan-details">
                <h3 className="artisan-name">Carlos G.</h3>
                <p className="artisan-role">Potter, Mexico</p>
                <p className="artisan-bio">
                  Carlos creates stunning ceramic pieces using traditional techniques passed down through generations in his family.
                </p>
              </div>
            </div>
            <div className="artisan-card">
              <div className="artisan-image">
                <img
                  src="https://images.unsplash.com/photo-1591561954557-26941169b49e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
                  alt="Artisan making tote bags"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="artisan-details">
                <h3 className="artisan-name">Emma L.</h3>
                <p className="artisan-role">Textile Artist, USA</p>
                <p className="artisan-bio">
                  Emma specializes in sustainable textile products, creating beautiful tote bags and accessories from eco-friendly materials.
                </p>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="community-section">
          <h2 className="community-title">Join Our Community</h2>
          <p className="community-text">
            Subscribe to our newsletter to stay updated on new artisans, products, and special offers.
            Be part of our mission to support traditional craftsmanship.
          </p>
          <form className="newsletter-form">
            <input
              type="email"
              placeholder="Your email address"
              className="newsletter-input"
              required
            />
            <button type="submit" className="newsletter-button">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default About;