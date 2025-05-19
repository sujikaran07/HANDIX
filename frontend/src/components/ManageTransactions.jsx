import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCloudDownloadAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FaExchangeAlt } from 'react-icons/fa';
import Pagination from './Pagination';
import '../styles/admin/AdminTransaction.css';

const paymentMethodsList = ['cod', 'card', 'paypal', 'gpay'];
const paymentMethodsDisplay = {
  'cod': 'Cash on Delivery',
  'card': 'Credit Card',
  'paypal': 'PayPal',
  'gpay': 'GPay'
};

const ManageTransactions = ({ onViewTransaction }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([...paymentMethodsList]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 7;
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        console.log('Fetching transactions from API...');
        
        // Try to use the admin token first, then fall back to the regular token
        const adminToken = localStorage.getItem('adminToken');
        const userToken = localStorage.getItem('token');
        
        const token = adminToken || userToken;
        
        if (!token) {
          console.error('No token found in localStorage');
          setError('Authentication required. Please login again.');
          setLoading(false);
          return;
        }
        
        console.log('Using token type:', adminToken ? 'Admin Token' : 'User Token');
        
        try {
          // API call to fetch transactions
          const response = await fetch('http://localhost:5000/api/admin/transactions', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          console.log('API response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Fetched transaction data:', data);
            
            if (data.success && Array.isArray(data.transactions)) {
              console.log(`Received ${data.transactions.length} transactions`);
              // Set transactions with the retrieved data
              setTransactions(data.transactions);
              if (data.transactions.length === 0) {
                console.log('No transactions found in the response');
                setError('No transactions found. Try creating some transactions first.');
              }
            } else {
              console.error('Invalid transaction data format:', data);
              setError('Received invalid data format from server');
            }
          } else {
            const errorData = await response.text();
            console.error(`Error response (${response.status}):`, errorData);
            
            if (response.status === 401) {
              console.warn('Token expired or unauthorized. Please log in again.');
              setError('Session expired. Please login again.');
            } else {
              setError(`Failed to fetch transactions: ${response.statusText}`);
            }
          }
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          setError(`Network error: ${fetchError.message}`);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchTransactions function:', error);
        setError('An error occurred while fetching transaction data.');
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [refreshKey]);

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

  const filteredTransactions = transactions.filter(item => {
    // Handle both direct fields and nested fields safely
    const paymentMethod = item.paymentMethod || '';
    const status = item.transactionStatus || '';
    const transactionId = item.transaction_id?.toString() || '';
    const customerId = item.c_id?.toString() || '';
    const orderId = item.order_id?.toString() || '';

    // Map database status values to display status values
    const statusMap = {
      'pending': 'Pending',
      'completed': 'Completed',
      'refunded': 'Refunded',
      'failed': 'Failed',
      'awaiting_payment': 'Awaiting Payment'
    };

    const displayStatus = statusMap[status.toLowerCase()] || status;

    return (
      (selectedPaymentMethods.includes(paymentMethod)) &&
      (filterStatus === 'All' || displayStatus === filterStatus) &&
      (transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
       customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
       orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
       paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Format currency amount
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    
    try {
      return typeof amount === 'number' ? 
        amount.toLocaleString('en-US', { style: 'currency', currency: 'LKR' }).replace('LKR', '') + ' LKR' 
        : amount;
    } catch (e) {
      return amount.toString();
    }
  };

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleString('en-US', { 
        year: '2-digit', 
        month: 'numeric', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Update the component to map status values to display format
  const getDisplayStatus = (dbStatus) => {
    if (!dbStatus) return 'N/A';
    
    const statusMap = {
      'pending': 'Pending',
      'completed': 'Completed',
      'refunded': 'Refunded',
      'failed': 'Failed',
      'awaiting_payment': 'Awaiting Payment'
    };
    
    return statusMap[dbStatus.toLowerCase()] || dbStatus;
  };
  
  // Update the getStatusClassName function to map status values to CSS classes
  const getStatusClassName = (status) => {
    if (!status) return '';
    
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'pending') {
      return 'transaction-status-pending';
    } else if (statusLower === 'awaiting_payment') {
      return 'transaction-status-awaiting';
    } else if (statusLower === 'completed') {
      return 'transaction-status-completed';
    } else if (statusLower === 'refunded') {
      return 'transaction-status-refunded';
    } else if (statusLower === 'failed') {
      return 'transaction-status-failed';
    }
    
    return `transaction-status-${statusLower}`;
  };

  // Format payment method for display
  const formatPaymentMethod = (method) => {
    if (!method) return 'N/A';
    return paymentMethodsDisplay[method.toLowerCase()] || method;
  };

  const handleRefund = async (transaction) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) {
        console.error('No token found in localStorage');
        setError('Authentication required. Please login again.');
        return;
      }

      // Determine refund reason based on transaction state
      let refundReason = transaction.refundReason || "standard_refund";
      let refundMessage = '';
      
      // Set appropriate message based on the refund reason
      switch(refundReason) {
        case 'canceled_before_confirmation':
          refundMessage = 'This is a full refund for an order canceled before confirmation.';
          break;
        case 'admin_cancellation':
          refundMessage = 'This is a full refund initiated by an admin.';
          break;
        case 'artisan_cancellation':
          refundMessage = 'This is a full refund for an order canceled by an artisan.';
          break;
        default:
          refundMessage = 'Standard refund';
      }

      const confirmRefund = window.confirm(
        `Are you sure you want to refund transaction ${transaction.transaction_id} for ${formatAmount(transaction.amount)}?\n\n` +
        `Reason: ${refundMessage}\n\n` +
        `Note: No refunds are allowed for orders canceled after confirmation unless initiated by admin or artisan.`
      );
      
      if (!confirmRefund) {
        return;
      }

      console.log(`Processing refund for transaction ${transaction.transaction_id} with reason: ${refundReason}`);
      
      const response = await fetch(`http://localhost:5000/api/admin/transactions/${transaction.transaction_id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          reason: refundReason,
          canceledBy: transaction.canceledBy || 'admin'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Transaction refund response:`, data);
        
        if (data.success) {
          // Update the transaction status in the list
          const updatedTransactions = transactions.map(item => {
            if (item.transaction_id === transaction.transaction_id) {
              return { 
                ...item, 
                transactionStatus: 'Refunded'
              };
            }
            return item;
          });
          
          setTransactions(updatedTransactions);
          alert('Transaction refunded successfully.');
          setRefreshKey(prev => prev + 1);
        } else {
          console.error(`Failed to refund transaction:`, data.message);
          alert(`Failed to refund transaction: ${data.message || 'Unknown error'}`);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Failed to refund transaction:`, response.statusText, errorData);
        alert(`Failed to refund transaction. Server returned: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error(`Error refunding transaction:`, error);
      alert('An error occurred while refunding the transaction. Please try again.');
    }
  };

  // Added error display component
  const ErrorDisplay = ({ message }) => {
    return (
      <div className="alert alert-warning" role="alert">
        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
        {message}
        <div className="mt-3">
          <button 
            className="btn btn-sm btn-outline-primary me-2" 
            onClick={() => setRefreshKey(key => key + 1)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card p-4" style={{ 
        borderRadius: '10px', 
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
        backgroundColor: '#ffffff', 
        flex: '1 1 auto', 
        display: 'flex', 
        flexDirection: 'column',
        border: 'none' 
      }}>
        <div className="manage-products-header d-flex justify-content-between align-items-center mb-3">
          <div className="title-section">
            <div className="icon-and-title">
              <FaExchangeAlt className="product-icon" size={24} style={{ color: '#3e87c3', marginRight: '10px' }} />
              <div className="text-section">
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>Transactions</h2>
                <p style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0' }}>Manage your transactions</p>
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
            <button className="export-btn btn btn-light" style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
              <FontAwesomeIcon icon={faCloudDownloadAlt} /> Export
            </button>
          </div>
        </div>

        {!loading && !error && transactions.length > 0 && (
          <div className="filter-section mb-3 d-flex justify-content-between align-items-center">
            <div className="d-flex">
              {paymentMethodsList.map((method) => (
                <div className="form-check form-check-inline" key={method}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`${method.replace(/\s+/g, '').toLowerCase()}Checkbox`}
                    value={method}
                    checked={selectedPaymentMethods.includes(method)}
                    onChange={() => handlePaymentMethodChange(method)}
                  />
                  <label 
                    className="form-check-label" 
                    htmlFor={`${method.replace(/\s+/g, '').toLowerCase()}Checkbox`}
                  >
                    {paymentMethodsDisplay[method] || method}
                  </label>
                </div>
              ))}
            </div>
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
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Awaiting Payment">Awaiting Payment</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div style={{ 
          flex: '1 1 auto', 
          overflowY: 'auto', 
          marginTop: '20px'
        }}>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading transaction data...</p>
            </div>
          ) : error ? (
            <ErrorDisplay message={error} />
          ) : transactions.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <FontAwesomeIcon icon={faExclamationTriangle} size="3x" style={{ color: '#ffc107' }} />
              </div>
              <h5>No Transactions Found</h5>
              <p className="text-muted">There are no transactions in the system yet.</p>
              <button 
                className="btn btn-primary mt-2" 
                onClick={() => setRefreshKey(key => key + 1)}
              >
                Refresh
              </button>
            </div>
          ) : (
            <table className="table product-table" style={{ 
              marginBottom: 0,
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: '0 10px',
              marginTop: '-15px'
            }}>
              <thead>
                <tr>
                  <th style={{ width: '8%', backgroundColor: '#f8f9fa', borderRadius: '10px 10px 0 0', boxShadow: 'none' }}>T-ID</th>
                  <th style={{ width: '8%', backgroundColor: '#f8f9fa', borderRadius: '10px 10px 0 0', boxShadow: 'none' }}>O-ID</th>
                  <th style={{ width: '8%', backgroundColor: '#f8f9fa', borderRadius: '10px 10px 0 0', boxShadow: 'none' }}>C-ID</th>
                  <th style={{ width: '12%', backgroundColor: '#f8f9fa', borderRadius: '10px 10px 0 0', boxShadow: 'none' }}>Amount</th>
                  <th style={{ width: '12%', backgroundColor: '#f8f9fa', borderRadius: '10px 10px 0 0', boxShadow: 'none' }}>Payment</th>
                  <th style={{ width: '15%', backgroundColor: '#f8f9fa', borderRadius: '10px 10px 0 0', boxShadow: 'none' }}>Status</th>
                  <th style={{ width: '22%', backgroundColor: '#f8f9fa', borderRadius: '10px 10px 0 0', boxShadow: 'none' }}>Transaction Date</th>
                  <th style={{ width: '15%', backgroundColor: '#f8f9fa', borderRadius: '10px 10px 0 0', boxShadow: 'none' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.length > 0 ? (
                  currentTransactions.map(item => {
                    // Get the appropriate transaction status class name
                    const statusClassName = getStatusClassName(item.transactionStatus);
                    
                    return (
                      <tr key={item.transaction_id} style={{ 
                        marginBottom: '0px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        borderRadius: '10px'
                      }}>
                        <td style={{ padding: '5px 10px', border: 'none', textAlign: 'left', backgroundColor: '#ffffff' }}>{item.transaction_id || 'N/A'}</td>
                        <td style={{ padding: '5px 10px', border: 'none', textAlign: 'left', backgroundColor: '#ffffff' }}>{item.order_id || 'N/A'}</td>
                        <td style={{ padding: '5px 10px', border: 'none', textAlign: 'left', backgroundColor: '#ffffff' }}>{item.c_id || 'N/A'}</td>
                        <td style={{ padding: '5px 10px', border: 'none', textAlign: 'left', backgroundColor: '#ffffff' }}>{formatAmount(item.amount)}</td>
                        <td style={{ padding: '5px 10px', border: 'none', textAlign: 'left', backgroundColor: '#ffffff' }}>{formatPaymentMethod(item.paymentMethod)}</td>
                        <td className={statusClassName} style={{ padding: '5px 10px', border: 'none', textAlign: 'left', backgroundColor: '#ffffff' }}>
                          {getDisplayStatus(item.transactionStatus)}
                        </td>
                        <td style={{ padding: '5px 10px', border: 'none', textAlign: 'left', backgroundColor: '#ffffff' }}>{formatDate(item.transactionDate)}</td>
                        <td style={{ padding: '5px 10px', border: 'none', textAlign: 'left', backgroundColor: '#ffffff' }}>
                          <div className="dropdown">
                            <button 
                              className="btn dropdown-toggle product-action-btn" 
                              type="button" 
                              id={`dropdownMenu-${item.transaction_id}`} 
                              data-bs-toggle="dropdown" 
                              aria-expanded="false"
                            >
                              Actions
                            </button>
                            <ul className="dropdown-menu" aria-labelledby={`dropdownMenu-${item.transaction_id}`}>
                              <li>
                                <button className="dropdown-item" onClick={() => onViewTransaction(item)}>
                                  View
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">No transactions available</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {!loading && !error && transactions.length > 0 && (
          <Pagination 
            className="product-pagination" 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={handlePageChange}
            style={{ marginTop: '20px' }}
          />
        )}
      </div>
    </div>
  );
};

export default ManageTransactions; 