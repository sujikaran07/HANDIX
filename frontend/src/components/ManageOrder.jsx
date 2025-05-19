import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons';
import { FaGift } from 'react-icons/fa';
import Pagination from './Pagination';
import AssignArtisanModal from './AssignArtisanModal';
import '../styles/admin/AdminOrder.css';

const ManageOrder = ({ onAddOrderClick, onViewOrder }) => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomized, setSelectedCustomized] = useState(['Yes', 'No']);
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ordersPerPage = 7;

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedOrderAction, setSelectedOrderAction] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/orders');
      console.log("API Response:", response.data);
      
      // Fix: Check if response.data is an object with orders property or if it's directly an array
      const ordersData = response.data.orders || response.data || [];
      
      // Make sure we're working with an array before mapping
      const ordersArray = Array.isArray(ordersData) ? ordersData : [];
      
      const formattedOrders = ordersArray.map(order => {
        // Extract only first name for display
        let firstName = 'Unknown';
        if (order.customer && order.customer.first_name) {
          firstName = order.customer.first_name;
        } else if (order.customerName && order.customerName.includes(' ')) {
          // Extract first name from full name
          firstName = order.customerName.split(' ')[0];
        } else if (order.customer && order.customer.firstName) {
          firstName = order.customer.firstName;
        } else if (order.firstName) {
          firstName = order.firstName;
        } else if (order.customerName) {
          // If customerName exists but doesn't have spaces, use it as is
          firstName = order.customerName;
        }
        
        // Format date in MM/DD/YY, h:mm AM/PM format
        let orderDate = 'N/A';
        if (order.orderDate || order.order_date) {
          const dateValue = order.orderDate || order.order_date;
          const parsedDate = new Date(dateValue);
          if (!isNaN(parsedDate.getTime())) {
            orderDate = parsedDate.toLocaleString('en-US', {
              month: 'numeric',
              day: 'numeric',
              year: '2-digit',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });
          }
        }
        
        const totalAmount = order.totalAmount || order.total_amount || 0;
        
        const customizedValue = order.customized || 'No';
        const customized = customizedValue.charAt(0).toUpperCase() + customizedValue.slice(1);
        
        // Show "Awaiting Payment" as "To Pay" 
        let status = order.orderStatus || order.order_status || 'Processing';
        if (status === 'Awaiting Payment') {
          status = 'To Pay';
        }
        
        // Keep the complete order object for the view form
        return {
          id: order.order_id || order.id,
          customerName: firstName, 
          orderDate,
          totalAmount: `${totalAmount}`,  
          customized,
          assignedArtisan: order.assignedArtisan || order.assigned_artisan || 'Not Assigned',
          status,
          items: order.items || [],
          customerEmail: order.customerEmail || order.customerInfo?.email,
          customerPhone: order.customerPhone || order.customerInfo?.phone,
          customer_id: order.customer_id || order.customerInfo?.c_id,
          shippingAddress: order.shippingAddress,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          shippingMethod: order.shippingMethod,
          additionalFees: order.additionalFees,
          shippingCost: order.shippingFee,
          subtotal: order.subtotal,
          notes: order.notes,
          deliveryDate: order.deliveryDate
        };
      });
      
      console.log("Formatted Orders:", formattedOrders);
      setOrders(formattedOrders);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomizedChange = (customized) => {
    setSelectedCustomized((prevSelected) =>
      prevSelected.includes(customized)
        ? prevSelected.filter((type) => type !== customized)
        : [...prevSelected, customized]
    );
  };

  const handleConfirmOrder = async () => {
    if (!selectedOrderAction) return;
    
    setConfirmLoading(true);
    setActionError(null);
    
    try {
      const response = await axios.put(
        `http://localhost:5000/api/orders/${selectedOrderAction.id}/confirm`
      );
      
      console.log('Order confirmed:', response.data);
      alert('Order has been confirmed and processing has begun. A confirmation email has been sent to the customer.');
      setConfirmModalVisible(false);
      fetchOrders(); // Refresh orders list
    } catch (error) {
      console.error('Failed to confirm order:', error);
      setActionError(error.response?.data?.message || 'Failed to confirm order. Please try again.');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderAction) return;
    
    if (!cancelReason.trim()) {
      setActionError('Please provide a reason for cancellation');
      return;
    }
    
    setConfirmLoading(true);
    setActionError(null);
    
    try {
      const response = await axios.put(
        `http://localhost:5000/api/orders/${selectedOrderAction.id}/cancel`,
        { cancellationReason: cancelReason }
      );
      
      console.log('Order cancelled:', response.data);
      alert('Order has been cancelled successfully');
      setCancelModalVisible(false);
      setCancelReason('');
      fetchOrders(); // Refresh orders list
    } catch (error) {
      console.error('Failed to cancel order:', error);
      setActionError(error.response?.data?.message || 'Failed to cancel order. Please try again.');
    } finally {
      setConfirmLoading(false);
    }
  };

  const showConfirmModal = (order) => {
    setSelectedOrderAction(order);
    setConfirmModalVisible(true);
  };

  const showCancelModal = (order) => {
    setSelectedOrderAction(order);
    setCancelModalVisible(true);
    setCancelReason('');
  };

  const filteredOrders = orders.filter(order => {
    return (
      (selectedCustomized.includes(order.customized)) &&
      (filterStatus === 'All' || order.status === filterStatus) &&
      (order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       order.customized?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        <div className="manage-order-header d-flex justify-content-between align-items-center mb-3">
          <div className="title-section">
            <div className="icon-and-title">
              <FaGift className="order-icon" />
              <div className="text-section">
                <h2>Orders</h2>
                <p>Manage your orders</p>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <div className="search-bar me-2">
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
            <button className="export-btn">
              <FontAwesomeIcon icon={faCloudDownloadAlt} /> Export
            </button>
          </div>
        </div>

        <div className="filter-section mb-3 d-flex justify-content-between align-items-center">
          <div className="d-flex">
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                id="customizedYesCheckbox"
                value="Yes"
                checked={selectedCustomized.includes('Yes')}
                onChange={() => handleCustomizedChange('Yes')}
              />
              <label className="form-check-label" htmlFor="customizedYesCheckbox">Yes</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                id="customizedNoCheckbox"
                value="No"
                checked={selectedCustomized.includes('No')}
                onChange={() => handleCustomizedChange('No')}
              />
              <label className="form-check-label" htmlFor="customizedNoCheckbox">No</label>
            </div>
          </div>
          {selectedCustomized.includes('Yes') && (
            <div className="filter-dropdown">
              <div className="input-group">
                <span className="input-group-text bg-light border-0">
                  <FontAwesomeIcon icon={faFilter} />
                </span>
                <select
                  className="form-select border-0"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Review">Review</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Canceled">Canceled</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: '1 1 auto', overflowY: 'auto', marginTop: '20px' }}>
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : (
            <table className="table table-bordered table-striped order-table">
              <thead>
                <tr>
                  <th>O-ID</th>
                  <th>Customer </th>
                  <th>Order Date</th>
                  <th>Total Amount</th>
                  <th>Customized</th>
                  <th>Assigned Artisan</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.length > 0 ? (
                  currentOrders.map(order => {
                    // Ensure status is always up to date before rendering
                    let displayStatus = order.status;
                    
                    // Determine if we should disable the assign artisan option
                    const artisanAlreadyAssigned = order.assignedArtisan && order.assignedArtisan !== 'Not Assigned';
                    
                    return (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.customerName}</td>
                        <td>{order.orderDate}</td>
                        <td>{order.totalAmount}</td>
                        <td>{order.customized}</td>
                        <td>{order.assignedArtisan || 'Not Assigned'}</td>
                        <td className={`status ${displayStatus.toLowerCase().replace(' ', '-')}`}>
                          {displayStatus}
                        </td>
                        <td className="action-buttons">
                          <div className="dropdown">
                            <button className="btn dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                              Actions
                            </button>
                            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                              <li>
                                <button className="dropdown-item" onClick={() => onViewOrder(order)}>View</button>
                              </li>
                              
                              {!['Delivered', 'Canceled', 'Cancelled'].includes(order.status) && !artisanAlreadyAssigned && (
                                <li>
                                  <button className="dropdown-item" onClick={() => onViewOrder(order, 'assign')}>Assign Artisan</button>
                                </li>
                              )}
                              
                              {/* Show a disabled, informative version of the button if an artisan is already assigned */}
                              {!['Delivered', 'Canceled', 'Cancelled'].includes(order.status) && artisanAlreadyAssigned && (
                                <li>
                                  <button 
                                    className="dropdown-item disabled" 
                                    title="An artisan is already assigned to this order"
                                    style={{ color: '#6c757d', fontStyle: 'italic' }}
                                  >
                                    Assigned
                                  </button>
                                </li>
                              )}
                              
                              {order.customized !== 'Yes' && ['Pending', 'To Pay'].includes(order.status) && (
                                <li>
                                  <button className="dropdown-item" onClick={() => showConfirmModal(order)}>Confirm</button>
                                </li>
                              )}
                              
                              {!['Delivered', 'Canceled', 'Cancelled'].includes(order.status) && (
                                <li>
                                  <button className="dropdown-item" onClick={() => showCancelModal(order)}>Cancel</button>
                                </li>
                              )}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">No orders available</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {!loading && !error && (
          <Pagination className="order-pagination" currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModalVisible && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header py-2">
                <h5 className="modal-title">Confirm Order</h5>
                <button type="button" className="btn-close" onClick={() => setConfirmModalVisible(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to confirm Order #{selectedOrderAction?.id}?</p>
                <p>This will change the order status to "Processing" and notify the customer.</p>
                {actionError && (
                  <div className="alert alert-danger py-2">{actionError}</div>
                )}
              </div>
              <div className="modal-footer py-2">
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-secondary" 
                  onClick={() => setConfirmModalVisible(false)}
                  style={{
                    borderRadius: '20px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    borderWidth: '1px'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-sm btn-primary" 
                  onClick={handleConfirmOrder}
                  disabled={confirmLoading}
                  style={{
                    borderRadius: '20px',
                    paddingLeft: '25px',
                    paddingRight: '25px',
                    width: '140px'
                  }}
                >
                  {confirmLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Confirming...
                    </>
                  ) : "Confirm Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Cancel Modal */}
      {cancelModalVisible && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header py-2">
                <h5 className="modal-title">Cancel Order</h5>
                <button type="button" className="btn-close" onClick={() => setCancelModalVisible(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to cancel Order #{selectedOrderAction?.id}?</p>
                <p className="text-muted mb-3">This action cannot be undone, and the customer will be notified.</p>
                
                <div className="mb-3">
                  <label htmlFor="cancelReason" className="form-label small">Reason for Cancellation</label>
                  <textarea 
                    className="form-control form-control-sm" 
                    id="cancelReason"
                    rows="2"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please provide a reason for cancellation"
                  ></textarea>
                </div>
                
                {actionError && (
                  <div className="alert alert-danger py-2">{actionError}</div>
                )}
              </div>
              <div className="modal-footer py-2">
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-secondary" 
                  onClick={() => setCancelModalVisible(false)}
                  style={{
                    borderRadius: '20px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    borderWidth: '1px'
                  }}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-sm btn-danger" 
                  onClick={handleCancelOrder}
                  disabled={confirmLoading}
                  style={{
                    borderRadius: '20px',
                    paddingLeft: '25px',
                    paddingRight: '25px',
                    width: '140px'
                  }}
                >
                  {confirmLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : "Cancel Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrder;
