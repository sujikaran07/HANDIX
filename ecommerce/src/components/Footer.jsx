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
                <Link to="/about" className="text-gray-600 hover:text-primary">
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
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={20} className="mr-2 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-700">Mullaitivu Branch</p>
                  <p className="text-gray-600">15 Main Street, Mullaitivu</p>
                </div>
              </li>
              
              <li className="flex items-center">
                <Phone size={20} className="mr-2 text-primary flex-shrink-0" />
                <div>
                  <p className="text-gray-600">+94 77 636 0319</p>
                </div>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="mr-2 text-primary flex-shrink-0" />
                <span className="text-gray-600">handixecommerce@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-5 border-t border-gray-200">
          <div className="flex justify-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Handix. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
