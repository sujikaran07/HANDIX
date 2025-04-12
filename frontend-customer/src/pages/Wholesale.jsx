import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaShoppingBag, FaHeart, FaStore, FaSignOutAlt, FaBoxOpen, FaFileInvoiceDollar, FaDownload, FaBox } from 'react-icons/fa';
import { products } from '../data/products';
import '../styles/Wholesale.css';

const Wholesale = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const wholesaleProducts = products.map(product => ({
    ...product,
    wholesalePrice: product.wholesale_price || Math.round(product.price * 0.8)
  }));

  const dashboardData = {
    monthlySpend: 168000,
    ordersPending: 2,
    ordersCompleted: 12,
    savingsToDate: 42000
  };

  const priceListCategories = [
    { id: 'carry-goods', name: 'Carry Goods', tamil_name: 'சுமந்து செல்லும் பொருட்கள்' },
    { id: 'accessories', name: 'Accessories', tamil_name: 'அணிகலன்கள்' },
    { id: 'clothing', name: 'Clothing', tamil_name: 'ஆடைகள்' },
    { id: 'crafts', name: 'Crafts', tamil_name: 'கைவினைப் பொருட்கள்' },
    { id: 'artistry', name: 'Artistry', tamil_name: 'கலைப் படைப்புகள்' }
  ];

  const bulkOrders = [
    { id: 'BULK-2023-001', date: 'April 15, 2023', total: 148000, status: 'pending', items: 35 },
    { id: 'BULK-2023-002', date: 'March 22, 2023', total: 85000, status: 'processing', items: 20 },
    { id: 'BULK-2023-003', date: 'February 10, 2023', total: 215000, status: 'completed', items: 50 }
  ];

  return (
    <div className="wholesale-container">
      <div className="container">
        <div className="wholesale-header">
          <h1>Wholesale Dashboard</h1>
          <p>Manage your wholesale account, view pricing, and place bulk orders.</p>
        </div>

        <div className="row">
          <div className="col-lg-3">
            <div className="wholesale-sidebar">
              <div className="profile-card">
                <div className="profile-header d-flex align-items-center">
                  <div className="profile-icon text-primary">
                    <FaStore />
                  </div>
                  <div className="profile-info">
                    <h3>Business Name</h3>
                    <p>Wholesale Account</p>
                  </div>
                </div>
                <nav className="nav-links">
                  <ul>
                    <li>
                      <Link to="/account" className="nav-link">
                        <FaUser className="me-2" />
                        Account Information
                      </Link>
                    </li>
                    <li>
                      <Link to="/orders" className="nav-link">
                        <FaShoppingBag className="me-2" />
                        Order History
                      </Link>
                    </li>
                    <li>
                      <a href="#" className="nav-link">
                        <FaHeart className="me-2" />
                        Wishlist
                      </a>
                    </li>
                    <li>
                      <Link to="/wholesale" className="nav-link active">
                        <FaStore className="me-2" />
                        Wholesale Dashboard
                      </Link>
                    </li>
                    <li>
                      <a href="#" className="nav-link text-danger">
                        <FaSignOutAlt className="me-2" />
                        Sign Out
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>

          <div className="col-lg-9">
            <div className="wholesale-tabs">
              <ul className="nav nav-tabs">
                <li className="nav-item">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                  >
                    <FaUser className="me-2" />
                    Dashboard
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    onClick={() => setActiveTab('price-list')}
                    className={`nav-link ${activeTab === 'price-list' ? 'active' : ''}`}
                  >
                    <FaStore className="me-2" />
                    Wholesale Pricing
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    onClick={() => setActiveTab('bulk-orders')}
                    className={`nav-link ${activeTab === 'bulk-orders' ? 'active' : ''}`}
                  >
                    <FaBoxOpen className="me-2" />
                    Bulk Orders
                  </button>
                </li>
              </ul>
            </div>

            {activeTab === 'dashboard' && (
              <div className="dashboard-content">
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="stat-card">
                      <div className="stat-icon bg-primary-light text-primary">
                        <FaFileInvoiceDollar />
                      </div>
                      <div className="stat-info">
                        <p>Monthly Spend</p>
                        <h3>LKR {dashboardData.monthlySpend.toLocaleString()}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stat-card">
                      <div className="stat-icon bg-warning-light text-warning">
                        <FaBoxOpen />
                      </div>
                      <div className="stat-info">
                        <p>Pending Orders</p>
                        <h3>{dashboardData.ordersPending}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stat-card">
                      <div className="stat-icon bg-success-light text-success">
                        <FaBox />
                      </div>
                      <div className="stat-info">
                        <p>Completed Orders</p>
                        <h3>{dashboardData.ordersCompleted}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stat-card">
                      <div className="stat-icon bg-purple-light text-purple">
                        <FaDownload />
                      </div>
                      <div className="stat-info">
                        <p>Total Savings</p>
                        <h3>LKR {dashboardData.savingsToDate.toLocaleString()}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-6">
                    <div className="card mb-4">
                      <div className="card-header">
                        <h5>Recent Orders</h5>
                      </div>
                      <div className="card-body">
                        <div className="order-list">
                          {bulkOrders.slice(0, 3).map((order) => (
                            <div key={order.id} className="order-item d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="order-id">{order.id}</h6>
                                <p className="order-date text-muted">{order.date}</p>
                              </div>
                              <div className="order-details text-end">
                                <h6 className="order-total">LKR {order.total.toLocaleString()}</h6>
                                <p className={`order-status text-${order.status}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-center mt-3">
                          <button
                            onClick={() => setActiveTab('bulk-orders')}
                            className="btn btn-link text-primary"
                          >
                            View All Orders
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="card mb-4">
                      <div className="card-header">
                        <h5>Quick Actions</h5>
                      </div>
                      <div className="card-body">
                        <div className="quick-actions">
                          <button
                            onClick={() => setActiveTab('bulk-orders')}
                            className="btn btn-primary mb-2"
                          >
                            <FaBoxOpen className="me-2" />
                            Place New Bulk Order
                          </button>
                          <Link to="/products" className="btn btn-outline-primary mb-2">
                            <FaStore className="me-2" />
                            Browse Products
                          </Link>
                          <button
                            onClick={() => setActiveTab('price-list')}
                            className="btn btn-outline-secondary mb-2"
                          >
                            <FaDownload className="me-2" />
                            Download Price List
                          </button>
                        </div>

                        <div className="bg-light p-3 rounded mt-4">
                          <h6 className="mb-2">Need Assistance?</h6>
                          <p className="small text-muted mb-2">
                            Our wholesale team is here to help you with bulk orders, custom requests, or any questions.
                          </p>
                          <a href="/contact" className="text-primary text-decoration-none">
                            Contact Wholesale Support
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'price-list' && (
              <div className="price-list-content">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5>Wholesale Price List</h5>
                    <button className="btn btn-primary">
                      <FaDownload className="me-2" />
                      Download PDF
                    </button>
                  </div>
                  <div className="card-body">
                    <p className="text-muted mb-4">
                      Below are our current wholesale prices. Prices may vary depending on order quantity and availability.
                      Please contact our wholesale team for custom pricing on large orders.
                    </p>

                    {priceListCategories.map((category) => (
                      <div key={category.id} className="mb-4">
                        <h5 className="mb-3">{category.name} - {category.tamil_name}</h5>
                        <div className="table-responsive">
                          <table className="table table-bordered">
                            <thead className="table-light">
                              <tr>
                                <th>Product</th>
                                <th>Retail Price (LKR)</th>
                                <th>Wholesale Price (LKR)</th>
                                <th>Savings</th>
                                <th>Min. Order</th>
                              </tr>
                            </thead>
                            <tbody>
                              {wholesaleProducts
                                .filter(product => product.category === category.id)
                                .map((product) => (
                                  <tr key={product.id}>
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <img
                                          src={product.image}
                                          alt={product.name}
                                          className="rounded me-3"
                                          width="50"
                                          height="50"
                                        />
                                        <div>
                                          <h6 className="mb-0">{product.name}</h6>
                                          <p className="small text-muted mb-0">{product.tamil_name}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td>{product.price.toLocaleString()}</td>
                                    <td className="text-primary font-weight-bold">
                                      {product.wholesalePrice.toLocaleString()}
                                    </td>
                                    <td className="text-success">
                                      {Math.round((1 - product.wholesalePrice / product.price) * 100)}%
                                    </td>
                                    <td>5 units</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}

                    <div className="bg-light p-3 rounded mt-4">
                      <h6 className="mb-2">Wholesale Terms & Conditions</h6>
                      <ul className="list-group list-group-flush small">
                        <li className="list-group-item bg-transparent">Minimum order quantities apply to each product</li>
                        <li className="list-group-item bg-transparent">Payment terms: 50% advance, balance before shipping</li>
                        <li className="list-group-item bg-transparent">Free shipping on orders over LKR 50,000</li>
                        <li className="list-group-item bg-transparent">Delivery time: 1-2 weeks for in-stock items</li>
                        <li className="list-group-item bg-transparent">Custom orders may require longer lead times</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bulk-orders' && (
              <div className="bulk-orders-content">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5>Your Bulk Orders</h5>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkOrders.map((order) => (
                          <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.date}</td>
                            <td>{order.items} items</td>
                            <td>LKR {order.total.toLocaleString()}</td>
                            <td>
                              <span className={`badge bg-${order.status}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            <td>
                              <button className="btn btn-sm btn-link text-primary">View Details</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h5>Place a Bulk Order</h5>
                  </div>
                  <div className="card-body">
                    <p className="text-muted mb-4">
                      Ready to place a bulk order? You can browse our products and add them to your bulk order.
                      For custom requirements or special pricing, please contact our wholesale team directly.
                    </p>
                    <div className="d-flex gap-3 mb-4">
                      <Link to="/products" className="btn btn-primary">
                        Browse Products
                      </Link>
                      <a href="/contact" className="btn btn-outline-secondary">
                        Contact Wholesale Team
                      </a>
                    </div>

                    <div className="bg-light p-3 rounded">
                      <h6 className="mb-2">Bulk Order Benefits</h6>
                      <ul className="list-group list-group-flush small">
                        <li className="list-group-item bg-transparent">Significant discounts on retail prices</li>
                        <li className="list-group-item bg-transparent">Free shipping on orders over LKR 50,000</li>
                        <li className="list-group-item bg-transparent">Dedicated account manager for your business</li>
                        <li className="list-group-item bg-transparent">Custom product options available</li>
                        <li className="list-group-item bg-transparent">Priority production and shipping</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wholesale;