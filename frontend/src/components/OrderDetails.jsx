import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Component for displaying detailed order information
const OrderDetails = ({ order, onBack }) => {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Convert status text for user-friendly display
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.toLowerCase() === 'awaiting payment' ? 'To Pay' : status;
  };

  // Get badge color based on order status
  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-secondary';
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'awaiting payment' || statusLower === 'to pay') return 'bg-danger';
    if (statusLower.includes('pending')) return 'bg-warning';
    if (statusLower.includes('processing')) return 'bg-info';
    if (statusLower.includes('shipped')) return 'bg-primary';
    if (statusLower.includes('delivered')) return 'bg-success';
    if (statusLower.includes('cancel')) return 'bg-danger';
    
    return 'bg-secondary';
  };

  return (
    <div className="container mt-4">
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff' }}>
        <h2 className="mb-4">Order Details</h2>
        
        <div className="row">
          {/* Order information section */}
          <div className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header bg-light">
                <h5 className="mb-0">Order Information</h5>
              </div>
              <div className="card-body">
                <div className="mb-2">
                  <strong>Order ID:</strong> {order.id || order.order_id}
                </div>
                <div className="mb-2">
                  <strong>Order Date:</strong> {formatDate(order.orderDate)}
                </div>
                <div className="mb-2">
                  <strong>Customer Name:</strong> {order.customerName}
                </div>
                <div className="mb-2">
                  <strong>Order Type:</strong> {order.customized === 'yes' ? 'Customized' : 'Standard'}
                </div>
                <div className="mb-2">
                  <strong>Status:</strong> <span className={`badge ${getStatusBadgeClass(order.orderStatus || order.status)}`}>
                    {formatStatus(order.orderStatus || order.status)}
                  </span>
                </div>
                <div className="mb-2">
                  <strong>Payment Method:</strong> {order.paymentMethod || 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>Payment Status:</strong> {order.paymentStatus || 'N/A'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Order items section */}
          {order.orderDetails && order.orderDetails.length > 0 && (
            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-header bg-light">
                  <h5 className="mb-0">Order Items</h5>
                </div>
                <div className="card-body p-0">
                  <ul className="list-group list-group-flush">
                    {order.orderDetails.map((item, index) => (
                      <li key={index} className="list-group-item">
                        <div className="d-flex justify-content-between">
                          <div>
                            <div><strong>Product ID:</strong> {item.product_id}</div>
                            <div>Quantity: {item.quantity}</div>
                            {/* Display customization details if available */}
                            {(item.customization || item.customization_text) && (
                              <div className="mt-2">
                                <strong>Customization:</strong> <span className="text-muted">
                                  {item.customization || item.customization_text}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-end">
                            <div>Price: LKR {parseFloat(item.priceAtPurchase || item.price_at_purchase).toLocaleString()}</div>
                            
                            {/* Display customization fee if applicable */}
                            {(() => {
                              const fee = item.customization_fee || item.customizationFee || 0;
                              return parseFloat(fee) > 0 ? (
                                <div className="text-primary">
                                  +LKR {parseFloat(fee).toLocaleString()} (Customization Fee)
                                </div>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Total amount and delivery information */}
        <div className="row mt-3">
          <div className="col-md-6 ms-auto">
            <div className="card">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Amount:</span>
                  <strong>LKR {order.totalAmount?.toLocaleString() || 'N/A'}</strong>
                </div>
                {order.deliveryDate && (
                  <div className="small text-muted">
                    Expected Delivery: {formatDate(order.deliveryDate)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Back button */}
        <div className="mt-4">
          <button className="btn btn-primary" onClick={onBack}>Back to Orders</button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
