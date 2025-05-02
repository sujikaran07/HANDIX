import React, { useState } from 'react';
import { Check, Truck, Package, Clock, Search } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const OrderTrackingPage = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');
  const [orderStatus, setOrderStatus] = useState(null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      setError('Please enter an order number');
      return;
    }
    
    
    if (orderNumber.includes('123')) {
      setOrderStatus({
        orderId: `HX-${orderNumber}`,
        status: 'processing',
        date: new Date().toLocaleDateString(),
        items: 3,
        total: 9500
      });
      setError('');
    } 
    else if (orderNumber.includes('456')) {
      setOrderStatus({
        orderId: `HX-${orderNumber}`,
        status: 'shipped',
        date: new Date().toLocaleDateString(),
        items: 2,
        total: 6200
      });
      setError('');
    } 
    else if (orderNumber.includes('789')) {
      setOrderStatus({
        orderId: `HX-${orderNumber}`,
        status: 'delivered',
        date: new Date().toLocaleDateString(),
        items: 1,
        total: 3500
      });
      setError('');
    } 
    else {
      setError('No order found with that order number');
      setOrderStatus(null);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow bg-gray-50 py-16">
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">Track Your Order</h1>
            
            {/* Order Tracking Form */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Enter your order number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={orderNumber}
                      onChange={(e) => {
                        setOrderNumber(e.target.value);
                        setError('');
                      }}
                      className={`w-full pl-10 pr-4 py-3 border ${
                        error ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                      placeholder="e.g., 123456"
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Demo hint: Use an order number containing "123" for processing, 
                    "456" for shipped, or "789" for delivered.
                  </p>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-md bg-primary text-white hover:bg-primary-hover"
                >
                  Track Order
                </button>
              </form>
            </div>
            
            {/* Order Status (shown conditionally) */}
            {orderStatus && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="border-b pb-4 mb-6">
                  <h2 className="text-xl font-bold mb-2">
                    Order #{orderStatus.orderId}
                  </h2>
                  <p className="text-gray-500">
                    Placed on: {orderStatus.date} | {orderStatus.items} item(s) | 
                    LKR {orderStatus.total.toLocaleString()}
                  </p>
                </div>
                
                {/* Order Progress */}
                <div className="mb-8">
                  <h3 className="font-medium mb-4">Order Status</h3>
                  
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute left-4 top-0 w-0.5 h-full bg-gray-200 z-0"></div>
                    
                    {/* Processing Step */}
                    <div className="relative z-10 flex mb-8">
                      <div className={`
                        h-8 w-8 rounded-full flex items-center justify-center mr-4
                        ${orderStatus.status === 'processing' 
                          ? 'bg-primary text-white' 
                          : 'bg-green-500 text-white'}
                      `}>
                        {orderStatus.status === 'processing' 
                          ? <Clock size={16} /> 
                          : <Check size={16} />}
                      </div>
                      <div>
                        <h4 className="font-medium">Order Processing</h4>
                        <p className="text-sm text-gray-500">
                          {orderStatus.status === 'processing'
                            ? 'Your order is being processed and prepared for shipping.'
                            : 'Your order has been processed successfully.'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Shipped Step */}
                    <div className="relative z-10 flex mb-8">
                      <div className={`
                        h-8 w-8 rounded-full flex items-center justify-center mr-4
                        ${orderStatus.status === 'processing'
                          ? 'bg-gray-200 text-gray-400'
                          : orderStatus.status === 'shipped'
                            ? 'bg-primary text-white'
                            : 'bg-green-500 text-white'}
                      `}>
                        {orderStatus.status === 'processing'
                          ? <Truck size={16} />
                          : orderStatus.status === 'shipped' 
                            ? <Truck size={16} /> 
                            : <Check size={16} />}
                      </div>
                      <div>
                        <h4 className="font-medium">Order Shipped</h4>
                        <p className="text-sm text-gray-500">
                          {orderStatus.status === 'processing'
                            ? 'Your order has not been shipped yet.'
                            : orderStatus.status === 'shipped'
                              ? 'Your order is on the way to your delivery address.'
                              : 'Your order has been shipped and delivered.'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Delivered Step */}
                    <div className="relative z-10 flex">
                      <div className={`
                        h-8 w-8 rounded-full flex items-center justify-center mr-4
                        ${orderStatus.status === 'delivered'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-400'}
                      `}>
                        {orderStatus.status === 'delivered'
                          ? <Check size={16} />
                          : <Package size={16} />}
                      </div>
                      <div>
                        <h4 className="font-medium">Order Delivered</h4>
                        <p className="text-sm text-gray-500">
                          {orderStatus.status === 'delivered'
                            ? 'Your order has been delivered successfully.'
                            : 'Your order has not been delivered yet.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Expected Delivery */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Expected Delivery</h3>
                  <p className="text-gray-700">
                    {orderStatus.status === 'delivered'
                      ? 'Your order has been delivered.'
                      : orderStatus.status === 'shipped'
                        ? 'Your order is expected to be delivered within 2-3 business days.'
                        : 'Your order will be shipped within 1-2 business days.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderTrackingPage;