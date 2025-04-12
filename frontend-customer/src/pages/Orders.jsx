
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaShoppingBag, FaHeart, FaStore, FaSignOutAlt, FaSearch, FaEye } from 'react-icons/fa';
import '../styles/Orders.css'; 

const Orders = ({ userType }) => {
  const [filter, setFilter] = useState('all');
  const isWholesale = userType === 'wholesale';

  
  const sampleOrders = [
    {
      id: 'ORD-2023-1001',
      date: 'April 10, 2023',
      status: 'delivered',
      total: isWholesale ? 56000 : 7500,
      items: [
        { id: 1, name: 'Handcrafted Tote Bag', quantity: isWholesale ? 20 : 1, price: isWholesale ? 2800 : 3500 },
        { id: 3, name: 'Embroidered Pillow Cover', quantity: isWholesale ? 20 : 2, price: isWholesale ? 1650 : 2200 }
      ]
    },
    {
      id: 'ORD-2023-0845',
      date: 'March 22, 2023',
      status: 'processing',
      total: isWholesale ? 80000 : 14500,
      items: [
        { id: 13, name: 'Aari Work Dress', quantity: isWholesale ? 10 : 1, price: isWholesale ? 12000 : 14500 }
      ]
    },
    {
      id: 'ORD-2023-0712',
      date: 'February 15, 2023',
      status: 'cancelled',
      total: isWholesale ? 19000 : 2950,
      items: [
        { id: 12, name: 'Handcrafted Bookmark Set', quantity: isWholesale ? 10 : 1, price: isWholesale ? 800 : 1150 },
        { id: 11, name: 'Crafted Fabric Headband', quantity: isWholesale ? 10 : 1, price: isWholesale ? 950 : 1400 },
        { id: 4, name: 'Hot Handle Holder', quantity: isWholesale ? 5 : 1, price: isWholesale ? 850 : 1200 }
      ]
    }
  ];

  
  const filteredOrders = filter === 'all'
    ? sampleOrders
    : sampleOrders.filter(order => order.status === filter);

  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  return (
    <div className="orders-container">
      <div className="container">
        <h1 className="text-3xl font-bold text-black mb-8">My Orders</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {}
          <div className="lg:col-span-1">
            <div className="sidebar">
              <div className="user-profile">
                <div className="flex items-center">
                  <div className="user-avatar">A</div>
                  <div className="ml-4">
                    <h3 className="user-name">Account Name</h3>
                    <p className="user-type">{isWholesale ? 'Wholesale Account' : 'Retail Account'}</p>
                  </div>
                </div>
              </div>
              <nav className="nav-menu">
                <ul className="nav-list">
                  <li className="nav-item">
                    <Link to="/account" className="nav-link">
                      <FaUser className="nav-icon" />
                      Account Information
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/orders" className="nav-link active">
                      <FaShoppingBag className="nav-icon" />
                      Order History
                    </Link>
                  </li>
                  <li className="nav-item">
                    <a href="#" className="nav-link">
                      <FaHeart className="nav-icon" />
                      Wishlist
                    </a>
                  </li>
                  {isWholesale && (
                    <li className="nav-item">
                      <Link to="/wholesale" className="nav-link">
                        <FaStore className="nav-icon" />
                        Wholesale Dashboard
                      </Link>
                    </li>
                  )}
                  <li className="nav-item">
                    <a href="#" className="nav-link">
                      <FaSignOutAlt className="nav-icon" />
                      Sign Out
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {}
          <div className="lg:col-span-3">
            <div className="main-content">
              <div className="header">
                <div className="header-content">
                  <h2 className="header-title">Order History</h2>

                  {}
                  <div className="search-filter">
                    <div className="search-input">
                      <div className="search-icon">
                        <FaSearch />
                      </div>
                      <input
                        type="text"
                        placeholder="Search orders..."
                        className="search-input"
                      />
                    </div>

                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Orders</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="no-orders">
                  <div className="no-orders-icon">
                    <FaShoppingBag />
                  </div>
                  <h3 className="no-orders-title">No orders found</h3>
                  <p className="no-orders-text">
                    {filter === 'all' ? "You haven't placed any orders yet." : `You don't have any ${filter} orders.`}
                  </p>
                  <Link to="/products" className="bg-theme text-white px-6 py-2 rounded-md inline-block hover:bg-opacity-90">
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="order-table">
                    <thead>
                      <tr>
                        <th scope="col">Order</th>
                        <th scope="col">Date</th>
                        <th scope="col">Status</th>
                        <th scope="col">Total</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="order-id">
                            <div>{order.id}</div>
                            <div className="order-items">{order.items.length} items</div>
                          </td>
                          <td className="order-date">{order.date}</td>
                          <td>
                            <span className={`status-badge ${getStatusBadge(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="order-total">LKR {order.total.toLocaleString()}</td>
                          <td className="text-right">
                            <button className="view-button">
                              <FaEye className="view-icon" /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {}
              {filteredOrders.length > 0 && (
                <div className="help-section">
                  <div className="help-content">
                    <h3 className="header-title">Need Help?</h3>
                    <p className="help-text">
                      If you have any questions or concerns about your orders, please contact our customer service team.
                    </p>
                    <div className="help-actions">
                      <a href="/contact" className="help-button primary">
                        Contact Support
                      </a>
                      <a href="#" className="help-button secondary">
                        View FAQs
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;