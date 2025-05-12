import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowLeft, FaCheck, FaCalendarAlt } from 'react-icons/fa';

const OrderUpdateForm = ({ order, onBack, onStatusUpdate }) => {
  const [orderStatus, setOrderStatus] = useState(order?.status || 'Pending');
  const [notes, setNotes] = useState('');
  const [estimatedDeliveryRange, setEstimatedDeliveryRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      console.log("Order data received in update form:", order);
      setOrderStatus(order.status || 'Pending');
      
      // Set delivery range if available
      if (order.deliveryStartDate) {
        const startDate = new Date(order.deliveryStartDate);
        setEstimatedDeliveryRange(prev => ({
          ...prev,
          startDate: startDate.toISOString().split('T')[0]
        }));
      }
      
      if (order.deliveryEndDate) {
        const endDate = new Date(order.deliveryEndDate);
        setEstimatedDeliveryRange(prev => ({
          ...prev,
          endDate: endDate.toISOString().split('T')[0]
        }));
      }
    }
  }, [order]);

  // Format date for display with fallback options
  const formatOrderDate = (order) => {
    // Try different possible date field names
    const dateValue = order?.orderDate || order?.date || order?.order_date || order?.createdAt;
    
    if (!dateValue) return 'N/A';
    
    try {
      return new Date(dateValue).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return 'Invalid Date';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!order?.o_id) {
      alert("Order ID is missing");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('artisanToken');
      if (!token) {
        alert("You are not authorized. Please log in again.");
        return;
      }
      
      const response = await axios.put(
        `http://localhost:5000/api/orders/${order.o_id}/status`,
        { 
          status: orderStatus, 
          notes,
          deliveryStartDate: estimatedDeliveryRange.startDate || null,
          deliveryEndDate: estimatedDeliveryRange.endDate || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.status === 200) {
        alert("Order status updated successfully!");
        if (onStatusUpdate) {
          onStatusUpdate(order.o_id, orderStatus);
        }
        onBack();
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert(`Failed to update order status: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'pending': return 'bg-warning text-dark';
      case 'in production': return 'bg-info text-white';
      case 'completed': return 'bg-success text-white';
      case 'cancelled': return 'bg-danger text-white';
      case 'shipped': return 'bg-primary text-white';
      case 'delivered': return 'bg-success text-white';
      default: return 'bg-secondary text-white';
    }
  };

  // Handle change for the start date of the delivery range
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setEstimatedDeliveryRange(prev => ({ 
      ...prev, 
      startDate: newStartDate 
    }));
    
    // If end date is before start date, update end date
    if (estimatedDeliveryRange.endDate && newStartDate > estimatedDeliveryRange.endDate) {
      setEstimatedDeliveryRange(prev => ({ 
        ...prev, 
        endDate: newStartDate 
      }));
    }
  };

  // Handle change for the end date of the delivery range
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEstimatedDeliveryRange(prev => ({ 
      ...prev, 
      endDate: newEndDate 
    }));
  };

  // Fixed back button handler with proper fallback
  const handleBackClick = () => {
    try {
      // First try using the provided onBack function
      if (typeof onBack === 'function') {
        onBack();
      } else {
        console.warn("onBack is not a function, using fallback navigation");
        // Use window.history.back() as fallback
        window.history.back();
      }
    } catch (error) {
      console.error("Navigation error:", error);
      // Last resort fallback - direct URL navigation
      window.location.href = '/artisan/assignorders';
    }
  };

  return (
    <div className="container mt-3" style={{ height: 'calc(100vh - 70px)' }}>
      <div className="card" style={{ 
        borderRadius: '12px', 
        overflow: 'hidden', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="card-body p-3 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <div 
                onClick={handleBackClick} // Use our debug function instead
                className="me-2 d-flex align-items-center justify-content-center"
                style={{
                  cursor: 'pointer',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#f8f9fa',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                title="Back to Orders"
              >
                <FaArrowLeft size={12} />
              </div>
              <h6 className="mb-0">Update Order Status</h6>
            </div>
            <div className={`badge ${getStatusClass(orderStatus)}`} 
                  style={{ fontSize: '0.8rem', padding: '4px 8px' }}>
              {orderStatus}
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-2">
                  <div className="row g-2">
                    <div className="col-md-3">
                      <label className="text-muted small mb-1" style={{fontSize: "14px"}}>Order ID</label>
                      <div className="bg-light p-2 rounded input-group-sm" style={{height: "38px", lineHeight: "24px", fontSize: "15px", overflow: "hidden", textOverflow: "ellipsis", paddingTop: "6px"}}>
                        {order?.o_id || order?.order_id || 'N/A'}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <label className="text-muted small mb-1" style={{fontSize: "14px"}}>Customer</label>
                      <div className="bg-light p-2 rounded input-group-sm" style={{height: "38px", lineHeight: "24px", fontSize: "15px", overflow: "hidden", textOverflow: "ellipsis", paddingTop: "6px"}}>
                        {order?.customerName || order?.customer_first_name || 'N/A'}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <label className="text-muted small mb-1" style={{fontSize: "14px"}}>Date</label>
                      <div className="bg-light p-2 rounded input-group-sm" style={{height: "38px", lineHeight: "24px", fontSize: "15px", overflow: "hidden", textOverflow: "ellipsis", paddingTop: "6px"}}>
                        {formatOrderDate(order)}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <label className="text-muted small mb-1" style={{fontSize: "14px"}}>Current Status</label>
                      <div className="bg-light p-2 rounded input-group-sm" style={{height: "38px", lineHeight: "24px", fontSize: "15px", overflow: "hidden", textOverflow: "ellipsis", paddingTop: "6px"}}>
                        {order?.status || 'Pending'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-2">
                  <form onSubmit={handleSubmit} className="row g-2">
                    <div className="col-md-6">
                      <label htmlFor="orderStatus" className="form-label text-muted small mb-1" style={{fontSize: "14px"}}>New Status</label>
                      <select 
                        id="orderStatus"
                        className="form-select" 
                        value={orderStatus}
                        onChange={(e) => setOrderStatus(e.target.value)}
                        disabled={submitting}
                        style={{fontSize: "15px", height: "38px"}}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      {orderStatus === 'Cancelled' && (
                        <div className="text-danger small mt-1">
                          <strong>Warning:</strong> Cancelling an order cannot be undone.
                        </div>
                      )}
                      {(orderStatus === 'Completed' || orderStatus === 'Shipped' || orderStatus === 'Delivered') && (
                        <div className="text-success small mt-1">
                          <strong>Note:</strong> This will update the customer about their order status.
                        </div>
                      )}
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label text-muted small mb-1 d-flex align-items-center" style={{fontSize: "14px"}}>
                        <FaCalendarAlt className="me-1" size={14} /> 
                        Delivery Range
                      </label>
                      <div className="input-group">
                        <input
                          type="date"
                          id="startDate"
                          className="form-control"
                          value={estimatedDeliveryRange.startDate}
                          onChange={handleStartDateChange}
                          disabled={submitting}
                          min={new Date().toISOString().split('T')[0]}
                          style={{fontSize: "15px", cursor: "pointer", height: "38px"}}
                          onClick={(e) => e.target.showPicker()}
                          title="Click to select a date"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                        />
                        <span className="input-group-text" style={{fontSize: "14px", padding: "0 8px"}}>to</span>
                        <input
                          type="date"
                          id="endDate"
                          className="form-control"
                          value={estimatedDeliveryRange.endDate}
                          onChange={handleEndDateChange}
                          disabled={submitting}
                          min={estimatedDeliveryRange.startDate || new Date().toISOString().split('T')[0]}
                          style={{fontSize: "15px", cursor: "pointer", height: "38px"}}
                          onClick={(e) => e.target.showPicker()}
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                        />
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <label htmlFor="notes" className="form-label text-muted small mb-1" style={{fontSize: "14px"}}>Notes (optional)</label>
                      <textarea
                        id="notes"
                        className="form-control"
                        rows="2"
                        placeholder="Add any notes about this status update"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={submitting}
                        style={{fontSize: "15px", height: "76px", minHeight: "76px", resize: "none"}}
                      ></textarea>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-auto d-flex justify-content-end pt-2 border-top" style={{ marginBottom: '15px' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={submitting}
              style={{fontSize: "15px", height: "38px", padding: "6px 16px"}}
            >
              {submitting ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderUpdateForm;
