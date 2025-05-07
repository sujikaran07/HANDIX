import React, { useState } from 'react';
import { Package, Calendar, ChevronRight, Truck, Clock, X, Search, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const PurchasesPage = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  // Enhanced sample orders data with product images - using static data to avoid API calls
  const orders = [
    {
      id: 'HX-1234567',
      date: '2023-04-15',
      status: 'delivered',
      total: 9500,
      items: 3,
      trackingId: 'TRK123456789',
      estimatedDelivery: '2023-04-20',
      products: [
        { name: 'Handcrafted Ceramic Vase', image: 'https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg' },
        { name: 'Wooden Kitchenware Set', image: 'https://images.pexels.com/photos/6270663/pexels-photo-6270663.jpeg' },
        { name: 'Handwoven Wall Hanging', image: 'https://images.pexels.com/photos/6048185/pexels-photo-6048185.jpeg' }
      ]
    },
    {
      id: 'HX-7654321',
      date: '2023-03-22',
      status: 'shipped',
      total: 6200,
      items: 2,
      trackingId: 'TRK987654321',
      estimatedDelivery: '2023-03-29',
      products: [
        { name: 'Leather Journal Cover', image: 'https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg' },
        { name: 'Silver Earrings', image: 'https://images.pexels.com/photos/4937441/pexels-photo-4937441.jpeg' }
      ]
    },
    {
      id: 'HX-9876543',
      date: '2023-02-10',
      status: 'processing',
      total: 3500,
      items: 1,
      products: [
        { name: 'Ceramic Tea Set', image: 'https://images.pexels.com/photos/6270188/pexels-photo-6270188.jpeg' }
      ]
    }
  ];
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <Clock size={16} className="mr-1" />;
      case 'shipped':
        return <Truck size={16} className="mr-1" />;
      case 'delivered':
        return <Package size={16} className="mr-1" />;
      case 'cancelled':
        return <X size={16} className="mr-1" />;
      default:
        return null;
    }
  };
  
  const handleOrderSelect = (order) => {
    setSelectedOrder(selectedOrder?.id === order.id ? null : order);
  };
  
  // Filter orders based on activeFilter and search query
  const filteredOrders = orders.filter(order => {
    const matchesFilter = activeFilter === 'all' || order.status === activeFilter;
    
    if (!searchQuery) return matchesFilter;
    
    const lowercaseQuery = searchQuery.toLowerCase();
    const matchesId = order.id.toLowerCase().includes(lowercaseQuery);
    const matchesProduct = order.products && order.products.some(product => 
      product.name.toLowerCase().includes(lowercaseQuery)
    );
    
    return matchesFilter && (matchesId || matchesProduct);
  });
  
  // Format date for better display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Navigate to review page with product details
  const handleWriteReview = (e, order, product) => {
    e.stopPropagation(); // Prevent order expansion when clicking review button
    navigate(`/reviews/write/${order.id}`, { 
      state: { 
        orderId: order.id,
        orderDate: order.date,
        product: product 
      }
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Purchases and Reviews</h1>
          
          {/* Order Filtering Tabs */}
          <div className="mb-6 overflow-x-auto no-scrollbar">
            <div className="border-b flex min-w-max">
              <button 
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                  activeFilter === 'all' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'
                }`}
                onClick={() => setActiveFilter('all')}
              >
                All Orders
              </button>
              <button 
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                  activeFilter === 'processing' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'
                }`}
                onClick={() => setActiveFilter('processing')}
              >
                Processing
              </button>
              <button 
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                  activeFilter === 'shipped' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'
                }`}
                onClick={() => setActiveFilter('shipped')}
              >
                Shipped
              </button>
              <button 
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                  activeFilter === 'delivered' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'
                }`}
                onClick={() => setActiveFilter('delivered')}
              >
                Delivered
              </button>
              <button 
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                  activeFilter === 'cancelled' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'
                }`}
                onClick={() => setActiveFilter('cancelled')}
              >
                Cancelled
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <input 
                type="text"
                placeholder="Search in orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6 pb-3 border-b">My Orders</h2>
            
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery 
                    ? "No orders match your search criteria." 
                    : activeFilter !== 'all' 
                      ? `You don't have any ${activeFilter} orders.` 
                      : "You haven't placed any orders yet."}
                </p>
                <Link
                  to="/products" 
                  className="inline-block bg-primary text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Explore Products
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg overflow-hidden">
                    {/* Order Header */}
                    <div 
                      className="flex flex-wrap md:flex-nowrap items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleOrderSelect(order)}
                    >
                      <div className="mb-2 md:mb-0">
                        <div className="font-medium">Order #{order.id}</div>
                        <div className="flex items-center text-sm text-gray-500 space-x-2">
                          <Calendar size={14} />
                          <span>{formatDate(order.date)}</span>
                          <span>•</span>
                          <span>{order.items} items</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center px-3 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </div>
                        <span className="font-semibold">LKR {order.total.toLocaleString()}</span>
                        <ChevronRight size={16} className={`transform transition-transform ${selectedOrder?.id === order.id ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                    
                    {/* Product Thumbnails - Always visible */}
                    <div className="p-3 border-t bg-white">
                      <div className="flex gap-2 overflow-x-auto">
                        {order.products && order.products.map((product, idx) => (
                          <div key={idx} className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded overflow-hidden border">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Order Details (expandable) */}
                    {selectedOrder?.id === order.id && (
                      <div className="p-4 border-t animate-fade-in">
                        {/* Product Details */}
                        <div className="mb-5">
                          <h3 className="font-medium mb-3">Products</h3>
                          <div className="space-y-3">
                            {order.products && order.products.map((product, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded overflow-hidden border">
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                  {order.status === 'delivered' && (
                                    <button 
                                      onClick={(e) => handleWriteReview(e, order, product)} 
                                      className="mt-2 flex items-center text-sm text-primary hover:underline"
                                    >
                                      <Star size={14} className="mr-1" />
                                      Write a review
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      
                        <div className="mb-4">
                          <h3 className="font-medium mb-2">Order Status</h3>
                          <div className="flex items-center relative">
                            <div className="flex flex-col items-center">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-primary text-white' : 'border-2 border-gray-300'}`}>
                                <span className="text-xs">1</span>
                              </div>
                              <span className="text-xs mt-1.5 font-medium">Processing</span>
                            </div>
                            <div className={`flex-1 h-1 mx-2 ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                            <div className="flex flex-col items-center">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-primary text-white' : 'border-2 border-gray-300'}`}>
                                <span className="text-xs">2</span>
                              </div>
                              <span className="text-xs mt-1.5 font-medium">Shipped</span>
                            </div>
                            <div className={`flex-1 h-1 mx-2 ${order.status === 'delivered' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                            <div className="flex flex-col items-center">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${order.status === 'delivered' ? 'bg-primary text-white' : 'border-2 border-gray-300'}`}>
                                <span className="text-xs">3</span>
                              </div>
                              <span className="text-xs mt-1.5 font-medium">Delivered</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Shipping Information */}
                        {(order.status === 'shipped' || order.status === 'delivered') && (
                          <div className="mb-4">
                            <h3 className="font-medium mb-2">Shipping Information</h3>
                            <div className="bg-blue-50 p-3 rounded-md flex flex-col space-y-1">
                              {order.estimatedDelivery && (
                                <div className="flex items-center text-sm">
                                  <span className="font-medium mr-2 w-32">Estimated Delivery:</span>
                                  <span>{formatDate(order.estimatedDelivery)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Order Summary */}
                        <div className="mb-4">
                          <h3 className="font-medium mb-2">Order Summary</h3>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Subtotal</span>
                              <span>LKR {order.total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Shipping</span>
                              <span>Free</span>
                            </div>
                            <div className="border-t mt-2 pt-2">
                              <div className="flex justify-between font-medium">
                                <span>Total</span>
                                <span>LKR {order.total.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions - Removed Track Package and Buy Again buttons */}
                        <div className="flex flex-wrap gap-2 mt-5">
                          <Link to={`/orders/${order.id}`} className="py-2 px-4 border border-primary text-primary rounded-md hover:bg-blue-50 transition-colors">
                            View Details
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-8">
              <Link 
                to="/products" 
                className="inline-block py-2 px-5 border border-primary text-primary rounded-md hover:bg-blue-50 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PurchasesPage;