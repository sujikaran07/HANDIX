
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaPinterest } from 'react-icons/fa';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {}
          <div className="footer-section">
            <h3>Handix</h3>
            <p>
              Handmade with love and care. Each of our products is unique and crafted
              with attention to detail.
            </p>
            <div className="social-icons">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <FaFacebook size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <FaPinterest size={20} />
              </a>
            </div>
          </div>

          {}
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/" className="footer-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="footer-link">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="footer-link">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {}
          <div className="footer-section">
            <h3>Categories</h3>
            <ul className="footer-links">
              <li>
                <Link to="/products/carry-goods" className="footer-link">
                  Carry Goods
                </Link>
              </li>
              <li>
                <Link to="/products/accessories" className="footer-link">
                  Accessories
                </Link>
              </li>
              <li>
                <Link to="/products/clothing" className="footer-link">
                  Clothing
                </Link>
              </li>
              <li>
                <Link to="/products/crafts" className="footer-link">
                  Crafts
                </Link>
              </li>
              <li>
                <Link to="/products/artistry" className="footer-link">
                  Artistry
                </Link>
              </li>
            </ul>
          </div>

          {}
          <div className="footer-section">
            <h3>Contact Us</h3>
            <address className="contact-info not-italic">
              <p>123 Handcraft Street</p>
              <p>Artisan City, AC 12345</p>
              <p>
                <a href="mailto:info@handix.com">info@handix.com</a>
              </p>
              <p>
                <a href="tel:+1234567890">(123) 456-7890</a>
              </p>
            </address>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Handix. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;