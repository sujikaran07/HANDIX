import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '.././styles/admin/AdminCustomer.css';

const CustomerViewForm = ({ customer, onBack }) => {
  const getFieldValue = (value) => (value ? value : 'N/A');

  return (
    <div>
      <h4 className="mb-4">Customer Details</h4>
      <div className="row mb-3 form-group">
        <div className="col-md-4">
          <label className="form-label font-weight-bold">User ID</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(customer.id)}</p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Name</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(customer.name)}</p>
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
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(customer.registrationDate)}</p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Orders</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(customer.orders)}</p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Verification Status</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(customer.verificationStatus)}</p>
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
