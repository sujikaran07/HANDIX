
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaBars, FaTimes, FaUser } from 'react-icons/fa';
import { categories } from '../data/products';
import '../styles/Navbar.css'; 

const Navbar = ({ cartItemsCount, isLoggedIn, userType, logoutUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${searchTerm}`);
      setSearchTerm('');
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {}
          <Link to="/" className="logo">
            HANDIX
          </Link>

          {}
          <div className="desktop-menu">
            <Link to="/" className="menu-item">Home</Link>
            <div className="dropdown">
              <button className="menu-item">Categories</button>
              <div className="dropdown-menu">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/products/${category.id}`}
                    className="dropdown-item"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link to="/products" className="menu-item">All Products</Link>
            <Link to="/about" className="menu-item">About</Link>
            <Link to="/contact" className="menu-item">Contact</Link>
          </div>

          {}
          <div className="search-bar">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                Search
              </button>
            </form>
          </div>

          {}
          <div className="nav-icons">
            {}
            <div className="relative">
              {isLoggedIn ? (
                <div>
                  <button
                    onClick={toggleUserMenu}
                    className="icon"
                  >
                    <FaUser className="icon" />
                    <span className="hidden sm:inline-block">{userType === 'wholesale' ? 'Wholesale' : 'My Account'}</span>
                  </button>
                  {isUserMenuOpen && (
                    <div className="dropdown-menu">
                      <Link
                        to="/account"
                        className="dropdown-item"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Account
                      </Link>
                      <Link
                        to="/orders"
                        className="dropdown-item"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      {userType === 'wholesale' && (
                        <Link
                          to="/wholesale"
                          className="dropdown-item"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Wholesale Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="dropdown-item"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-3">
                  <Link to="/signin" className="menu-item text-sm">Sign In</Link>
                  <span className="text-gray-400">|</span>
                  <Link to="/register" className="menu-item text-sm">Register</Link>
                </div>
              )}
            </div>

            {}
            <Link to="/cart" className="icon">
              <FaShoppingCart className="icon" />
              {cartItemsCount > 0 && (
                <span className="cart-badge">{cartItemsCount}</span>
              )}
            </Link>

            {}
            <button
              onClick={toggleMenu}
              className="mobile-menu-toggle"
            >
              {isMenuOpen ? <FaTimes className="icon" /> : <FaBars className="icon" />}
            </button>
          </div>
        </div>

        {}
        {isMenuOpen && (
          <div className="mobile-menu">
            <form onSubmit={handleSearch} className="mobile-search">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mobile-search-input"
              />
              <button type="submit" className="mobile-search-button">
                Search
              </button>
            </form>
            <div className="mobile-nav-links">
              <Link to="/" className="mobile-nav-link" onClick={toggleMenu}>Home</Link>
              <div className="mobile-nav-link">Categories</div>
              <div className="mobile-nav-links ml-4">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/products/${category.id}`}
                    className="mobile-nav-link"
                    onClick={toggleMenu}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
              <Link to="/products" className="mobile-nav-link" onClick={toggleMenu}>All Products</Link>
              <Link to="/about" className="mobile-nav-link" onClick={toggleMenu}>About</Link>
              <Link to="/contact" className="mobile-nav-link" onClick={toggleMenu}>Contact</Link>
              {!isLoggedIn ? (
                <>
                  <Link to="/signin" className="mobile-nav-link" onClick={toggleMenu}>Sign In</Link>
                  <Link to="/register" className="mobile-nav-link" onClick={toggleMenu}>Register</Link>
                </>
              ) : (
                <>
                  <Link to="/account" className="mobile-nav-link" onClick={toggleMenu}>My Account</Link>
                  <Link to="/orders" className="mobile-nav-link" onClick={toggleMenu}>My Orders</Link>
                  {userType === 'wholesale' && (
                    <Link to="/wholesale" className="mobile-nav-link" onClick={toggleMenu}>Wholesale Dashboard</Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="mobile-nav-link"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {}
      <div className="currency-info">
        <span>All prices shown in LKR (Sri Lankan Rupees) | Free shipping on orders over LKR 5,000</span>
      </div>
    </nav>
  );
};

export default Navbar;