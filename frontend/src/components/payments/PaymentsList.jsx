import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faUndo } from '@fortawesome/free-solid-svg-icons';
import Pagination from '../Pagination';

const PaymentsList = ({ onViewRefund }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState('all');
  
  const itemsPerPage = 10;
  
  useEffect(() => {
    fetchPayments();
  }, [currentPage, statusFilter]);
  
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      let url = `http://localhost:5000/api/admin/payments?page=${currentPage}&limit=${itemsPerPage}`;
      
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      
      if (dateRange.start) {
        url += `&start_date=${dateRange.start}`;
      }
      
      if (dateRange.end) {
        url += `&end_date=${dateRange.end}`;
      }
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
        // Assuming total is returned from the API
        // setPagination({ ...pagination, total: data.total });
      } else {
        setError('Failed to fetch payments. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('An error occurred while fetching payment data.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    fetchPayments();
  };
  
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };
  
  const handleReset = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setStatusFilter('all');
    setCurrentPage(1);
  };
  
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'failed':
        return 'bg-danger';
      case 'refunded':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  // Filter payments by search term (client side filtering)
  const filteredPayments = payments.filter(payment => 
    payment.order_id.toString().includes(searchTerm) ||
    payment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.payment_id.toString().includes(searchTerm)
  );
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = searchTerm ? filteredPayments : payments;
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  
  // Mock data for testing (remove in production)
  useEffect(() => {
    // This is just for demo purposes - replace with actual API call result
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
      }
    ];
    
    setPayments(mockPayments);
    setLoading(false);
  }, []);

  return (
    <div className="payments-list">
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="row g-3 align-items-center">
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search order ID, customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <input
                  type="date"
                  className="form-control"
                  placeholder="From"
                  name="start"
                  value={dateRange.start}
                  onChange={handleDateRangeChange}
                />
              </div>
              <div className="col-md-2">
                <input
                  type="date"
                  className="form-control"
                  placeholder="To"
                  name="end"
                  value={dateRange.end}
                  onChange={handleDateRangeChange}
                />
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div className="col-md-3">
                <button type="submit" className="btn btn-primary me-2">
                  Search
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleReset}>
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading payment data...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : currentPayments.length === 0 ? (
        <div className="alert alert-info">No payments found</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
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
              {currentPayments.map(payment => (
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
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-primary me-1" 
                      onClick={() => onViewRefund(payment)}
                    >
                      <FontAwesomeIcon icon={faEye} /> Details
                    </button>
                    {payment.status !== 'Refunded' && payment.status !== 'Failed' && (
                      <button 
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => onViewRefund(payment)}
                      >
                        <FontAwesomeIcon icon={faUndo} /> Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default PaymentsList;
