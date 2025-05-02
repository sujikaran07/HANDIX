import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, X, ShoppingCart } from 'lucide-react';
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
    itemCount
  } = useCart();
  const navigate = useNavigate();
  
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      updateQuantity(productId, newQuantity);
    }
  };
  
  const proceedToCheckout = () => {
    navigate('/checkout');
  };
  
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
                    <div key={`${item.product.id}-${item.customization || ''}`} className="border-b last:border-b-0 p-4">
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
                              onClick={() => removeItem(item.product.id)}
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
                          <div>{item.product.currency} {item.product.price.toLocaleString()}</div>
                          {item.customization && item.product.customizationFee && (
                            <div className="text-sm text-gray-500">
                              +{item.product.currency} {item.product.customizationFee.toLocaleString()}
                            </div>
                          )}
                        </div>
                        
                        {/* Quantity */}
                        <div className="md:text-center mb-2 md:mb-0">
                          <div className="md:hidden text-sm text-gray-500 mb-1">Quantity:</div>
                          <div className="flex items-center md:justify-center">
                            <button
                              onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                              className="border border-gray-300 rounded-l-md p-1 hover:bg-gray-50"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.product.id, parseInt(e.target.value) || 1)}
                              className="border-t border-b border-gray-300 p-1 w-10 text-center focus:outline-none"
                            />
                            <button
                              onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                              className="border border-gray-300 rounded-r-md p-1 hover:bg-gray-50"
                              disabled={item.quantity >= 10}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Total */}
                        <div className="md:text-right">
                          <div className="md:hidden text-sm text-gray-500 mb-1">Total:</div>
                          <div className="font-medium">
                            {item.product.currency} {(
                              item.product.price * item.quantity + 
                              (item.customization && item.product.customizationFee 
                                ? item.product.customizationFee * item.quantity 
                                : 0)
                            ).toLocaleString()}
                          </div>
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