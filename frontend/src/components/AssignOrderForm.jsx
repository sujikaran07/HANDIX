import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Pagination from './Pagination';

const AssignOrderForm = ({ onSave, onCancel, artisan }) => {
  // State management for orders and UI
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 3;

  useEffect(() => {
    fetchAvailableOrders();
  }, []);

  // Fetch orders that can be assigned to artisans
  const fetchAvailableOrders = async () => {
    try {
      setLoading(true);
      const BACKEND_URL = 'http://localhost:5000';
      const response = await axios.get(`${BACKEND_URL}/api/artisans/assignable-orders`);
      
      let ordersData = [];
      if (Array.isArray(response.data.orders)) {
        ordersData = response.data.orders;
      } else if (Array.isArray(response.data)) {
        ordersData = response.data;
      }
      
      // Normalize customized field for consistent boolean values
      const formattedOrders = ordersData.map(order => ({
        ...order,
        customized: order.customized === true || 
                   order.customized === 'true' || 
                   order.customized === 'Yes' || 
                   order.customized === 'yes'
      }));
      
      setOrders(formattedOrders);
    } catch (err) {
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  // Assign selected order to the artisan
  const handleAssignOrder = async () => {
    if (!selectedOrder || !artisan) {
      setError('Please select an order to assign');
      return;
    }
    
    try {
      setSaving(true);
      const BACKEND_URL = 'http://localhost:5000';
      
      const response = await axios.put(`${BACKEND_URL}/api/orders/${selectedOrder.id}`, {
        assignedArtisanId: artisan.id,
        assignedArtisan: artisan.name,
        orderStatus: 'Processing'
      });
      
      if (onSave) {
        onSave(response.data);
      }
      alert(`Order #${selectedOrder.id} successfully assigned to artisan: ${artisan.name} (${artisan.id})`);
    } catch (err) {
      setError('Failed to assign order. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Filter orders based on search criteria
  const filteredOrders = orders.filter(order => {
    return (
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination calculations
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
    
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (err) {
      return dateString;
    }
  };

  // Get badge style based on order type
  const getOrderTypeBadge = (isCustomized) => {
    return isCustomized ? 'bg-warning text-dark' : 'bg-info text-white';
  };

  return (
    <div className="container-fluid p-0">
      {/* Header with back button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <button 
            onClick={onCancel} 
            className="btn btn-light rounded-circle me-3"
            style={{ width: "36px", height: "36px" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
          </button>
          <h5 className="mb-0" style={{ fontSize: "1.3rem" }}>Assign Order</h5>
        </div>
      </div>

      {/* Artisan information display */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted mb-1">Artisan</div>
              <div style={{ fontSize: "1.1rem" }}><strong>{artisan?.id}: {artisan?.name}</strong></div>
            </div>
            <div>
              <div className="text-muted mb-1">Status</div>
              <div style={{
                color: artisan?.availability === 'Available' ? '#28a745' : '#dc3545',
                fontSize: "1.1rem",
                fontWeight: "500"
              }}>
                {artisan?.availability} ({artisan?.ongoingOrders})
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* Available orders list */}
        <div className="col-md-7">
          <div className="card shadow-sm" style={{ height: "300px" }}>
            <div className="card-header bg-light py-2 d-flex justify-content-between align-items-center">
              <div className="fw-bold">Available Orders</div>
              <div className="input-group input-group-sm" style={{width: "150px"}}>
                <span className="input-group-text">
                  <FontAwesomeIcon icon={faSearch} size="xs" />
                </span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="card-body p-0 d-flex flex-column" style={{ height: "calc(100% - 42px)" }}>
              {loading ? (
                <div className="text-center p-3 flex-grow-1 d-flex align-items-center justify-content-center">Loading...</div>
              ) : error ? (
                <div className="text-center p-3 flex-grow-1 d-flex align-items-center justify-content-center text-danger">{error}</div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center p-3 flex-grow-1 d-flex align-items-center justify-content-center">No available orders found</div>
              ) : (
                <>
                  {/* Orders table */}
                  <div className="table-responsive flex-grow-1" style={{overflowY: 'auto'}}>
                    <table className="table table-sm table-hover mb-0">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th className="px-3 py-2 border-bottom">
                            <div className="d-flex align-items-center">
                              <span className="me-1" style={{ fontSize: '0.8rem', color: '#6c757d' }}></span>
                              <span>Order ID</span>
                            </div>
                          </th>
                          <th className="px-3 py-2 border-bottom">
                            <div className="d-flex align-items-center">
                              <span className="me-1" style={{ fontSize: '0.8rem', color: '#6c757d' }}></span>
                              <span>Date</span>
                            </div>
                          </th>
                          <th className="px-3 py-2 border-bottom">
                            <div className="d-flex align-items-center">
                              <span className="me-1" style={{ fontSize: '0.8rem', color: '#6c757d' }}></span>
                              <span>Order Type</span>
                              <span className="ms-1" style={{ fontSize: '0.65rem', color: '#6c757d' }}></span>
                            </div>
                          </th>
                          <th className="px-3 py-2 text-end border-bottom">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentOrders.map(order => (
                          <tr key={order.id} className={selectedOrder && selectedOrder.id === order.id ? 'table-active' : ''}>
                            <td className="px-3 py-2 align-middle fw-medium">{order.id}</td>
                            <td className="px-3 py-2 align-middle">{formatDate(order.orderDate)}</td>
                            <td className="px-3 py-2 align-middle">
                              <span className={`badge ${getOrderTypeBadge(order.customized)}`} 
                                style={{padding: '0.35rem 0.65rem', fontSize: '0.75rem', fontWeight: 'normal'}}>
                                {order.customized ? 'Customized' : 'Regular'}
                              </span>
                            </td>
                            <td className="px-3 py-2 align-middle text-end">
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleSelectOrder(order)}
                                style={{borderRadius: '4px', transition: 'all 0.2s'}}
                              >
                                Select
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="d-flex justify-content-center py-2 border-top mt-auto">
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Selected order details */}
        <div className="col-md-5">
          <div className="card shadow-sm" style={{ height: "300px" }}>
            <div className="card-header bg-light py-3">
              <div className="fw-bold" style={{ fontSize: "1rem" }}>Selected Order</div>
            </div>
            <div className="card-body p-3 d-flex flex-column" style={{ height: "calc(100% - 102px)" }}>
              {selectedOrder ? (
                <>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <div className="text-muted mb-1">Order ID</div>
                      <div style={{ fontSize: "1rem" }}>{selectedOrder.id}</div>
                    </div>
                    <div className="col-6">
                      <div className="text-muted mb-1">Date</div>
                      <div style={{ fontSize: "1rem" }}>{formatDate(selectedOrder.orderDate)}</div>
                    </div>
                    <div className="col-6">
                      <div className="text-muted mb-1">Type</div>
                      <span className={`badge ${getOrderTypeBadge(selectedOrder.customized)}`}
                        style={{ fontSize: "0.9rem", padding: "5px 10px" }}>
                        {selectedOrder.customized ? 'Customized' : 'Regular'}
                      </span>
                    </div>
                    <div className="col-6">
                      <div className="text-muted mb-1">Amount</div>
                      <div style={{ fontSize: "1rem" }}>
                        LKR {parseFloat(selectedOrder.totalAmount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 flex-grow-1 d-flex align-items-center justify-content-center">
                  <p className="text-muted mb-0">Select an order from the list</p>
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="card-footer bg-light py-3 d-flex justify-content-end mt-auto">
              <button
                className="btn btn-outline-secondary me-2 px-4"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary px-4"
                onClick={handleAssignOrder}
                disabled={!selectedOrder || saving}
              >
                {saving ? 'Assigning...' : 'Assign Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignOrderForm;
