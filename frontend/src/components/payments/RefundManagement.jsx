import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const RefundManagement = ({ payment, onBackToPayments }) => {
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundType, setRefundType] = useState('full');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  
  useEffect(() => {
    if (payment) {
      setRefundAmount(payment.amount.toFixed(2));
      fetchOrderDetails(payment.order_id);
    }
  }, [payment]);
  
  const fetchOrderDetails = async (orderId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      // In a real app, this would be an API call
      // Mock data for now
      const mockOrderDetails = {
        order_id: orderId,
        status: 'Processing',
        created_at: new Date().toISOString(),
        items: [
          { id: 1, name: 'Handcrafted Basket', price: 1500, quantity: 1 },
          { id: 2, name: 'Woven Mat', price: 1000, quantity: 2 }
        ],
        customer: {
          id: 101,
          name: payment.customer_name,
          email: 'customer@example.com',
          phone: '+94 77 123 4567'
        },
        payment_details: {
          id: payment.payment_id,
          method: payment.payment_method,
          status: payment.status,
          amount: payment.amount,
          date: payment.payment_date
        },
        refund_eligible: true,
        cancel_reason: null,
        cancelled_by: null
      };
      
      setOrderDetails(mockOrderDetails);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details');
      setLoading(false);
    }
  };
  
  const handleRefundTypeChange = (e) => {
    const type = e.target.value;
    setRefundType(type);
    
    if (type === 'full') {
      setRefundAmount(payment.amount.toFixed(2));
    } else {
      setRefundAmount('');
    }
  };
  
  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    
    if (!refundReason) {
      setError('Please provide a reason for the refund');
      return;
    }
    
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      setError('Please enter a valid refund amount');
      return;
    }
    
    if (parseFloat(refundAmount) > payment.amount) {
      setError('Refund amount cannot exceed the original payment amount');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      // For demo purposes, we'll just simulate a successful response
      setTimeout(() => {
        alert(`Refund of Rs ${refundAmount} processed successfully for order ${payment.order_id}`);
        setLoading(false);
        onBackToPayments();
      }, 1500);
      
      /* 
      // In a real application, you'd make an actual API call:
      const response = await fetch(`http://localhost:5000/api/admin/payments/${payment.payment_id}/refund`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(refundAmount),
          reason: refundReason,
          refund_type: refundType
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        alert('Refund processed successfully!');
        onBackToPayments();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to process refund');
      }
      setLoading(false);
      */
    } catch (error) {
      console.error('Error processing refund:', error);
      setError('An error occurred while processing the refund');
      setLoading(false);
    }
  };
  
  if (!payment || !orderDetails) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  // Calculate refund eligibility rules
  const orderDate = new Date(orderDetails.created_at);
  const currentDate = new Date();
  const daysSinceOrder = Math.floor((currentDate - orderDate) / (1000 * 60 * 60 * 24));
  const isWithin7Days = daysSinceOrder <= 7;
  
  // Determine if the customer can get a full refund based on order status and time
  const isEligibleForFullRefund = isWithin7Days && ['Pending', 'Processing'].includes(orderDetails.status);
  
  return (
    <div className="refund-management">
      <div className="d-flex align-items-center mb-3">
        <button className="btn btn-link text-decoration-none" onClick={onBackToPayments}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Payments
        </button>
        <h4 className="mb-0 ms-3">Refund Management - Order #{payment.order_id}</h4>
      </div>
      
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5>Order & Payment Information</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Order Details</h6>
                  <p><strong>Order Number:</strong> {orderDetails.order_id}</p>
                  <p><strong>Status:</strong> {orderDetails.status}</p>
                  <p><strong>Date:</strong> {new Date(orderDetails.created_at).toLocaleString()}</p>
                  <p><strong>Customer:</strong> {orderDetails.customer.name}</p>
                  <p><strong>Email:</strong> {orderDetails.customer.email}</p>
                </div>
                <div className="col-md-6">
                  <h6>Payment Details</h6>
                  <p><strong>Payment ID:</strong> {payment.payment_id}</p>
                  <p><strong>Amount:</strong> Rs {payment.amount.toFixed(2)}</p>
                  <p><strong>Method:</strong> {payment.payment_method}</p>
                  <p><strong>Date:</strong> {new Date(payment.payment_date).toLocaleString()}</p>
                  <p><strong>Status:</strong> {payment.status}</p>
                </div>
              </div>
              
              <hr />
              
              <h6>Purchased Items</h6>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails.items.map(item => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>Rs {item.price.toFixed(2)}</td>
                        <td>Rs {(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan="3" className="text-end">Total</th>
                      <th>Rs {payment.amount.toFixed(2)}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
          
          <div className="card mb-4">
            <div className="card-header">
              <h5>Refund Policy</h5>
            </div>
            <div className="card-body">
              <div className="alert alert-info">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                <strong>Refund Eligibility Rules:</strong>
                <ul className="mb-0 mt-2">
                  <li>Full refund is available if the customer cancels before order confirmation</li>
                  <li>Full refund is available if the order is canceled by admin or artisan</li>
                  <li>Full refund is available within 7 days of order placement for pending or processing orders</li>
                  <li>Partial refunds are at the discretion of the administrator</li>
                  <li>No refund is available for delivered or completed orders unless specifically approved</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>Process Refund</h5>
            </div>
            <div className="card-body">
              {payment.status === 'Refunded' ? (
                <div className="alert alert-warning">
                  This payment has already been refunded.
                </div>
              ) : (
                <form onSubmit={handleRefundSubmit}>
                  {error && (
                    <div className="alert alert-danger">{error}</div>
                  )}
                  
                  <div className="mb-3">
                    <label className="form-label">Refund Type</label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="refundType"
                        id="fullRefund"
                        value="full"
                        checked={refundType === 'full'}
                        onChange={handleRefundTypeChange}
                      />
                      <label className="form-check-label" htmlFor="fullRefund">
                        Full Refund (Rs {payment.amount.toFixed(2)})
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="refundType"
                        id="partialRefund"
                        value="partial"
                        checked={refundType === 'partial'}
                        onChange={handleRefundTypeChange}
                      />
                      <label className="form-check-label" htmlFor="partialRefund">
                        Partial Refund
                      </label>
                    </div>
                  </div>
                  
                  {refundType === 'partial' && (
                    <div className="mb-3">
                      <label htmlFor="refundAmount" className="form-label">Refund Amount (Rs)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="refundAmount"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        required
                        min="0.01"
                        max={payment.amount}
                        step="0.01"
                      />
                      <div className="form-text">
                        Maximum refund: Rs {payment.amount.toFixed(2)}
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label htmlFor="refundReason" className="form-label">Reason for Refund</label>
                    <select
                      className="form-select"
                      id="refundReason"
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      required
                    >
                      <option value="">Select a reason</option>
                      <option value="customer_request">Customer requested cancellation</option>
                      <option value="order_issue">Problem with the order</option>
                      <option value="product_unavailable">Product unavailable</option>
                      <option value="duplicate_order">Duplicate order</option>
                      <option value="admin_cancellation">Cancelled by admin</option>
                      <option value="artisan_cancellation">Cancelled by artisan</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  {refundReason === 'other' && (
                    <div className="mb-3">
                      <label htmlFor="refundNote" className="form-label">Additional Notes</label>
                      <textarea
                        className="form-control"
                        id="refundNote"
                        rows="3"
                      ></textarea>
                    </div>
                  )}
                  
                  <button 
                    type="submit" 
                    className="btn btn-warning w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : (
                      'Process Refund'
                    )}
                  </button>
                  
                  {isEligibleForFullRefund && (
                    <div className="alert alert-success mt-3 mb-0">
                      <strong>Customer eligible for full refund!</strong>
                      <p className="mb-0 small">Order is within 7 days and not yet shipped.</p>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundManagement;
