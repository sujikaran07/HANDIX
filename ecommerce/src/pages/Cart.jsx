import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, X, ShoppingCart, Loader2 } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    subtotal, 
    customizationTotal, 
    total,
    itemCount,
    loading,
    error
  } = useCart();
  const navigate = useNavigate();
  
  const handleQuantityChange = (itemId, newQuantity) => {
    // Find the item to check its max available quantity
    const item = items.find(i => (i.itemId || i.product.id) === itemId);
    if (!item) return;
    
    // Get max available quantity from the product
    const maxAvailable = item.product.quantity || 999; // Changed from 10 to 999
    
    // Ensure quantity is within bounds (1 to maxAvailable)
    if (newQuantity >= 1 && newQuantity <= maxAvailable) {
      updateQuantity(itemId, newQuantity);
    } else if (newQuantity > maxAvailable) {
      // If user tries to add more than available, set to max available
      updateQuantity(itemId, maxAvailable);
    }
  };
  
  const proceedToCheckout = () => {
    navigate('/checkout');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow py-16">
          <div className="container-custom flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p>Loading your cart...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow py-16">
          <div className="container-custom">
            <div className="bg-red-50 p-6 rounded-lg text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow py-16">
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
          <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
          
          {items.length > 0 ? (
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 mb-8 lg:mb-0">
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                  <div className="hidden md:grid md:grid-cols-[2fr,1fr,1fr,1fr] bg-gray-50 p-4 border-b">
                    <div>Product</div>
                    <div className="text-center">Price</div>
                    <div className="text-center">Quantity</div>
                    <div className="text-right">Total</div>
                  </div>
                  
                  {items.map(item => (
                    <div key={item.itemId || `${item.product.id}-${item.customization || ''}`} className="border-b last:border-b-0 p-4">
                      <div className="md:grid md:grid-cols-[2fr,1fr,1fr,1fr] md:items-center">
                        {/* Product */}
                        <div className="flex items-center mb-4 md:mb-0">
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.name} 
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="ml-4">
                            <Link to={`/products/${item.product.id}`} className="font-medium hover:text-primary">
                              {item.product.name}
                            </Link>
                            {item.customization && (
                              <p className="text-sm text-gray-500">
                                Customization: {item.customization}
                              </p>
                            )}
                            <button
                              onClick={() => removeItem(item.itemId || item.product.id)}
                              className="text-red-500 text-sm mt-1 flex items-center hover:underline"
                            >
                              <X size={14} className="mr-1" />
                              Remove
                            </button>
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="md:text-center mb-2 md:mb-0">
                          <div className="md:hidden text-sm text-gray-500 mb-1">Price:</div>
                          <div>LKR {(item.product.basePrice || item.product.price).toLocaleString()}</div>
                          {item.customization && item.product.customizationFee > 0 && (
                            <div className="text-sm font-medium text-blue-600">
                              +LKR {item.product.customizationFee.toLocaleString()}
                            </div>
                          )}
                        </div>
                        
                        {/* Quantity */}
                        <div className="md:text-center mb-2 md:mb-0">
                          <div className="md:hidden text-sm text-gray-500 mb-1">Quantity:</div>
                          <div className="flex items-center md:justify-center">
                            <button
                              onClick={() => handleQuantityChange(item.itemId || item.product.id, item.quantity - 1)}
                              className="border border-gray-300 rounded-l-md p-1 hover:bg-gray-50"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={item.product.quantity || 999} // Changed from 10 to 999
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.itemId || item.product.id, parseInt(e.target.value) || 1)}
                              className="border-t border-b border-gray-300 p-1 w-10 text-center focus:outline-none"
                            />
                            <button
                              onClick={() => handleQuantityChange(item.itemId || item.product.id, item.quantity + 1)}
                              className="border border-gray-300 rounded-r-md p-1 hover:bg-gray-50"
                              disabled={item.quantity >= (item.product.quantity || 999)} // Changed from 10 to 999
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          {item.product.quantity <= 5 && (
                            <p className="text-xs text-amber-600 mt-1">
                              Only {item.product.quantity} left
                            </p>
                          )}
                        </div>
                        
                        {/* Total */}
                        <div className="md:text-right">
                          <div className="md:hidden text-sm text-gray-500 mb-1">Total:</div>
                          <div className="font-medium">
                            LKR {(
                              item.product.price * item.quantity
                            ).toLocaleString()}
                          </div>
                          {item.customization && item.product.customizationFee > 0 && (
                            <div className="text-xs text-blue-600">
                              Includes customization fee
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                      <span>LKR {subtotal.toLocaleString()}</span>
                    </div>
                    {customizationTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customization Fee</span>
                        <span>LKR {customizationTotal.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t pt-3 flex justify-between font-bold">
                      <span>Total</span>
                      <span>LKR {total.toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={proceedToCheckout}
                    className="w-full py-3 px-6 rounded-md bg-primary text-white hover:bg-primary-hover"
                  >
                    Proceed to Checkout
                  </button>
                  <Link 
                    to="/products"
                    className="w-full text-center block mt-4 text-primary hover:underline"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <ShoppingCart size={64} className="text-gray-300" />
              </div>
              <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">
                Looks like you haven't added any products to your cart yet.
              </p>
              <Link
                to="/products"
                className="btn-primary"
              >
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CartPage;