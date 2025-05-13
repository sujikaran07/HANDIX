import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faMoneyBillWave, faUser, faCalendarAlt, faShoppingCart, faCreditCard, faTag } from '@fortawesome/free-solid-svg-icons';
import '../styles/admin/AdminTransaction.css';

const TransactionViewForm = ({ transaction, onBack }) => {
  const getStatusClass = (status) => {
    if (!status) return '';
    
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      case 'refunded':
        return 'status-refunded';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    
    try {
      return typeof amount === 'number' 
        ? amount.toLocaleString('en-US', { style: 'currency', currency: 'LKR' })
        : amount;
    } catch (error) {
      console.error('Error formatting currency:', error);
      return amount;
    }
  };

  const handleRefund = async () => {
    try {
      const confirmed = window.confirm(`Are you sure you want to refund transaction ${transaction.transaction_id} for ${formatCurrency(transaction.amount)}?`);
      if (!confirmed) return;
      
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) {
        console.error('No token found in localStorage');
        alert('Authentication required. Please login again.');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/admin/transactions/${transaction.transaction_id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Refund processed successfully!');
          onBack(); // Return to transaction list
        } else {
          alert(`Failed to process refund: ${data.message || 'Unknown error'}`);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to process refund. Server returned: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('An error occurred while processing the refund. Please try again.');
    }
  };

  return (
    <div className="container mt-4">
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff' }}>
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <button className="btn btn-light me-3" onClick={onBack} style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                <FontAwesomeIcon icon={faArrowLeft} /> Back
              </button>
              <h3 className="mb-0">Transaction Details</h3>
            </div>
            
            {transaction.transactionStatus === 'Completed' && (
              <div>
                <button 
                  className="btn btn-danger"
                  onClick={handleRefund}
                >
                  <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                  Process Refund
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="transaction-details">
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="detail-card mb-3 p-3">
                <h5 className="detail-header">
                  <FontAwesomeIcon icon={faTag} className="me-2" />
                  Transaction Info
                </h5>
                <div className="detail-row">
                  <span className="detail-label">Transaction ID:</span>
                  <span className="detail-value">{transaction.transaction_id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`detail-value status-badge ${getStatusClass(transaction.transactionStatus)}`}>
                    {transaction.transactionStatus || 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date & Time:</span>
                  <span className="detail-value">
                    {formatDate(transaction.transactionDate)}
                  </span>
                </div>
              </div>

              <div className="detail-card mb-3 p-3">
                <h5 className="detail-header">
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Customer Info
                </h5>
                <div className="detail-row">
                  <span className="detail-label">Customer ID:</span>
                  <span className="detail-value">{transaction.c_id || 'N/A'}</span>
                </div>
                {transaction.Customer && (
                  <>
                    <div className="detail-row">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">{transaction.Customer.name || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{transaction.Customer.email || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{transaction.Customer.phone || 'N/A'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="detail-card mb-3 p-3">
                <h5 className="detail-header">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
                  Payment Info
                </h5>
                <div className="detail-row">
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value fw-bold">
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Method:</span>
                  <span className="detail-value">{transaction.paymentMethod || 'N/A'}</span>
                </div>
                {transaction.paymentGateway && (
                  <div className="detail-row">
                    <span className="detail-label">Payment Gateway:</span>
                    <span className="detail-value">{transaction.paymentGateway}</span>
                  </div>
                )}
                {transaction.gatewayTransactionId && (
                  <div className="detail-row">
                    <span className="detail-label">Gateway Transaction ID:</span>
                    <span className="detail-value">{transaction.gatewayTransactionId}</span>
                  </div>
                )}
                {transaction.currency && (
                  <div className="detail-row">
                    <span className="detail-label">Currency:</span>
                    <span className="detail-value">{transaction.currency}</span>
                  </div>
                )}
              </div>

              <div className="detail-card mb-3 p-3">
                <h5 className="detail-header">
                  <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                  Order Info
                </h5>
                <div className="detail-row">
                  <span className="detail-label">Order ID:</span>
                  <span className="detail-value">{transaction.order_id || 'N/A'}</span>
                </div>
                {transaction.Order && (
                  <>
                    <div className="detail-row">
                      <span className="detail-label">Order Status:</span>
                      <span className="detail-value">{transaction.Order.order_status || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Order Total:</span>
                      <span className="detail-value">
                        {transaction.Order.total_price 
                          ? formatCurrency(transaction.Order.total_price) 
                          : 'N/A'}
                      </span>
                    </div>
                  </>
                )}
                {/* View Order Details button */}
                <div className="mt-2">
                  <button className="btn btn-outline-primary btn-sm">
                    View Order Details
                  </button>
                </div>
              </div>
            </div>
          </div>

          {transaction.notes && (
            <div className="detail-card p-3">
              <h5 className="detail-header">Notes</h5>
              <p className="detail-notes">{transaction.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionViewForm; 