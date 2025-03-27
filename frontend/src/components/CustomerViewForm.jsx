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
            {getFieldValue(customer.addresses?.[0]?.country)} {/* Fetch country from the first address */}
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
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(customer.registrationDate)}</p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Total Orders</label> {/* Renamed Orders to Total Orders */}
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(customer.totalOrders)}</p> {/* Updated field name */}
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
        {/* Removed Orders Count field */}
      </div>
      <div className="d-flex justify-content-end">
        <button type="button" className="btn btn-secondary" onClick={onBack}>Back</button>
      </div>
    </div>
  );
};

export default CustomerViewForm;
