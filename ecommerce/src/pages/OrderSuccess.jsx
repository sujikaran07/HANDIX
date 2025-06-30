import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, ChevronRight, Home } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const OrderSuccessPage = () => {
  const location = useLocation();

  // Get order details from location state or use defaults
  const orderDetails = location.state?.orderDetails || {
    orderId: 'ORD' + Math.floor(100000 + Math.random() * 900000),
    total: 12500,
    items: 3,
    estimatedDelivery: '3-5 business days',
    paymentMethod: 'Credit Card'
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow py-16">
        <div className="container-custom px-1 sm:px-2 md:px-3 max-w-3xl mx-auto">
          {/* Success Message */}
          <div className="bg-white p-6 md:p-10 rounded-lg shadow-sm mb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-3">Thank You for Your Order!</h1>
            <p className="text-gray-600 mb-6">
              Your order has been placed successfully. We've sent a confirmation email with your order details.
            </p>
            
            <div className="bg-gray-50 p-5 rounded-md mb-6 text-left">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Order Number:</h2>
                <span className="font-bold">{orderDetails.orderId}</span>
              </div>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span>LKR {orderDetails.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{orderDetails.items}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery:</span>
                  <span>{orderDetails.estimatedDelivery}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span>{orderDetails.paymentMethod}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/purchases" 
                className="flex items-center justify-center gap-2 bg-primary text-white py-3 px-6 rounded-md hover:bg-primary-hover transition-colors"
              >
                <Package size={16} />
                <span>Track Your Order</span>
              </Link>
              <Link 
                to="/products" 
                className="flex items-center justify-center gap-2 border border-primary text-primary py-3 px-6 rounded-md hover:bg-primary-hover hover:text-white transition-colors"
              >
                <ChevronRight size={16} />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
          
          {/* What's Next Section */}
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6">What's Next?</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-blue-50 p-3 rounded-full h-min">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Order Processing</h3>
                  <p className="text-gray-600">
                    Our artisans will begin preparing your handcrafted items. For customized products, 
                    please allow additional time as each piece is carefully made to your specifications.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-blue-50 p-3 rounded-full h-min">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Order Updates</h3>
                  <p className="text-gray-600">
                    We'll send you updates via email as your order is processed, shipped, and delivered. 
                    You can also check your order status anytime in your account.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-blue-50 p-3 rounded-full h-min">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Delivery</h3>
                  <p className="text-gray-600">
                    Your items will be carefully packaged and delivered to your address. Standard delivery 
                    takes 3-5 business days within Sri Lanka.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-gray-600 mb-4">
                If you have any questions about your order, please contact our customer support team.
              </p>
              <Link 
                to="/contact" 
                className="text-primary hover:underline font-medium flex items-center justify-center gap-2"
              >
                <span>Contact Support</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/" className="inline-flex items-center text-gray-600 hover:text-primary">
              <Home size={16} className="mr-2" />
              <span>Back to Homepage</span>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderSuccessPage;
