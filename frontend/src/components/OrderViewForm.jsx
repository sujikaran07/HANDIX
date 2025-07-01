import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrderViewForm = ({ order, onBack }) => {
  // State for managing address data and loading states
  const [addressData, setAddressData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shippingMethodName, setShippingMethodName] = useState('Standard Delivery');
  
  useEffect(() => {
    // Fetch customer address and shipping method data on component mount
    if (order.customer_id || order.customerId) {
      fetchCustomerAddresses(order.customer_id || order.customerId);
    }
    
    if (order.shippingMethodId) {
      fetchShippingMethod(order.shippingMethodId);
    }
  }, [order]);
  
  // Fetch customer address details from database
  const fetchCustomerAddresses = async (customerId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/addresses/customer/${customerId}`);
      
      // Use default address or first available address
      if (response.data && response.data.length > 0) {
        const defaultAddress = response.data.find(addr => addr.isDefault === true) || response.data[0];
        setAddressData({
          street: defaultAddress.street_address || defaultAddress.street || 'N/A',
          city: defaultAddress.city || 'N/A',
          district: defaultAddress.district || 'N/A'
        });
      }
    } catch (error) {
      console.error("Failed to fetch customer addresses:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch shipping method name based on ID
  const fetchShippingMethod = async (shippingMethodId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/shipping-methods/${shippingMethodId}`);
      
      if (response.data && response.data.method_name) {
        setShippingMethodName(response.data.method_name);
      } else {
        // Fallback mapping for shipping method IDs
        switch (shippingMethodId.toString()) {
          case '1':
            setShippingMethodName('Standard Delivery');
            break;
          case '2':
            setShippingMethodName('Express Delivery');
            break;
          case '3':
            setShippingMethodName('Store Pickup');
            break;
          default:
            setShippingMethodName(order.shippingMethod || 'Standard Delivery');
        }
      }
    } catch (error) {
      console.error("Failed to fetch shipping method:", error);
      // Use default shipping method if API fails
      setShippingMethodName(order.shippingMethod || 'Standard Delivery');
    }
  };
  
  const handleBack = () => {
    onBack();
  };
  
  if (!order) {
    return <div>No order data available</div>;
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status text color class based on order status
  const getStatusTextClass = (status) => {
    if (!status) return 'text-muted';
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('delivered')) return 'text-success';
    if (statusLower.includes('canceled') || statusLower.includes('cancelled')) return 'text-danger';
    if (statusLower.includes('processing')) return 'text-info';
    if (statusLower.includes('review')) return 'text-purple';
    if (statusLower.includes('shipped')) return 'text-primary';
    if (statusLower.includes('to pay') || statusLower.includes('pending')) return 'text-warning';
    return 'text-secondary';
  };

  // Format currency amounts for display
  const formatCurrency = (amount) => {
    if (!amount) return 'LKR 0.00';
    return `LKR ${parseFloat(amount).toFixed(2)}`;
  };

  // Extract order items and calculate totals
  const orderItems = order.items || [];
  const totalQuantity = orderItems.reduce((total, item) => total + (parseInt(item.quantity) || 0), 0);
  const subtotal = order.subtotal || orderItems.reduce((total, item) => total + ((parseFloat(item.unit_price) || 0) * (parseInt(item.quantity) || 0)), 0);
  // Use the raw value from backend, fallback only if all are null/undefined
  const shippingFeeRaw = order.shippingFee ?? order.shipping_fee ?? order.shippingCost;
  const shippingFee = typeof shippingFeeRaw === 'number' ? shippingFeeRaw : parseFloat(shippingFeeRaw) || 350;
  const additionalFees = parseFloat(order.additionalFees || 0);
  const totalPrice = parseFloat(order.totalAmount) || subtotal + shippingFee + additionalFees;

  // Prefer order.shippingAddress object if present
  const shippingAddrObj = order.shippingAddress && typeof order.shippingAddress === 'object' ? order.shippingAddress : null;
  const streetAddress = shippingAddrObj?.street_address || shippingAddrObj?.street || addressData?.street || (typeof order.shippingAddress === 'string' ? order.shippingAddress.split(',')[0].trim() : 'N/A') || 'N/A';
  const city = shippingAddrObj?.city || addressData?.city || (typeof order.shippingAddress === 'string' && order.shippingAddress.split(',').length > 1 ? order.shippingAddress.split(',')[1].trim() : 'N/A');
  const district = shippingAddrObj?.district || addressData?.district || (typeof order.shippingAddress === 'string' && order.shippingAddress.split(',').length > 2 ? order.shippingAddress.split(',')[2].trim() : 'N/A');
                   
  // Get status badge color class
  const getStatusColorClass = (status) => {
    if (!status) return '';
    
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'pending') return 'text-warning';
    if (statusLower === 'processing') return 'text-info';
    if (statusLower === 'review') return 'text-purple';
    if (statusLower === 'shipped') return 'text-primary';
    if (statusLower === 'delivered') return 'text-success';
    if (statusLower === 'cancelled' || statusLower === 'canceled') return 'text-danger';
    if (statusLower === 'to pay' || statusLower === 'awaiting payment') return 'text-danger';
    
    return '';
  };

  return (
    <div className="container mt-4" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <div className="card" style={{ 
        borderRadius: '16px', 
        overflow: 'hidden', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="card-body p-4 d-flex flex-column">
          {/* Header with back button and status */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <div 
                onClick={handleBack} 
                className="me-3 d-flex align-items-center justify-content-center"
                style={{
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#f8f9fa',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                title="Back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                </svg>
              </div>
              <h5 className="mb-0">Order Details</h5>
            </div>
            <span className={`badge ${getStatusColorClass(order.status)}`} 
                  style={{ fontSize: '0.9rem', padding: '5px 10px' }}>
              {order.status || 'Processing'}
            </span>
          </div>

          {/* Main content area with scrollable sections */}
          <div className="row g-3 custom-scrollbar" style={{ 
            overflowY: 'auto', 
            maxHeight: 'calc(100vh - 160px)',
            paddingRight: '5px' 
          }}>
            {/* Basic Order Information Section */}
            <div className="col-md-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-header bg-light py-2">
                  <h6 className="mb-0" style={{fontSize: "14px"}}>Basic Order Information</h6>
                </div>
                <div className="card-body p-3">
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="text-muted small mb-1">Order ID</label>
                      <div className="bg-light p-2 rounded" style={{height: "36px", lineHeight: "20px", fontSize: "14px"}}>
                        {order.id || order.order_id || 'N/A'}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small mb-1">Order Date & Time</label>
                      <div className="bg-light p-2 rounded" style={{height: "36px", lineHeight: "20px", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                        {order.orderDate || formatDate(order.date)}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small mb-1">Order Status</label>
                      <div className="bg-light p-2 rounded" style={{height: "36px", lineHeight: "20px", fontSize: "14px"}}>
                        <span className={getStatusTextClass(order.status)}>
                          {order.status || 'Processing'}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small mb-1">Payment Status</label>
                      <div className="bg-light p-2 rounded" style={{height: "36px", lineHeight: "20px", fontSize: "14px"}}>
                        {order.paymentStatus || 'Not Recorded'}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small mb-1">Payment Method</label>
                      <div className="bg-light p-2 rounded" style={{height: "36px", lineHeight: "20px", fontSize: "14px"}}>
                        {order.paymentMethod || 'Not Specified'}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small mb-1">Shipping Method</label>
                      <div className="bg-light p-2 rounded" style={{height: "36px", lineHeight: "20px", fontSize: "14px"}}>
                        {shippingMethodName}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small mb-1">Customized Order</label>
                      <div className="bg-light p-2 rounded" style={{height: "36px", lineHeight: "20px", fontSize: "14px"}}>
                        {order.customized || 'No'}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small mb-1">Delivery Date</label>
                      <div className="bg-light p-2 rounded" style={{height: "36px", lineHeight: "20px", fontSize: "14px"}}>
                        {order.deliveryDate ? formatDate(order.deliveryDate) : 'To be determined'}
                      </div>
                    </div>
                    
                    {order.customized === 'Yes' && (
                      <div className="col-md-12">
                        <label className="text-muted small mb-1">Assigned Artisan</label>
                        <div className="bg-light p-2 rounded" style={{height: "36px", lineHeight: "20px", fontSize: "14px"}}>
                          {order.assignedArtisan || 'Not Assigned'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Customer Information Section */}
            <div className="col-md-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-header bg-light py-2">
                  <h6 className="mb-0" style={{fontSize: "14px"}}>Customer Information</h6>
                </div>
                <div className="card-body p-3">
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="text-muted small mb-1">Customer Name</label>
                      <div className="bg-light p-2 rounded" style={{height: "36px", lineHeight: "20px", fontSize: "14px"}}>
                        {order.customerName || 'N/A'}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small mb-1">Customer ID</label>
                      <div className="bg-light p-2 rounded" style={{height: "36px", lineHeight: "20px", fontSize: "14px"}}>
                        {order.customer_id || order.customerId || 'N/A'}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small mb-1">Email</label>
                      <div className="bg-light p-2 rounded" style={{height: "36px", lineHeight: "20px", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                        {order.customerEmail || order.customer?.email || 'N/A'}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small mb-1">Phone Number</label>
                      <div className="bg-light p-2 rounded" style={{height: "36px", lineHeight: "20px", fontSize: "14px"}}>
                        {order.customerPhone || order.customer?.phone || 'N/A'}
                      </div>
                    </div>
                    <div className="col-md-12">
                      <label className="text-muted small mb-1">Street Address</label>
                      <div className="bg-light p-2 rounded" style={{height: "36px", lineHeight: "20px", fontSize: "14px"}}>
                        {loading ? 
                          <span className="text-muted">Loading...</span> : 
                          streetAddress
                        }
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small mb-1">City</label>
                      <div className="bg-light p-2 rounded" style={{height: "36px", lineHeight: "20px", fontSize: "14px"}}>
                        {loading ? 
                          <span className="text-muted">Loading...</span> : 
                          city
                        }
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="text-muted small mb-1">District</label>
                      <div className="bg-light p-2 rounded" style={{height: "36px", lineHeight: "20px", fontSize: "14px"}}>
                        {loading ? 
                          <span className="text-muted">Loading...</span> : 
                          district
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Items Section with table */}
            <div className="col-md-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-light py-2">
                  <h6 className="mb-0" style={{fontSize: "14px"}}>Order Items</h6>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive custom-scrollbar" style={{maxHeight: "200px", overflowY: "auto"}}>
                    <table className="table table-hover mb-0 small">
                      <thead className="table-light">
                        <tr style={{fontSize: "14px"}}>
                          <th>Product ID</th>
                          <th>Product Name</th>
                          <th>Qty</th>
                          <th>Unit Price</th>
                          <th>Subtotal</th>
                          {order.customized === 'Yes' && <th>Customizations</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.length > 0 ? (
                          orderItems.map((item, index) => (
                            <tr key={index} style={{fontSize: "13px"}}>
                              <td>{item.product_id}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  {item.image_url && (
                                    <img 
                                      src={item.image_url} 
                                      alt={item.product_name} 
                                      style={{width: '30px', height: '30px', objectFit: 'cover', marginRight: '8px'}}
                                    />
                                  )}
                                  <span>{item.product_name}</span>
                                </div>
                              </td>
                              <td>{item.quantity}</td>
                              <td>{formatCurrency(item.unit_price)}</td>
                              <td>{formatCurrency(item.quantity * item.unit_price)}</td>
                              {order.customized === 'Yes' && <td>{item.customizations || item.customNotes || 'N/A'}</td>}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={order.customized === 'Yes' ? 6 : 5} className="text-center py-2">
                              No items available
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {/* Order totals footer */}
                      <tfoot className="table-light">
                        <tr style={{fontSize: "13px"}}>
                          <td colSpan="2" className="text-end fw-bold">
                            Total Quantity:
                          </td>
                          <td>
                            {totalQuantity}
                          </td>
                          <td colSpan="2"></td>
                          {order.customized === 'Yes' && <td></td>}
                        </tr>
                        <tr style={{fontSize: "13px"}}>
                          <td colSpan={order.customized === 'Yes' ? 4 : 3} className="text-end fw-bold">
                            Subtotal:
                          </td>
                          <td colSpan={order.customized === 'Yes' ? 2 : 2}>
                            {formatCurrency(subtotal)}
                          </td>
                        </tr>
                        {additionalFees > 0 && (
                          <tr style={{fontSize: "13px"}}>
                            <td colSpan={order.customized === 'Yes' ? 4 : 3} className="text-end fw-bold">
                              Additional Fees:
                            </td>
                            <td colSpan={order.customized === 'Yes' ? 2 : 2}>
                              {formatCurrency(additionalFees)}
                            </td>
                          </tr>
                        )}
                        <tr style={{fontSize: "13px"}}>
                          <td colSpan={order.customized === 'Yes' ? 4 : 3} className="text-end fw-bold">
                            Shipping Fee:
                          </td>
                          <td colSpan={order.customized === 'Yes' ? 2 : 2}>
                            {formatCurrency(shippingFee)}
                          </td>
                        </tr>
                        <tr style={{fontSize: "13px"}} className="table-primary">
                          <td colSpan={order.customized === 'Yes' ? 4 : 3} className="text-end fw-bold">
                            Total Price:
                          </td>
                          <td colSpan={order.customized === 'Yes' ? 2 : 2} className="fw-bold">
                            {formatCurrency(totalPrice)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Notes Section (conditional) */}
            {order.notes && (
              <div className="col-md-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-light py-2">
                    <h6 className="mb-0" style={{fontSize: "14px"}}>Order Notes</h6>
                  </div>
                  <div className="card-body p-2">
                    <div className="bg-light p-2 rounded hide-scrollbar" style={{
                      maxHeight: "60px", 
                      overflowY: "auto",
                      fontSize: "14px"
                    }}>
                      {order.notes}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer with back button */}
          <div className="d-flex justify-content-end mt-3 pt-2 border-top">
            <button 
              onClick={handleBack}
              className="btn btn-light d-flex align-items-center"
              style={{ cursor: 'pointer' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left me-2" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
              </svg>
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderViewForm;
