import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const OrderDetails = ({ order, onBack }) => {
  return (
    <div className="container mt-4">
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff' }}>
        <h2>Order Details</h2>
        <div className="mb-3">
          <strong>Order ID:</strong> {order.id}
        </div>
        <div className="mb-3">
          <strong>Order Date:</strong> {order.orderDate}
        </div>
        <div className="mb-3">
          <strong>Customer Name:</strong> {order.customerName}
        </div>
        <div className="mb-3">
          <strong>Order Type:</strong> {order.orderType}
        </div>
        <div className="mb-3">
          <strong>Status:</strong> {order.status}
        </div>
        <button className="btn btn-primary" onClick={onBack}>Back to Orders</button>
      </div>
    </div>
  );
};

export default OrderDetails;
