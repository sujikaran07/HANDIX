import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '.././styles/admin/AdminCustomer.css';

const CustomerViewForm = ({ c_id, onBack }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/customers/${c_id}`);
        console.log('Fetched customer details:', response.data); // Debug log
        setCustomer(response.data);
      } catch (error) {
        console.error('Error fetching customer details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [c_id]);

  const getFieldValue = (value) => (value ? value : 'N/A');

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!customer) {
    return <p>Customer not found.</p>;
  }

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
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(customer.country)}</p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Account Type</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(customer.accountType)}</p>
        </div>
      </div>
      <div className="row mb-3 form-group">
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Registration Date</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(customer.createdAt)}</p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Total Orders</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(customer.totalOrders)}</p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Account Status</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(customer.accountStatus)}</p>
        </div>
      </div>
      <div className="row mb-3 form-group">
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Total Spent</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(customer.totalSpent)}</p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Last Order Date</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(customer.lastOrderDate)}</p>
        </div>
      </div>
      <div className="d-flex justify-content-end">
        <button type="button" className="btn btn-secondary" onClick={onBack}>Back</button>
      </div>
    </div>
  );
};

export default CustomerViewForm;
