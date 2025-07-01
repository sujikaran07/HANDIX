import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons';
import { FaBoxOpen } from 'react-icons/fa';
import Pagination from '../Pagination';
import '../../styles/artisan/ArtisanOrders.css';

// Component for managing orders assigned to the artisan
const ArtisanManageOrders = ({ onViewOrder, onUpdateOrder, artisan }) => {
  // State management for orders and filtering
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 7;

  useEffect(() => {
    if (artisan && (artisan.name || artisan.id)) {
      fetchAssignedOrders();
    }
  }, [artisan]);

  // Fetch orders assigned to the logged-in artisan
  const fetchAssignedOrders = async () => {
    try {
      const token = localStorage.getItem('artisanToken');
      if (!token) {
        alert('You are not logged in. Please log in to view your assigned orders.');
        window.location.href = '/login';
        return;
      }

      // Use artisan name or ID for lookup
      const searchValue = artisan.name || artisan.id;

      const response = await fetch(`http://localhost:5000/api/orders/assigned/${encodeURIComponent(searchValue)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setTotalPages(Math.ceil((data.orders?.length || 0) / ordersPerPage));
      } else {
        alert('Unable to fetch assigned orders at the moment. Please try again later.');
      }
    } catch (error) {
      alert('An unexpected error occurred while fetching assigned orders. Please try again later.');
    }
  };

  // Apply search and status filters to orders
  const filteredOrders = orders.filter(order => {
    return (
      (filterStatus === 'All' || order.status === filterStatus) && 
      (
        order.o_id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        order.customer_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customized?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  // Pagination calculations
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) {
      return;
    }
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        {/* Page header with title and export button */}
        <div className="manage-orders-header d-flex justify-content-between align-items-center mb-3">
          <div className="title-section">
            <div className="icon-and-title">
              <FaBoxOpen className="order-icon" />
              <div className="text-section">
                <h2>Assigned Orders</h2>
                <p>Manage your assigned production orders</p>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <button className="export-btn">
              <FontAwesomeIcon icon={faCloudDownloadAlt} /> Export
            </button>
          </div>
        </div>

        {/* Search and filter controls */}
        <div className="filter-section mb-3 d-flex justify-content-between align-items-center">
          <div></div>
          <div className="d-flex align-items-center">
            <div className="filter-dropdown me-2">
              <div className="input-group">
                <span className="input-group-text bg-light border-0">
                  <FontAwesomeIcon icon={faFilter} />
                </span>
                <select
                  className="form-select border-0"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Production">In Production</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="search-bar" style={{ width: '200px' }}>
              <div className="input-group">
                <span className="input-group-text bg-light border-0">
                  <FontAwesomeIcon icon={faSearch} />
                </span>
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ boxShadow: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Orders table */}
        <div style={{ flex: '1 1 auto', overflowY: 'auto', marginTop: '20px' }}>
          <table className="table table-bordered order-table">
            <thead>
              <tr>
                <th>O-ID</th>
                <th>Customer</th>
                <th>Customized</th>
                <th>Order Date</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th style={{textAlign: 'right', paddingRight: '30px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map(order => (
                  <tr key={order.o_id}>
                    <td>{order.o_id}</td>
                    <td>{order.customer_first_name || 'N/A'}</td>
                    <td>{order.customized}</td>
                    <td>{new Date(order.order_date).toLocaleString('en-US', { dateStyle: 'short' })}</td>
                    <td>Rs. {order.total_amount ? order.total_amount.toLocaleString() : '0'}</td>
                    <td>
                      <span className={`status ${order.status.toLowerCase().replace(' ', '-')}`}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{textAlign: 'right', paddingRight: '10px'}}>
                      {/* Action dropdown menu */}
                      <div className="dropdown">
                        <button
                          className="btn dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          style={{width: 'auto', minWidth: '100px'}}
                        >
                          Actions
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button
                              className="dropdown-item"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewOrder(order);
                              }}
                            >
                              View
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateOrder(order);
                              }}
                            >
                              Update
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">No assigned orders available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <Pagination className="order-pagination" currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default ArtisanManageOrders;
