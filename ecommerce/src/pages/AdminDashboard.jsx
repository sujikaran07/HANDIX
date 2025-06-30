import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, Grid, LogOut, Plus, Search, Edit, Trash2 } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { fetchProducts } from '../data/products';

const AdminDashboardPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error("Error loading products:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Filter products by search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow bg-gray-50 py-16">
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
          <div className="grid md:grid-cols-4 gap-8">
            {/* Sidebar navigation */}
            <div className="md:col-span-1">
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                    <div className="ml-4">
                      <p className="font-medium">Admin User</p>
                      <p className="text-sm text-gray-500">admin@handix.lk</p>
                    </div>
                  </div>
                </div>
                <nav>
                  {/* Tab buttons */}
                  <button 
                    onClick={() => setActiveTab('products')}
                    className={`w-full flex items-center p-4 border-b hover:bg-gray-50 ${
                      activeTab === 'products' ? 'bg-blue-50 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <Grid size={20} className={`mr-3 ${activeTab === 'products' ? 'text-primary' : 'text-gray-500'}`} />
                    <span>Products</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center p-4 border-b hover:bg-gray-50 ${
                      activeTab === 'orders' ? 'bg-blue-50 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <Package size={20} className={`mr-3 ${activeTab === 'orders' ? 'text-primary' : 'text-gray-500'}`} />
                    <span>Orders</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className={`w-full flex items-center p-4 border-b hover:bg-gray-50 ${
                      activeTab === 'users' ? 'bg-blue-50 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <Users size={20} className={`mr-3 ${activeTab === 'users' ? 'text-primary' : 'text-gray-500'}`} />
                    <span>Users</span>
                  </button>
                  <Link to="/" className="flex items-center p-4 hover:bg-gray-50">
                    <LogOut size={20} className="mr-3 text-gray-500" />
                    <span>Logout</span>
                  </Link>
                </nav>
              </div>
            </div>
            {/* Main content area */}
            <div className="md:col-span-3">
              <div className="bg-white shadow-sm rounded-lg p-6">
                {/* Products Tab */}
                {activeTab === 'products' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">Manage Products</h2>
                      <Link
                        to="/admin"
                        className="flex items-center py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-hover"
                      >
                        <Plus size={16} className="mr-1" />
                        Add New Product
                      </Link>
                    </div>
                    {/* Product search input */}
                    <div className="relative mb-6">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                    {/* Product table */}
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : error ? (
                      <div className="bg-red-50 p-4 rounded-md text-red-600 text-center">
                        {error}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left border-b">
                              <th className="pb-3">Image</th>
                              <th className="pb-3">Name</th>
                              <th className="pb-3">Price</th>
                              <th className="pb-3">Category</th>
                              <th className="pb-3">Stock</th>
                              <th className="pb-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProducts.length > 0 ? (
                              filteredProducts.map(product => (
                                <tr key={product.id} className="border-b">
                                  <td className="py-3">
                                    <img 
                                      src={product.images[0]} 
                                      alt={product.name} 
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                  </td>
                                  <td>{product.name}</td>
                                  <td>{product.currency} {product.price.toLocaleString()}</td>
                                  <td>{product.category}</td>
                                  <td>
                                    {product.inStock ? (
                                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                        In Stock
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                        Out of Stock
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    <div className="flex space-x-2">
                                      <button className="p-1 hover:text-primary">
                                        <Edit size={16} />
                                      </button>
                                      <button className="p-1 hover:text-red-500">
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="6" className="py-4 text-center text-gray-500">
                                  No products found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div>
                    <h2 className="text-xl font-bold mb-6">Manage Orders</h2>
                    {/* Orders table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b">
                            <th className="pb-3">Order ID</th>
                            <th className="pb-3">Customer</th>
                            <th className="pb-3">Date</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3">Total</th>
                            <th className="pb-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* No orders data yet */}
                          <tr>
                            <td colSpan="6" className="py-4 text-center text-gray-500">
                              No orders found
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {/* Users Tab */}
                {activeTab === 'users' && (
                  <div>
                    <h2 className="text-xl font-bold mb-6">Manage Users</h2>
                    {/* Users table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b">
                            <th className="pb-3">User</th>
                            <th className="pb-3">Email</th>
                            <th className="pb-3">Type</th>
                            <th className="pb-3">Date Joined</th>
                            <th className="pb-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* No users data yet */}
                          <tr>
                            <td colSpan="5" className="py-4 text-center text-gray-500">
                              No users found
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboardPage;