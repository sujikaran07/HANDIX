import React from 'react';
import Hero from '../components/Hero';
import CategorySection from '../components/CategorySection';
import FeaturedProducts from '../components/FeaturedProducts';
import '../styles/Home.css'; 

const Home = ({ addToCart }) => {
  return (
    <div className="home-container">
      <div className="container">
        <Hero />
        <CategorySection />
        <FeaturedProducts addToCart={addToCart} />
      </div>

      {}
      <section className="testimonial-section">
        <div className="container">
          <div className="testimonial-header">
            <h2 className="testimonial-title">What Our Customers Say</h2>
            <p className="testimonial-description">
              Hear from people who have experienced the quality and craftsmanship of our handmade products.
            </p>
          </div>

          <div className="testimonial-grid">
            {}
            <div className="testimonial-card">
              <div className="testimonial-header-content">
                <div className="testimonial-avatar">S</div>
                <div>
                  <h4 className="testimonial-author">Sarah T.</h4>
                  <p className="testimonial-role">Loyal Customer</p>
                </div>
              </div>
              <p className="testimonial-content">
                "The tote bag I purchased from Handix is beautifully made and so durable. I love that each item
                has its own unique character. Will definitely be ordering more items!"
              </p>
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {}
            <div className="testimonial-card">
              <div className="testimonial-header-content">
                <div className="testimonial-avatar">M</div>
                <div>
                  <h4 className="testimonial-author">Michael J.</h4>
                  <p className="testimonial-role">New Customer</p>
                </div>
              </div>
              <p className="testimonial-content">
                "I bought a handmade wool sweater for my baby nephew and it's absolutely stunning. The quality is
                exceptional and you can really tell it's made with love. Fast shipping too!"
              </p>
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {}
            <div className="testimonial-card">
              <div className="testimonial-header-content">
                <div className="testimonial-avatar">A</div>
                <div>
                  <h4 className="testimonial-author">Amina K.</h4>
                  <p className="testimonial-role">Repeat Customer</p>
                </div>
              </div>
              <p className="testimonial-content">
                "The Aari work dress is a masterpiece! I've received so many compliments whenever I wear it.
                The attention to detail is remarkable. Thank you for such beautiful craftsmanship!"
              </p>
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-container">
            <h2 className="newsletter-title">Join Our Newsletter</h2>
            <p className="newsletter-description">
              Subscribe to get updates on new products, special offers, and artisan stories.
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
            <p className="newsletter-disclaimer">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;