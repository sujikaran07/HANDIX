import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faSearch, faFilter, faEye, faUndo, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Pagination from '../../components/Pagination';
import '../../styles/admin/AdminPayments.css';

const AdminPaymentsPage = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'refund'
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [refundData, setRefundData] = useState({
    amount: '',
    reason: '',
    type: 'full'
  });

  const itemsPerPage = 7;
  
  useEffect(() => {
    fetchPayments();
  }, [currentPage, statusFilter]);
  
  const fetchPayments = async () => {
    try {
      setLoading(true);
      // For demo purposes, simulate API fetch with mock data
      setTimeout(() => {
        const mockPayments = [
          {
            id: 1,
            payment_id: 'PAY78236428',
            order_id: 'ORD10023',
            customer_name: 'John Smith',
            amount: 2500.00,
            payment_date: '2023-07-15T10:30:00',
            payment_method: 'Credit Card',
            status: 'Completed'
          },
          {
            id: 2,
            payment_id: 'PAY89223671',
            order_id: 'ORD10024',
            customer_name: 'Mary Johnson',
            amount: 3750.00,
            payment_date: '2023-07-16T14:45:00',
            payment_method: 'PayPal',
            status: 'Completed'
          },
          {
            id: 3,
            payment_id: 'PAY12398745',
            order_id: 'ORD10025',
            customer_name: 'Robert Brown',
            amount: 1800.00,
            payment_date: '2023-07-16T16:20:00',
            payment_method: 'Credit Card',
            status: 'Refunded'
          },
          {
            id: 4,
            payment_id: 'PAY56782934',
            order_id: 'ORD10026',
            customer_name: 'Jennifer Davis',
            amount: 4200.00,
            payment_date: '2023-07-17T09:15:00',
            payment_method: 'Bank Transfer',
            status: 'Pending'
          },
          {
            id: 5,
            payment_id: 'PAY34567812',
            order_id: 'ORD10027',
            customer_name: 'Michael Wilson',
            amount: 3200.00,
            payment_date: '2023-07-17T11:50:00',
            payment_method: 'Credit Card',
            status: 'Failed'
          },
          {
            id: 6,
            payment_id: 'PAY98761234',
            order_id: 'ORD10028',
            customer_name: 'Sarah Adams',
            amount: 1950.00,
            payment_date: '2023-07-18T08:25:00',
            payment_method: 'Credit Card',
            status: 'Completed'
          },
          {
            id: 7,
            payment_id: 'PAY45678912',
            order_id: 'ORD10029',
            customer_name: 'David Wilson',
            amount: 3600.00,
            payment_date: '2023-07-18T13:40:00',
            payment_method: 'Online Banking',
            status: 'Completed'
          }
        ];
        
        setPayments(mockPayments);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setLoading(false);
    }
  };
  
  const handleViewRefund = (payment) => {
    setSelectedPayment(payment);
    setRefundData({
      amount: payment.amount.toFixed(2),
      reason: '',
      type: 'full'
    });
    setCurrentView('refund');
  };
  
  const handleBackToPayments = () => {
    setSelectedPayment(null);
    setCurrentView('list');
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPayments();
  };
  
  const handleRefundTypeChange = (e) => {
    const type = e.target.value;
    setRefundData(prev => ({
      ...prev,
      type,
      amount: type === 'full' && selectedPayment ? selectedPayment.amount.toFixed(2) : prev.amount
    }));
  };
  
  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    
    if (!refundData.reason) {
      alert('Please provide a reason for the refund');
      return;
    }
    
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        alert(`Refund of Rs ${refundData.amount} processed successfully for order ${selectedPayment.order_id}`);
        setLoading(false);
        handleBackToPayments();
      }, 1500);
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('An error occurred while processing the refund');
      setLoading(false);
    }
  };
  
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'failed': return 'bg-danger';
      case 'refunded': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  // Render dropdown actions for payments
  const renderActionMenu = (payment) => {
    return (
      <div className="dropdown">
        <button 
          className="btn btn-sm btn-outline-secondary dropdown-toggle" 
          type="button" 
          id={`dropdownMenu-${payment.id}`} 
          data-bs-toggle="dropdown" 
          aria-expanded="false"
        >
          Actions
        </button>
        <ul className="dropdown-menu shadow" aria-labelledby={`dropdownMenu-${payment.id}`}>
          <li>
            <button className="dropdown-item" onClick={() => handleViewRefund(payment)}>
              <FontAwesomeIcon icon={faEye} className="me-2" /> View Details
            </button>
          </li>
          {payment.status !== 'Refunded' && payment.status !== 'Failed' && (
            <li>
              <button className="dropdown-item" onClick={() => handleViewRefund(payment)}>
                <FontAwesomeIcon icon={faUndo} className="me-2" /> Process Refund
              </button>
            </li>
          )}
        </ul>
      </div>
    );
  };
  
  // Filter and paginate payments
  const filteredPayments = payments.filter(payment => 
    (statusFilter === 'all' || payment.status.toLowerCase() === statusFilter.toLowerCase()) &&
    (searchTerm === '' || 
     payment.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     payment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     payment.payment_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const currentPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="admin-inventory-page payments-page">
      <AdminSidebar />
      <div className="main-content">
        <AdminTopbar />
        <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
          <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', height: '100%' }}>
            {currentView === 'list' ? (
              <>
                <div className="manage-inventory-header d-flex justify-content-between align-items-center mb-3">
                  <div className="title-section">
                    <div className="icon-and-title">
                      <FontAwesomeIcon icon={faCreditCard} className="inventory-icon" />
                      <div className="text-section">
                        <h2>Payment Management</h2>
                        <p>Review payments and process refunds</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-4">
                    <div className="search-bar">
                      <div className="input-group">
                        <span className="input-group-text bg-light border-0">
                          <FontAwesomeIcon icon={faSearch} />
                        </span>
                        <input
                          type="text"
                          className="form-control border-0"
                          placeholder="Search order ID, customer..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ boxShadow: 'none' }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="filter-dropdown">
                      <div className="input-group">
                        <span className="input-group-text bg-light border-0">
                          <FontAwesomeIcon icon={faFilter} />
                        </span>
                        <select
                          className="form-select border-0"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          style={{ boxShadow: 'none' }}
                        >
                          <option value="all">All Statuses</option>
                          <option value="completed">Completed</option>
                          <option value="pending">Pending</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-5 d-flex">
                    <div className="input-group me-2">
                      <span className="input-group-text bg-light">From</span>
                      <input
                        type="date"
                        className="form-control"
                        placeholder="From"
                        name="start"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                      />
                    </div>
                    <div className="input-group">
                      <span className="input-group-text bg-light">To</span>
                      <input
                        type="date"
                        className="form-control"
                        placeholder="To"
                        name="end"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading payment data...</p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive" style={{ height: 'calc(100% - 100px)' }}>
                      <table className="table table-bordered table-striped inventory-table">
                        <thead>
                          <tr>
                            <th>Payment ID</th>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentPayments.length > 0 ? (
                            currentPayments.map(payment => (
                              <tr key={payment.id}>
                                <td>{payment.payment_id}</td>
                                <td>{payment.order_id}</td>
                                <td>{payment.customer_name}</td>
                                <td>Rs {payment.amount.toFixed(2)}</td>
                                <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                                <td>{payment.payment_method}</td>
                                <td>
                                  <span className={`badge ${getStatusClass(payment.status)}`}>
                                    {payment.status}
                                  </span>
                                </td>
                                <td className="text-center">
                                  {renderActionMenu(payment)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="8" className="text-center">No payments found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-3">
                      <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        className="inventory-pagination"
                      />
                    </div>
                  </>
                )}
              </>
            ) : (
              // Refund View
              <div>
                <div className="d-flex align-items-center mb-3">
                  <button className="btn btn-link text-decoration-none" onClick={handleBackToPayments}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to Payments
                  </button>
                  <h4 className="mb-0 ms-3">Payment Details & Refund</h4>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="card mb-4">
                      <div className="card-header">
                        <h5>Payment Information</h5>
                      </div>
                      <div className="card-body">
                        <table className="table table-borderless">
                          <tbody>
                            <tr>
                              <td><strong>Payment ID:</strong></td>
                              <td>{selectedPayment?.payment_id}</td>
                            </tr>
                            <tr>
                              <td><strong>Order ID:</strong></td>
                              <td>{selectedPayment?.order_id}</td>
                            </tr>
                            <tr>
                              <td><strong>Customer:</strong></td>
                              <td>{selectedPayment?.customer_name}</td>
                            </tr>
                            <tr>
                              <td><strong>Amount:</strong></td>
                              <td>Rs {selectedPayment?.amount.toFixed(2)}</td>
                            </tr>
                            <tr>
                              <td><strong>Date:</strong></td>
                              <td>{selectedPayment ? new Date(selectedPayment.payment_date).toLocaleString() : ''}</td>
                            </tr>
                            <tr>
                              <td><strong>Method:</strong></td>
                              <td>{selectedPayment?.payment_method}</td>
                            </tr>
                            <tr>
                              <td><strong>Status:</strong></td>
                              <td>
                                {selectedPayment && (
                                  <span className={`badge ${getStatusClass(selectedPayment.status)}`}>
                                    {selectedPayment.status}
                                  </span>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header">
                        <h5>Process Refund</h5>
                      </div>
                      <div className="card-body">
                        {selectedPayment?.status === 'Refunded' ? (
                          <div className="alert alert-info">
                            This payment has already been refunded.
                          </div>
                        ) : (
                          <form onSubmit={handleRefundSubmit}>
                            <div className="mb-3">
                              <label className="form-label">Refund Type</label>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="refundType"
                                  id="fullRefund"
                                  value="full"
                                  checked={refundData.type === 'full'}
                                  onChange={handleRefundTypeChange}
                                />
                                <label className="form-check-label" htmlFor="fullRefund">
                                  Full Refund (Rs {selectedPayment?.amount.toFixed(2)})
                                </label>
                              </div>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="refundType"
                                  id="partialRefund"
                                  value="partial"
                                  checked={refundData.type === 'partial'}
                                  onChange={handleRefundTypeChange}
                                />
                                <label className="form-check-label" htmlFor="partialRefund">
                                  Partial Refund
                                </label>
                              </div>
                            </div>
                            
                            {refundData.type === 'partial' && (
                              <div className="mb-3">
                                <label htmlFor="refundAmount" className="form-label">Amount (Rs)</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  id="refundAmount"
                                  value={refundData.amount}
                                  onChange={(e) => setRefundData({...refundData, amount: e.target.value})}
                                  min="0.01"
                                  max={selectedPayment?.amount}
                                  step="0.01"
                                  required
                                />
                              </div>
                            )}
                            
                            <div className="mb-3">
                              <label htmlFor="refundReason" className="form-label">Reason</label>
                              <select
                                className="form-select"
                                id="refundReason"
                                value={refundData.reason}
                                onChange={(e) => setRefundData({...refundData, reason: e.target.value})}
                                required
                              >
                                <option value="">Select reason</option>
                                <option value="customer_request">Customer requested cancellation</option>
                                <option value="order_issue">Problem with the order</option>
                                <option value="product_unavailable">Product unavailable</option>
                                <option value="duplicate_order">Duplicate order</option>
                                <option value="admin_cancellation">Cancelled by admin</option>
                                <option value="artisan_cancellation">Cancelled by artisan</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            
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
                              ) : 'Process Refund'}
                            </button>
                          </form>
                        )}
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

export default AdminPaymentsPage;
