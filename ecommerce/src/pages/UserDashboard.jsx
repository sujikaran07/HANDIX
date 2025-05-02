import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Heart, User, LogOut, ShoppingBag, ChevronRight, Calendar, CreditCard, MapPin, Truck, Clock, X } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const UserDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Sample orders data
  const orders = [
    {
      id: 'HX-1234567',
      date: '2023-04-15',
      status: 'delivered',
      total: 9500,
      items: 3,
      trackingId: 'TRK123456789',
      estimatedDelivery: '2023-04-20'
    },
    {
      id: 'HX-7654321',
      date: '2023-03-22',
      status: 'shipped',
      total: 6200,
      items: 2,
      trackingId: 'TRK987654321',
      estimatedDelivery: '2023-03-29'
    },
    {
      id: 'HX-9876543',
      date: '2023-02-10',
      status: 'processing',
      total: 3500,
      items: 1
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

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8">My Account</h1>
          
          <div className="grid md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">JD</div>
                    <div className="ml-4">
                      <p className="font-medium">John Doe</p>
                      <p className="text-sm text-gray-500">john.doe@example.com</p>
                    </div>
                  </div>
                </div>
                <nav>
                  <button 
                    onClick={() => setActiveTab('orders')} 
                    className={`flex w-full items-center p-4 border-b hover:bg-gray-50 ${activeTab === 'orders' ? 'bg-blue-50 border-l-4 border-l-primary' : ''}`}
                  >
                    <ShoppingBag size={20} className={`mr-3 ${activeTab === 'orders' ? 'text-primary' : 'text-gray-500'}`} />
                    <span>My Orders</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('wishlist')} 
                    className={`flex w-full items-center p-4 border-b hover:bg-gray-50 ${activeTab === 'wishlist' ? 'bg-blue-50 border-l-4 border-l-primary' : ''}`}
                  >
                    <Heart size={20} className={`mr-3 ${activeTab === 'wishlist' ? 'text-primary' : 'text-gray-500'}`} />
                    <span>Wishlist</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('profile')} 
                    className={`flex w-full items-center p-4 border-b hover:bg-gray-50 ${activeTab === 'profile' ? 'bg-blue-50 border-l-4 border-l-primary' : ''}`}
                  >
                    <User size={20} className={`mr-3 ${activeTab === 'profile' ? 'text-primary' : 'text-gray-500'}`} />
                    <span>Profile Settings</span>
                  </button>
                  <Link to="/" className="flex items-center p-4 hover:bg-gray-50">
                    <LogOut size={20} className="mr-3 text-gray-500" />
                    <span>Logout</span>
                  </Link>
                </nav>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-3">
              {activeTab === 'orders' && (
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-6 pb-3 border-b">My Orders</h2>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package size={48} className="mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                      <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                      <Link 
                        to="/products" 
                        className="btn-primary"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg overflow-hidden">
                          <div 
                            className="flex flex-wrap md:flex-nowrap items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleOrderSelect(order)}
                          >
                            <div className="mb-2 md:mb-0">
                              <div className="font-medium">Order #{order.id}</div>
                              <div className="flex items-center text-sm text-gray-500 space-x-2">
                                <Calendar size={14} />
                                <span>{order.date}</span>
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
                          
                          {/* Order Details (expandable) */}
                          {selectedOrder?.id === order.id && (
                            <div className="p-4 border-t animate-fade-in">
                              <div className="mb-4">
                                <h3 className="font-medium mb-2">Order Status</h3>
                                <div className="flex items-center relative">
                                  <div className="flex flex-col items-center">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-primary text-white' : 'border-2 border-gray-300'}`}>
                                      <span className="text-xs">1</span>
                                    </div>
                                    <span className="text-xs mt-1">Processing</span>
                                  </div>
                                  <div className={`flex-1 h-1 mx-1 ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                                  <div className="flex flex-col items-center">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-primary text-white' : 'border-2 border-gray-300'}`}>
                                      <span className="text-xs">2</span>
                                    </div>
                                    <span className="text-xs mt-1">Shipped</span>
                                  </div>
                                  <div className={`flex-1 h-1 mx-1 ${order.status === 'delivered' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                                  <div className="flex flex-col items-center">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${order.status === 'delivered' ? 'bg-primary text-white' : 'border-2 border-gray-300'}`}>
                                      <span className="text-xs">3</span>
                                    </div>
                                    <span className="text-xs mt-1">Delivered</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Shipping Information */}
                              {(order.status === 'shipped' || order.status === 'delivered') && (
                                <div className="mb-4">
                                  <h3 className="font-medium mb-2">Shipping Information</h3>
                                  <div className="bg-blue-50 p-3 rounded-md flex flex-col space-y-1">
                                    {order.trackingId && (
                                      <div className="flex items-center text-sm">
                                        <span className="font-medium mr-2">Tracking ID:</span>
                                        <span>{order.trackingId}</span>
                                      </div>
                                    )}
                                    {order.estimatedDelivery && (
                                      <div className="flex items-center text-sm">
                                        <span className="font-medium mr-2">Estimated Delivery:</span>
                                        <span>{order.estimatedDelivery}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Actions */}
                              <div className="flex flex-wrap gap-2 mt-4">
                                {order.trackingId && order.status !== 'delivered' && (
                                  <Link to={`/track-order/${order.id}`} className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors">
                                    Track Package
                                  </Link>
                                )}
                                <Link to={`/order/${order.id}`} className="py-2 px-4 border border-primary text-primary rounded-md hover:bg-blue-50 transition-colors">
                                  View Details
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <Link 
                      to="/products" 
                      className="inline-block py-2 px-4 border border-primary text-primary rounded-md hover:bg-blue-50 transition-colors"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              )}
              
              {activeTab === 'wishlist' && (
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">My Wishlist</h2>
                  <p className="text-gray-500">Your saved items will appear here.</p>
                </div>
              )}
              
              {activeTab === 'profile' && (
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
                  <p className="text-gray-500">Your account settings and preferences.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserDashboardPage;