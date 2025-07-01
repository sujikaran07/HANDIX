import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '.././styles/admin/AdminCustomer.css';

// View customer details with formatted fields
const CustomerViewForm = ({ c_id, onBack }) => {
  // State for customer data and loading
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch customer details by ID
    const fetchCustomerDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/customers/${c_id}`);
        setCustomer(response.data);
      } catch (error) {
        console.error('Error fetching customer details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [c_id]);

  // Helper: show 'N/A' if value is empty
  const getFieldValue = (value) => (value ? value : 'N/A');
  
  // Helper: format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'LKR 0.00';
    return `LKR ${parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  
  // Helper: format date
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!customer) {
    return <p>Customer not found.</p>;
  }

  // Render customer details
  return (
    <div>
      <h4 className="mb-4">Customer Details</h4>
      <div className="row mb-3 form-group">
        <div className="col-md-4">
          <label className="form-label font-weight-bold">C-ID</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(customer.c_id)}</p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Name</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(`${customer.firstName} ${customer.lastName}`)}</p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Email</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(customer.email)}</p>
        </div>
      </div>
      <div className="row mb-3 form-group">
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Phone</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(customer.phone)}</p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Country</label>
          <p className="form-control-plaintext bg-light p-2">
            {getFieldValue(customer.addresses && customer.addresses.length > 0 
              ? customer.addresses[0].country 
              : customer.country || 'Sri Lanka')}
          </p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Account Type</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(customer.accountType)}</p>
        </div>
      </div>
      <div className="row mb-3 form-group">
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Registration Date</label>
          <p className="form-control-plaintext bg-light p-2">{formatDate(customer.registration_date || customer.registrationDate)}</p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Total Orders</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(customer.total_orders || customer.totalOrders)}</p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Account Status</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(customer.accountStatus)}</p>
        </div>
      </div>
      <div className="row mb-3 form-group">
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Total Spent</label>
          <p className="form-control-plaintext bg-light p-2">
            {formatCurrency(customer.total_spent || customer.totalSpent || 0)}
          </p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Last Order Date</label>
          <p className="form-control-plaintext bg-light p-2">
            {formatDate(customer.last_order_date || customer.lastOrderDate || 'N/A')}
          </p>
        </div>
      </div>
      <div className="d-flex justify-content-end">
        <button type="button" className="btn btn-secondary" onClick={onBack}>Back</button>
      </div>
    </div>
  );
};

export default CustomerViewForm;
