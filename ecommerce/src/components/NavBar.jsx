import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, User, Heart, Package, MessageSquare, HelpCircle, Settings, LogOut } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { categories } from '../data/products';

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();
  // Check localStorage for authentication status on component mount
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  // Add state for user data
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      
      // Get user data from localStorage
      try {
        const userDataString = localStorage.getItem('user');
        if (userDataString) {
          const parsedUserData = JSON.parse(userDataString);
          setUserData(parsedUserData);
          console.log('User data loaded:', parsedUserData);
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
  }, []);
  
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);
  
  // For demo purposes - toggle auth state and update localStorage
  const toggleAuth = () => {
    const newAuthState = !isAuthenticated;
    setIsAuthenticated(newAuthState);
    
    if (newAuthState) {
      localStorage.setItem('isAuthenticated', 'true');
    } else {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUserData(null);
    }
  };

  // Function to get user's full name
  const getUserFullName = () => {
    if (userData && userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    } else if (userData && userData.firstName) {
      return userData.firstName;
    } else {
      return "User";
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 w-full">
      <div className="container-custom py-3 px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">HANDIX</span>
          </Link>

          {/* Categories Dropdown - Desktop Only */}
          <div className="hidden md:flex items-center ml-3 lg:ml-5">
            <DropdownMenu>
              <DropdownMenuTrigger className="hover:text-primary transition-colors focus:outline-none flex items-center gap-1 font-medium">
                Categories
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4 transition duration-200 group-data-[state=open]:rotate-180">
                  <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white shadow-lg rounded-md border border-gray-200 py-2 w-56 mt-1 animate-fade-in">
                {categories.map((category) => (
                  <DropdownMenuItem key={category} asChild className="cursor-pointer px-4 py-2 hover:bg-gray-50 transition-colors">
                    <Link 
                      to={`/products?category=${category.toLowerCase()}`} 
                      className="w-full block"
                    >
                      {category}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Search Bar - Center */}
          <div className="hidden md:flex flex-1 mx-1 lg:mx-2 max-w-md lg:max-w-xl xl:max-w-2xl">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for anything"
                className="w-full py-1.5 pl-9 pr-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
              <Search className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
              <button className="absolute right-2.5 top-2 bg-primary text-white p-1 rounded-full">
                <Search size={14} />
              </button>
            </div>
          </div>
          
          {/* Right Side Icons */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3 xl:space-x-4 min-w-[120px] lg:min-w-[140px]">
            {!isAuthenticated ? (
              <Link to="/login" className="text-gray-600 hover:text-primary transition-colors flex items-center">
                <span>Sign in</span>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-gray-600 hover:text-primary transition-colors flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-1.5">
                    <User size={16} />
                  </div>
                  <span className="max-w-[80px] lg:max-w-[120px] truncate">{userData?.firstName || "Account"}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-white p-0 shadow-lg rounded-lg border border-gray-200 mt-1">
                  <div className="bg-blue-50 p-4 flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-semibold">{getUserFullName()}</p>
                      <Link to="/profile" className="text-sm text-gray-600 hover:text-primary">View your profile</Link>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer flex items-center gap-3">
                      <Link to="/purchases">
                        <Package size={18} />
                        <span>Purchases and reviews</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer flex items-center gap-3">
                      <Link to="/messages">
                        <MessageSquare size={18} />
                        <span>Messages</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <div className="py-1">
                    <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer flex items-center gap-3">
                      <Link to="/help">
                        <HelpCircle size={18} />
                        <span>Help Center</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer flex items-center gap-3">
                      <Link to="/settings">
                        <Settings size={18} />
                        <span>Account settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <div className="py-1">
                    <DropdownMenuItem className="px-4 py-2.5 cursor-pointer flex items-center gap-3" onClick={toggleAuth}>
                      <LogOut size={18} />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Link to="/favorites" className="text-gray-600 hover:text-primary transition-colors flex items-center">
              <Heart size={20} />
              <span className="ml-1"></span>
            </Link>
            
            <Link to="/cart" className="text-gray-600 hover:text-primary transition-colors relative">
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button 
              onClick={toggleSearch}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              <Search size={20} />
            </button>
            <Link to="/favorites" className="text-gray-600 hover:text-primary transition-colors">
              <Heart size={20} />
            </Link>
            <Link to="/cart" className="text-gray-600 hover:text-primary transition-colors relative">
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button 
              onClick={toggleMenu}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (conditionally rendered) */}
        {searchOpen && (
          <div className="py-2 border-t mt-3 transition-all animate-fade-in">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full py-1.5 pl-9 pr-9 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <button 
                onClick={toggleSearch}
                className="absolute right-3 top-2 text-gray-400 hover:text-primary"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {menuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t animate-fade-in">
            <div className="flex flex-col space-y-4">
              <div className="px-4 py-2">
                <h3 className="font-medium mb-2">Categories</h3>
                <div className="pl-2 flex flex-col space-y-2">
                  {categories.map((category) => (
                    <Link 
                      key={category}
                      to={`/products?category=${category.toLowerCase()}`}
                      className="py-1 hover:text-primary" 
                      onClick={() => setMenuOpen(false)}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
              
              {!isAuthenticated ? (
                <Link 
                  to="/login"
                  className="px-4 py-2 hover:bg-gray-50 rounded-md hover:text-primary text-left"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </Link>
              ) : (
                <>
                  <div className="px-4 py-2 flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-medium">{getUserFullName()}</p>
                      <Link 
                        to="/profile" 
                        className="text-xs text-gray-600 hover:text-primary"
                        onClick={() => setMenuOpen(false)}
                      >
                        View your profile
                      </Link>
                    </div>
                  </div>
                  
                  <Link to="/purchases" className="px-4 py-2 hover:bg-gray-50 flex items-center space-x-3" onClick={() => setMenuOpen(false)}>
                    <Package size={18} />
                    <span>Purchases and reviews</span>
                  </Link>
                  
                  <Link to="/messages" className="px-4 py-2 hover:bg-gray-50 flex items-center space-x-3" onClick={() => setMenuOpen(false)}>
                    <MessageSquare size={18} />
                    <span>Messages</span>
                  </Link>
                  
                  <Link to="/help" className="px-4 py-2 hover:bg-gray-50 flex items-center space-x-3" onClick={() => setMenuOpen(false)}>
                    <HelpCircle size={18} />
                    <span>Help Center</span>
                  </Link>
                  
                  <Link to="/settings" className="px-4 py-2 hover:bg-gray-50 flex items-center space-x-3" onClick={() => setMenuOpen(false)}>
                    <Settings size={18} />
                    <span>Account settings</span>
                  </Link>
                  
                  <button 
                    onClick={() => {
                      toggleAuth();
                      setMenuOpen(false);
                    }}
                    className="px-4 py-2 hover:bg-gray-50 flex items-center space-x-3 text-left"
                  >
                    <LogOut size={18} />
                    <span>Sign out</span>
                  </button>
                </>
              )}
              
              <div className="pt-2 border-t">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="w-full py-2 pl-10 pr-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
