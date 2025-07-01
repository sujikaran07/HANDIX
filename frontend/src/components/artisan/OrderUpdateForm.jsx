import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';

// Helper function to check if order is customized
const isCustomizedOrder = (customized) =>
  customized === 'Yes' || customized === 'yes' || customized === true || customized === 'true';

// Form component for updating order status with delivery range and notes
const OrderUpdateForm = ({ order, onBack, onStatusUpdate }) => {
  // State management for order updates
  const [orderStatus, setOrderStatus] = useState(order?.status || 'Pending');
  const [notes, setNotes] = useState('');
  const [estimatedDeliveryRange, setEstimatedDeliveryRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (order) {
      setOrderStatus(order.status || 'Pending');
      setEstimatedDeliveryRange({
        startDate: order.deliveryStartDate
          ? new Date(order.deliveryStartDate).toISOString().split('T')[0]
          : '',
        endDate: order.deliveryEndDate
          ? new Date(order.deliveryEndDate).toISOString().split('T')[0]
          : ''
      });
    }
  }, [order]);

  // Handle order status update submission
  const handleSubmit = async (status) => {
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
          status,
          notes,
          deliveryStartDate: estimatedDeliveryRange.startDate || null,
          deliveryEndDate: estimatedDeliveryRange.endDate || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        alert("Order status updated successfully!");
        if (onStatusUpdate) {
          onStatusUpdate(order.o_id, status);
        }
        window.location.href = '/artisan/assignorders';
      }
    } catch (error) {
      alert(`Failed to update order status: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delivery date range changes with validation
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setEstimatedDeliveryRange(prev => ({
      ...prev,
      startDate: newStartDate
    }));
    // Ensure end date is not before start date
    if (estimatedDeliveryRange.endDate && newStartDate > estimatedDeliveryRange.endDate) {
      setEstimatedDeliveryRange(prev => ({
        ...prev,
        endDate: newStartDate
      }));
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEstimatedDeliveryRange(prev => ({
      ...prev,
      endDate: newEndDate
    }));
  };

  const handleBackClick = () => {
    window.location.href = '/artisan/assignorders';
  };

  // Render action buttons based on order type and current status
  const customized = isCustomizedOrder(order.customized);
  let actionButtons = null;
  if (customized) {
    // Status flow for customized orders
    switch (order.status) {
      case 'Review':
        actionButtons = (
          <>
            <button className="btn btn-success me-2" disabled={submitting || !estimatedDeliveryRange.startDate || !estimatedDeliveryRange.endDate} onClick={() => handleSubmit('Processing')}>Confirm</button>
            <button className="btn btn-danger" disabled={submitting} onClick={() => handleSubmit('Cancelled')}>Cancel Order</button>
          </>
        );
        break;
      case 'Processing':
        actionButtons = (
          <button className="btn btn-success" disabled={submitting} onClick={() => handleSubmit('Completed')}>Mark as Completed</button>
        );
        break;
      case 'Completed':
        actionButtons = (
          <button className="btn btn-primary" disabled={submitting} onClick={() => handleSubmit('Shipped')}>Mark as Shipped</button>
        );
        break;
      case 'Shipped':
        actionButtons = (
          <button className="btn btn-primary" disabled={submitting} onClick={() => handleSubmit('Delivered')}>Mark as Delivered</button>
        );
        break;
      default:
        actionButtons = null;
    }
  } else {
    // Status flow for regular orders
    switch (order.status) {
      case 'Processing':
        actionButtons = (
          <button className="btn btn-success" disabled={submitting} onClick={() => handleSubmit('Completed')}>Mark as Completed</button>
        );
        break;
      case 'Completed':
        actionButtons = (
          <button className="btn btn-primary" disabled={submitting} onClick={() => handleSubmit('Shipped')}>Mark as Shipped</button>
        );
        break;
      case 'Shipped':
        actionButtons = (
          <button className="btn btn-primary" disabled={submitting} onClick={() => handleSubmit('Delivered')}>Mark as Delivered</button>
        );
        break;
      default:
        actionButtons = null;
    }
  }

  // Format order date with multiple fallback options
  const formatOrderDate = (order) => {
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
      return 'Invalid Date';
    }
  };

  // Get CSS class for status badge styling
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

  // Format delivery date range for display
  const formatDeliveryRange = (start, end) => {
    if (start && end) {
      return `Assigned Delivery: ${new Date(start).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} to ${new Date(end).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`;
    } else if (start) {
      return `Assigned Delivery Start: ${new Date(start).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`;
    } else if (end) {
      return `Assigned Delivery End: ${new Date(end).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`;
    }
    return '';
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
          {/* Header with back button and current status */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <div 
                onClick={handleBackClick}
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

          {/* Order information display */}
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
                    <div className="col-md-3">
                      <label className="text-muted small mb-1" style={{fontSize: "14px"}}>Delivery Date</label>
                      <div className="bg-light p-2 rounded input-group-sm" style={{height: "38px", lineHeight: "24px", fontSize: "15px", overflow: "hidden", textOverflow: "ellipsis", paddingTop: "6px"}}>
                        {order?.deliveryEndDate ? new Date(order.deliveryEndDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery range and notes form */}
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-2">
                  <form className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label text-muted small mb-1 d-flex align-items-center" style={{fontSize: "14px"}}>
                        <FaCalendarAlt className="me-1" size={14} /> 
                        Delivery Range
                      </label>
                      {formatDeliveryRange(order.deliveryStartDate, order.deliveryEndDate) && (
                        <div className="mb-2 text-primary small">
                          {formatDeliveryRange(order.deliveryStartDate, order.deliveryEndDate)}
                        </div>
                      )}
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
                    <div className="col-md-6">
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
          
          {/* Action buttons based on order status */}
          <div className="mt-auto d-flex justify-content-end pt-2 border-top" style={{ marginBottom: '15px' }}>
            {validationError && (
              <div className="text-danger me-3 align-self-center">{validationError}</div>
            )}
            {actionButtons}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderUpdateForm;
