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

  // Format date string for display
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

  // Format currency amount for display
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

  // Handle refund processing for transactions
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
    <div className="container mt-4" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <div className="card transaction-view-card" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        <div className="card-body p-4 d-flex flex-column">
          {/* Header with back button and status */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <div 
                onClick={onBack} 
                className="me-3 d-flex align-items-center justify-content-center"
                style={{
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#f8f9fa',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#e9ecef'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                title="Back"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </div>
              <h5 className="mb-0">Transaction Details</h5>
            </div>
            <span className={`badge ${getStatusClass(transaction.transactionStatus)}`} style={{ fontSize: '0.9rem', padding: '5px 10px', textTransform: 'capitalize', backgroundColor: '#e6f2ff', color: '#3e87c3' }}>
              {transaction.transactionStatus || 'N/A'}
            </span>
          </div>

          {/* Scrollable content area */}
          <div className="row g-3 custom-scrollbar" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 160px)', paddingRight: '5px' }}>
            {/* Basic Transaction Information Section */}
            <div className="col-12">
              <div className="mb-3 h-100" style={{ border: '1px solid #e3e6f0', borderRadius: '12px', background: '#fff' }}>
                <div className="px-3 py-2" style={{ borderBottom: '1px solid #e3e6f0', fontWeight: 600, fontSize: '15px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>Basic Transaction Information</div>
                <div className="p-3">
                  <div className="row g-2">
                    <div className="col-md-6 mb-2">
                      <label className="text-muted small mb-1">Transaction ID</label>
                      <div className="bg-light p-2 rounded" style={{height: '36px', fontSize: '14px'}}>{transaction.transaction_id || 'N/A'}</div>
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="text-muted small mb-1">Order ID</label>
                      <div className="bg-light p-2 rounded" style={{height: '36px', fontSize: '14px'}}>{transaction.order_id || 'N/A'}</div>
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="text-muted small mb-1">Transaction Date</label>
                      <div className="bg-light p-2 rounded" style={{height: '36px', fontSize: '14px'}}>{formatDate(transaction.transactionDate)}</div>
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="text-muted small mb-1">Amount</label>
                      <div className="bg-light p-2 rounded" style={{height: '36px', fontSize: '14px'}}>{formatCurrency(transaction.amount)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information Section */}
            <div className="col-12">
              <div className="mb-3 h-100" style={{ border: '1px solid #e3e6f0', borderRadius: '12px', background: '#fff' }}>
                <div className="px-3 py-2" style={{ borderBottom: '1px solid #e3e6f0', fontWeight: 600, fontSize: '15px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>Customer Information</div>
                <div className="p-3">
                  <div className="row g-2">
                    <div className="col-md-6 mb-2">
                      <label className="text-muted small mb-1">Customer ID</label>
                      <div className="bg-light p-2 rounded" style={{height: '36px', fontSize: '14px'}}>{transaction.c_id || 'N/A'}</div>
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="text-muted small mb-1">Name</label>
                      <div className="bg-light p-2 rounded" style={{height: '36px', fontSize: '14px'}}>
                        {transaction.customer ? `${transaction.customer.firstName} ${transaction.customer.lastName}` : transaction.customerName || 'N/A'}
                      </div>
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="text-muted small mb-1">Email</label>
                      <div className="bg-light p-2 rounded" style={{height: '36px', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                        {transaction.customer?.email || transaction.customerEmail || 'N/A'}
                      </div>
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="text-muted small mb-1">Phone</label>
                      <div className="bg-light p-2 rounded" style={{height: '36px', fontSize: '14px'}}>
                        {transaction.customer?.phone || transaction.customerPhone || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information Section */}
            <div className="col-12">
              <div className="mb-3 h-100" style={{ border: '1px solid #e3e6f0', borderRadius: '12px', background: '#fff' }}>
                <div className="px-3 py-2" style={{ borderBottom: '1px solid #e3e6f0', fontWeight: 600, fontSize: '15px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>Payment Information</div>
                <div className="p-3">
                  <div className="row g-2">
                    <div className="col-md-6 mb-2">
                      <label className="text-muted small mb-1">Payment Method</label>
                      <div className="bg-light p-2 rounded" style={{height: '36px', fontSize: '14px'}}>{transaction.paymentMethod || 'N/A'}</div>
                    </div>
                    {transaction.paymentGateway && (
                      <div className="col-md-6 mb-2">
                        <label className="text-muted small mb-1">Payment Gateway</label>
                        <div className="bg-light p-2 rounded" style={{height: '36px', fontSize: '14px'}}>{transaction.paymentGateway}</div>
                      </div>
                    )}
                    {transaction.gatewayTransactionId && (
                      <div className="col-md-6 mb-2">
                        <label className="text-muted small mb-1">Gateway Transaction ID</label>
                        <div className="bg-light p-2 rounded" style={{height: '36px', fontSize: '14px'}}>{transaction.gatewayTransactionId}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Conditional Order Information Section */}
            {(transaction.Order || transaction.orderStatus || transaction.orderTotal) && (
              <div className="col-12">
                <div className="mb-3 h-100" style={{ border: '1px solid #e3e6f0', borderRadius: '12px', background: '#fff' }}>
                  <div className="px-3 py-2" style={{ borderBottom: '1px solid #e3e6f0', fontWeight: 600, fontSize: '15px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>Order Information</div>
                  <div className="p-3">
                    <div className="row g-2">
                      <div className="col-md-6 mb-2">
                        <label className="text-muted small mb-1">Order Status</label>
                        <div className="bg-light p-2 rounded" style={{height: '36px', fontSize: '14px'}}>{transaction.Order?.order_status || transaction.orderStatus || 'N/A'}</div>
                      </div>
                      <div className="col-md-6 mb-2">
                        <label className="text-muted small mb-1">Order Total</label>
                        <div className="bg-light p-2 rounded" style={{height: '36px', fontSize: '14px'}}>{transaction.Order?.total_price ? formatCurrency(transaction.Order.total_price) : transaction.orderTotal ? formatCurrency(transaction.orderTotal) : 'N/A'}</div>
                      </div>
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

export default TransactionViewForm;