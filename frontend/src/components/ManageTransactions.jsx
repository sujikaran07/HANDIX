import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons';
import { FaExchangeAlt } from 'react-icons/fa';
import Pagination from './Pagination';
import '../styles/admin/AdminTransaction.css';

const paymentMethodsList = ['Cash on Delivery', 'Credit Card', 'PayPal', 'GPay'];

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
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        
        if (!token) {
          console.error('No token found in localStorage');
          setError('Authentication required. Please login again.');
          setLoading(false);
          return;
        }
        
        // API call to fetch transactions
        const response = await fetch('http://localhost:5000/api/admin/transactions', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched transaction data:', data);
          setTransactions(data.transactions);
          setLoading(false);
        } else if (response.status === 401) {
          console.warn('Token expired. Attempting to refresh token...');
          const refreshResponse = await fetch('http://localhost:5000/api/login/refresh-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            console.log('Token refreshed:', refreshData.token);
            localStorage.setItem('token', refreshData.token);
            fetchTransactions();
          } else {
            setError('Session expired. Please login again.');
            setLoading(false);
          }
        } else {
          setError(`Failed to fetch transactions: ${response.statusText}`);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError('An error occurred while fetching transaction data.');
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [refreshKey]);

  const handleRefund = async (transaction) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) {
        console.error('No token found in localStorage');
        setError('Authentication required. Please login again.');
        return;
      }

      const confirmRefund = window.confirm(`Are you sure you want to refund transaction ${transaction.transaction_id} for ${transaction.amount} LKR?`);
      
      if (!confirmRefund) {
        return;
      }

      console.log(`Processing refund for transaction ${transaction.transaction_id}`);
      
      const response = await fetch(`http://localhost:5000/api/admin/transactions/${transaction.transaction_id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
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

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

  const filteredTransactions = transactions.filter(item => {
    return (
      (selectedPaymentMethods.includes(item.paymentMethod)) &&
      (filterStatus === 'All' || item.transactionStatus === filterStatus) &&
      (item.transaction_id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.c_id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.order_id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderActionMenu = (item) => {
    return (
      <div className="dropdown">
        <button className="btn dropdown-toggle" type="button" id={`dropdownMenu-${item.transaction_id}`} data-bs-toggle="dropdown" aria-expanded="false">
          Actions
        </button>
        <ul className="dropdown-menu" aria-labelledby={`dropdownMenu-${item.transaction_id}`}>
          <li>
            <button className="dropdown-item" onClick={() => onViewTransaction(item)}>
              View
            </button>
          </li>
          {/* Only show refund option if transaction is completed */}
          {item.transactionStatus === 'Completed' && (
            <li>
              <button className="dropdown-item" onClick={() => handleRefund(item)}>
                Refund
              </button>
            </li>
          )}
        </ul>
      </div>
    );
  };

  return (
    <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        <div className="manage-inventory-header d-flex justify-content-between align-items-center mb-3">
          <div className="title-section">
            <div className="icon-and-title">
              <FaExchangeAlt className="inventory-icon" />
              <div className="text-section">
                <h2>Transactions</h2>
                <p>Manage your transactions</p>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <button className="export-btn btn btn-light me-2" style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
              <FontAwesomeIcon icon={faCloudDownloadAlt} /> Export
            </button>
          </div>
        </div>

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
                <label className="form-check-label" htmlFor={`${method.replace(/\s+/g, '').toLowerCase()}Checkbox`}>
                  {method === 'Cash on Delivery' ? 'COD' : method === 'Credit Card' ? 'Card' : method}
                </label>
              </div>
            ))}
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
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: '1 1 auto', overflowY: 'auto', marginTop: '20px' }}>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading transaction data...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : (
            <table className="table table-bordered table-striped inventory-table">
              <thead>
                <tr>
                  <th>C-ID</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Transaction Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.length > 0 ? (
                  currentTransactions.map(item => {
                    return (
                      <tr key={item.transaction_id}>
                        <td>{item.c_id}</td>
                        <td>{typeof item.amount === 'number' ? item.amount.toLocaleString('en-US', { style: 'currency', currency: 'LKR' }) : item.amount}</td>
                        <td>{item.paymentMethod}</td>
                        <td>{item.transactionDate && new Date(item.transactionDate).toLocaleString('en-US', { 
                          year: '2-digit', 
                          month: 'numeric', 
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}</td>
                        <td className={`stock-status ${item.transactionStatus?.toLowerCase().replace(/\s+/g, '-')}`}>
                          {item.transactionStatus}
                        </td>
                        <td className="action-buttons">
                          {renderActionMenu(item)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">No transactions available</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <Pagination className="inventory-pagination" currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default ManageTransactions; 