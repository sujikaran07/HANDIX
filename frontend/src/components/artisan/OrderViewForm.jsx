import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrderViewForm = ({ order: initialOrder, onBack }) => {
  const [order, setOrder] = useState(initialOrder);
  const [addressData, setAddressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shippingMethodName, setShippingMethodName] = useState('Standard Delivery');
  const [orderItems, setOrderItems] = useState([]);
  
  useEffect(() => {
    console.log("Initial order data in view form:", initialOrder);
    
    // Fetch complete order details
    const fetchCompleteOrderDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('artisanToken');
        
        // Get order ID from either o_id or order_id
        const orderId = initialOrder?.o_id || initialOrder?.order_id;
        if (!orderId) {
          console.error("No order ID available");
          setLoading(false);
          return;
        }
        
        // Fetch order details
        const response = await axios.get(
          `http://localhost:5000/api/orders/${orderId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log("Complete order data fetched:", response.data);
        
        // Update order with complete data
        const completeOrder = {
          ...initialOrder,
          ...response.data,
          // Make sure shipping fee is explicitly set - try multiple possible property names
          shippingFee: response.data.shippingFee || response.data.shipping_fee || response.data.shippingCost || 350
        };
        
        console.log("Order with shipping fee:", completeOrder.shippingFee);
        
        setOrder(completeOrder);
        
        // Explicitly log customer ID to verify it's coming from response
        console.log("Customer ID from response:", response.data.c_id || 'Not in response');
        
        // Set the customer_id from c_id to ensure it's correctly displayed
        if (response.data.c_id) {
          completeOrder.customer_id = response.data.c_id;
        }
        
        setOrder(completeOrder);
        
        // Fetch customer info using c_id from the order
        if (completeOrder.c_id) {
          try {
            const customerResponse = await axios.get(
              `http://localhost:5000/api/customers/${completeOrder.c_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (customerResponse.data) {
              console.log("Customer data fetched:", customerResponse.data);
              
              // Update order with customer info
              completeOrder.customerName = `${customerResponse.data.firstName || ''} ${customerResponse.data.lastName || ''}`.trim();
              completeOrder.customerEmail = customerResponse.data.email;
              completeOrder.customerPhone = customerResponse.data.phone;
              // Ensure customer_id is set correctly
              completeOrder.customer_id = customerResponse.data.c_id;
              
              setOrder(completeOrder);
              
              // Fetch customer address
              fetchCustomerAddresses(completeOrder.c_id);
            }
          } catch (customerError) {
            console.error("Failed to fetch customer information:", customerError);
          }
        } else if (response.data.customerInfo && response.data.customerInfo.c_id) {
          // Alternative: if c_id not directly in order but nested in customerInfo
          completeOrder.customer_id = response.data.customerInfo.c_id;
          setOrder(completeOrder);
          fetchCustomerAddresses(response.data.customerInfo.c_id);
        }
        
        // Fetch order items
        if (completeOrder.order_id) {
          try {
            const itemsResponse = await axios.get(
              `http://localhost:5000/api/orders/${orderId}/items`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (itemsResponse.data && Array.isArray(itemsResponse.data)) {
              console.log("Order items fetched:", itemsResponse.data);
              
              // Process items to include product details and images
              const processedItems = await Promise.all(itemsResponse.data.map(async (item) => {
                try {
                  // Get product details if not already included
                  if (!item.product_name) {
                    const productResponse = await axios.get(
                      `http://localhost:5000/api/inventory/${item.product_id}`,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    
                    if (productResponse.data) {
                      item.product_name = productResponse.data.product_name;
                    }
                  }
                  
                  // Get product image if not already included
                  if (!item.image_url) {
                    const imageResponse = await axios.get(
                      `http://localhost:5000/api/products/${item.product_id}/images`,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    
                    if (imageResponse.data && imageResponse.data.images && imageResponse.data.images.length > 0) {
                      item.image_url = imageResponse.data.images[0].image_url;
                    }
                  }
                  
                  return {
                    product_id: item.product_id,
                    product_name: item.product_name || 'Unknown Product',
                    quantity: item.quantity,
                    unit_price: item.priceAtPurchase || item.unit_price || 0,
                    image_url: item.image_url || null,
                    customizations: item.customization || null
                  };
                } catch (err) {
                  console.error(`Error fetching details for product ${item.product_id}:`, err);
                  return item;
                }
              }));
              
              setOrderItems(processedItems);
            }
          } catch (itemsError) {
            console.error("Failed to fetch order items:", itemsError);
          }
        }
        
        // Fetch shipping method if available
        if (completeOrder.shippingMethodId) {
          fetchShippingMethod(completeOrder.shippingMethodId);
        }
        
      } catch (error) {
        console.error("Failed to fetch complete order details:", error);
        if (error.response) {
          console.error("Error response:", error.response.status, error.response.data);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompleteOrderDetails();
  }, [initialOrder]);
  
  const fetchCustomerAddresses = async (customerId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/addresses/customer/${customerId}`);
      console.log("Customer addresses:", response.data);
      
      // If addresses are found, use the default one or the first one
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
    }
  };
  
  const fetchShippingMethod = async (shippingMethodId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/shipping-methods/${shippingMethodId}`);
      console.log("Shipping method data:", response.data);
      
      if (response.data && response.data.method_name) {
        setShippingMethodName(response.data.method_name);
      } else {
        // Fallback based on shipping method ID
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
      // Use default or provided shipping method name if API fails
      setShippingMethodName(order.shippingMethod || 'Standard Delivery');
    }
  };
  
  const handleBack = () => {
    onBack();
  };
  
  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="card p-5" style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div className="spinner-border text-primary mx-auto" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading order details...</p>
        </div>
      </div>
    );
  }
  
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

  // Get the appropriate text color class for status
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

  // Format currency for display
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'LKR 0.00';
    return `LKR ${parseFloat(amount).toFixed(2)}`;
  };

  // Calculate order totals
  const totalQuantity = orderItems.reduce((total, item) => total + (parseInt(item.quantity) || 0), 0);
  const subtotal = order.subtotal || orderItems.reduce((total, item) => total + ((parseFloat(item.unit_price) || 0) * (parseInt(item.quantity) || 0)), 0);
  // Make sure we correctly handle shipping fee from all possible sources
  const shippingFee = parseFloat(order.shippingFee || order.shipping_fee || order.shippingCost || 350);
  const additionalFees = parseFloat(order.additionalFees || order.customization_fee || 0);
  const totalPrice = parseFloat(order.totalAmount) || subtotal + shippingFee + additionalFees;

  // Get address information - prioritize address from DB, then from order object
  const streetAddress = addressData?.street || 
                       (order.shippingAddress && order.shippingAddress.split(',')[0].trim()) || 
                       'N/A';
                       
  const city = addressData?.city || 
              (order.shippingAddress && order.shippingAddress.split(',').length > 1 ? 
               order.shippingAddress.split(',')[1].trim() : 'N/A');
               
  const district = addressData?.district || 
                  (order.shippingAddress && order.shippingAddress.split(',').length > 2 ? 
                   order.shippingAddress.split(',')[2].trim() : 'N/A');
                   
  // Function to get appropriate CSS class for status based on AdminOrder.css
  const getStatusColorClass = (status) => {
    if (!status) return '';
    
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'pending') return 'text-warning';
    if (statusLower === 'processing') return 'text-info';
    if (statusLower === 'review') return 'text-purple';  // #6f42c1
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

          <div className="row g-3 custom-scrollbar" style={{ 
            overflowY: 'auto', 
            maxHeight: 'calc(100vh - 160px)',
            paddingRight: '5px' 
          }}>
            {/* Basic Order Information */}
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
                        {order.deliveryEndDate
                          ? new Date(order.deliveryEndDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                          : order.deliveryStartDate
                            ? new Date(order.deliveryStartDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                            : 'To be determined'}
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
            
            {/* Customer Information */}
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
                        {order.customer_id || order.c_id || order.customerId || 'N/A'}
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
            
            {/* Order Items Section */}
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
            
            {/* Order Notes (if available) */}
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
