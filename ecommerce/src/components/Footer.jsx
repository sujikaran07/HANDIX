import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 pt-12 pb-6 w-full">
      <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About Handix</h3>
            <p className="text-gray-600 mb-4">
              Handix connects skilled local artisans with customers who appreciate handmade crafts. Our mission is to preserve traditional craftsmanship while supporting sustainable livelihoods.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-gray-600 hover:text-primary"
                 aria-label="Visit our Facebook page">
                <Facebook size={20} />
              </a>
              <a href="https://www.instagram.com" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-gray-600 hover:text-primary"
                 aria-label="Visit our Instagram page">
                <Instagram size={20} />
              </a>
              <a href="https://twitter.com" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-gray-600 hover:text-primary"
                 aria-label="Visit our X (Twitter) page">
                {/* X (formerly Twitter) icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-600 hover:text-primary">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="text-gray-600 hover:text-primary">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="text-gray-600 hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-primary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=Carry%20Goods" className="text-gray-600 hover:text-primary">
                  Carry Goods
                </Link>
              </li>
              <li>
                <Link to="/products?category=Accessories" className="text-gray-600 hover:text-primary">
                  Accessories
                </Link>
              </li>
              <li>
                <Link to="/products?category=Clothing" className="text-gray-600 hover:text-primary">
                  Clothing
                </Link>
              </li>
              <li>
                <Link to="/products?category=Crafts" className="text-gray-600 hover:text-primary">
                  Crafts
                </Link>
              </li>
              <li>
                <Link to="/products?category=Artistry" className="text-gray-600 hover:text-primary">
                  Artistry
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={20} className="mr-2 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-600">
                  123 Crafters Lane, Colombo 05, Sri Lanka
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="mr-2 text-primary flex-shrink-0" />
                <span className="text-gray-600">+94 11 234 5678</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="mr-2 text-primary flex-shrink-0" />
                <span className="text-gray-600">contact@handix.lk</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Language Selector */}
        <div className="mt-8 pt-5 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Handix. All rights reserved.
              </p>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-3">Language:</span>
              <select className="text-sm border rounded py-1 px-2 focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="en">English</option>
                <option value="ta">Tamil</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
