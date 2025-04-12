import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import SignIn from './pages/SignIn';
import Register from './pages/Register';
import Account from './pages/Account';
import Orders from './pages/Orders';
import Wholesale from './pages/Wholesale';

function App() {
  const [cart, setCart] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('retail');
  const [userData, setUserData] = useState({ name: '', email: '', address: '', phone: '' });

  useEffect(() => {
    const savedUser = localStorage.getItem('handixUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setIsLoggedIn(true);
      setUserType(parsedUser.userType || 'retail');
      setUserData(parsedUser.userData || {});
    }

    const savedCart = localStorage.getItem('handixCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('handixCart', JSON.stringify(cart));
  }, [cart]);

  const loginUser = (user, type = 'retail') => {
    setIsLoggedIn(true);
    setUserType(type);
    setUserData(user);
    localStorage.setItem('handixUser', JSON.stringify({ isLoggedIn: true, userType: type, userData: user }));
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    setUserType('retail');
    setUserData({ name: '', email: '', address: '', phone: '' });
    localStorage.removeItem('handixUser');
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
    }
  };

  const ProtectedRoute = ({ children, requiredUserType = null }) => {
    if (!isLoggedIn) return <Navigate to="/signin" replace />;
    if (requiredUserType && userType !== requiredUserType) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar cartItemsCount={cart.reduce((total, item) => total + item.quantity, 0)} isLoggedIn={isLoggedIn} userType={userType} logoutUser={logoutUser} />
        <div className="container mx-auto px-4 flex-grow">
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} />} />
            <Route path="/products" element={<Products addToCart={addToCart} />} />
            <Route path="/products/:category" element={<Products addToCart={addToCart} />} />
            <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} userType={userType} />} />
            <Route path="/cart" element={
              <Cart cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} isLoggedIn={isLoggedIn} userData={userData} />
            } />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/signin" element={isLoggedIn ? <Navigate to="/" replace /> : <SignIn loginUser={loginUser} />} />
            <Route path="/register" element={isLoggedIn ? <Navigate to="/" replace /> : <Register loginUser={loginUser} />} />
            <Route path="/account" element={<ProtectedRoute><Account userData={userData} setUserData={setUserData} /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders userType={userType} /></ProtectedRoute>} />
            <Route path="/wholesale" element={<ProtectedRoute requiredUserType="wholesale"><Wholesale /></ProtectedRoute>} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;