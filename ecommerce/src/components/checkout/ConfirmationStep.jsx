import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, ShoppingBag, Phone, Download, ChevronRight, Printer } from 'lucide-react';
import { fetchProducts } from '../../data/products';
import axios from 'axios';

const ConfirmationStep = ({ orderId, email }) => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef(null);
  
  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!orderId) return;
        
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('token');
        const config = token ? {
          headers: { Authorization: `Bearer ${token}` }
        } : {};
        
        const response = await axios.get(
          `${baseURL}/api/checkout/order/${orderId}`,
          config
        );
        
        if (response.data.success && response.data.order) {
          setOrderDetails(response.data.order);
          console.log('Order details retrieved:', response.data.order);
        }
      } catch (error) {
        console.error('Failed to fetch order details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);
  
  // Fetch recommended products when component mounts
  useEffect(() => {
    const loadRecommendedProducts = async () => {
      try {
        const products = await fetchProducts();
        // Get random 4 products for recommendations
        const shuffled = products.sort(() => 0.5 - Math.random());
        setRecommendedProducts(shuffled.slice(0, 4));
      } catch (error) {
        console.error('Error loading recommended products:', error);
      }
    };
    
    loadRecommendedProducts();
  }, []);

  // Format estimated delivery date (calculate based on order date, not current date)
  const getEstimatedDeliveryDateRange = () => {
    // Use order date from API if available, otherwise use current date
    const baseDate = orderDetails?.orderDate ? new Date(orderDetails.orderDate) : new Date();
    const startDate = new Date(baseDate);
    const endDate = new Date(baseDate);
    
    startDate.setDate(baseDate.getDate() + 7); // Min 7 days from order date
    endDate.setDate(baseDate.getDate() + 15); // Max 15 days from order date
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };
  
  // Format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get payment method display name
  const getPaymentMethodName = () => {
    if (!orderDetails) return 'Processing';
    const method = orderDetails.paymentMethod || 'card';
    switch (method.toLowerCase()) {
      case 'cod': return 'Cash on Delivery';
      case 'card': return 'Credit/Debit Card';
      default: return method;
    }
  };
  
  // Get payment status display name
  const getPaymentStatus = () => {
    if (!orderDetails) return 'Processing';
    
    const status = orderDetails.paymentStatus || '';
    const method = orderDetails.paymentMethod || '';
    
    if (method.toLowerCase() === 'cod') {
      return 'Pay on Delivery';
    }
    
    switch (status.toLowerCase()) {
      case 'completed': return 'Paid';
      case 'pending': return 'Pending';
      case 'awaiting': return 'Awaiting Payment';
      default: return status || 'Processing';
    }
  };
  
  // Calculate subtotal (without shipping)
  const calculateSubtotal = () => {
    if (!orderDetails || !orderDetails.orderDetails || !Array.isArray(orderDetails.orderDetails)) {
      return 0;
    }
    
    // Sum up all items
    return orderDetails.orderDetails.reduce((total, item) => {
      const price = parseFloat(item.priceAtPurchase || 0);
      const quantity = parseInt(item.quantity || 0);
      return total + (price * quantity);
    }, 0);
  };
  
  // Calculate shipping fee
  const calculateShippingFee = () => {
    if (!orderDetails) return 350;
    
    // If total amount exists, estimate by subtracting from the total
    if (orderDetails.totalAmount) {
      const subtotal = calculateSubtotal();
      const total = parseFloat(orderDetails.totalAmount);
      const difference = total - subtotal;
      
      // If difference seems reasonable as a shipping fee
      if (difference > 0 && difference < 1000) {
        return difference;
      }
    }
    
    // Default shipping fee
    return 350;
  };
  
  // Print invoice as PDF using actual order data
  const printInvoice = () => {
    const printContent = document.getElementById('printable-invoice');
    const originalDisplay = document.body.style.display;
    const originalOverflow = document.body.style.overflow;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      // Add invoice HTML to the new window with actual order data
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice - ${orderId}</title>
            <style>
              body {
                font-family: 'Segoe UI', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background: #fff;
                margin: 0;
                padding: 20px;
              }
              .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 30px;
                border: 1px solid #eee;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
                font-size: 14px;
              }
              .invoice-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #ddd;
              }
              .logo-container {
                max-width: 200px;
              }
              .invoice-logo {
                width: 100%;
                max-height: 60px;
                object-fit: contain;
              }
              .company-tagline {
                margin-top: 5px;
                color: #666;
                font-size: 13px;
              }
              .invoice-title {
                font-size: 28px;
                font-weight: bold;
                color: #2790C3;
                margin: 0;
              }
              .invoice-details {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
              }
              .invoice-details-group {
                max-width: 50%;
              }
              .invoice-details-group h3 {
                font-size: 16px;
                font-weight: bold;
                margin: 0 0 5px 0;
                color: #333;
              }
              .invoice-details-group p {
                margin: 0 0 3px 0;
              }
              .invoice-items {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              .invoice-items th {
                background-color: #f8fafc;
                text-align: left;
                padding: 10px;
                font-weight: bold;
                border-bottom: 2px solid #ddd;
              }
              .invoice-items td {
                padding: 10px;
                border-bottom: 1px solid #ddd;
              }
              .item-description {
                width: 40%;
              }
              .item-price, .item-qty, .item-total {
                width: 20%;
                text-align: right;
              }
              .totals-table {
                width: 35%;
                margin-left: auto;
              }
              .totals-table td {
                padding: 5px 0;
              }
              .totals-label {
                text-align: left;
              }
              .totals-value {
                text-align: right;
                font-weight: 500;
              }
              .total-row {
                font-weight: bold;
                font-size: 16px;
                border-top: 2px solid #ddd;
              }
              .invoice-footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                text-align: center;
              }
              @media print {
                .invoice-container {
                  box-shadow: none;
                  border: none;
                }
                @page {
                  margin: 0.5cm;
                }
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              <div class="invoice-header">
                <div>
                  <div class="logo-container">
                    <!-- Use the actual Handix logo -->
                    <img src="/images/handix-logo1.png" alt="Handix" class="invoice-logo" 
                      onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjAiIHk9IjI4IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjI0IiBmaWxsPSIjMWE1NmRiIj5IQU5ESVI8L3RleHQ+PC9zdmc+'" />
                  </div>
                  <p class="company-tagline">Handcrafted with love and precision</p>
                </div>
                <div style="text-align: right;">
                  <h2 style="margin: 0; color: #2790C3;">INVOICE</h2>
                  <p style="margin: 5px 0 0;"><strong>#${orderId}</strong></p>
                  <p style="margin: 5px 0 0;">${formatDate(orderDetails?.orderDate)}</p>
                </div>
              </div>
              
              <div class="invoice-details">
                <div class="invoice-details-group">
                  <h3>Bill To:</h3>
                  <p>${email || 'Customer'}</p>
                  <p>${orderDetails?.customerName || ''}</p>
                </div>
                <div class="invoice-details-group" style="text-align: right;">
                  <h3>Payment Information:</h3>
                  <p><strong>Method:</strong> ${getPaymentMethodName()}</p>
                  <p><strong>Status:</strong> ${getPaymentStatus()}</p>
                </div>
              </div>
              
              <table class="invoice-items">
                <thead>
                  <tr>
                    <th class="item-description">Description</th>
                    <th class="item-price">Unit Price</th>
                    <th class="item-qty">Qty</th>
                    <th class="item-total">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderDetails && orderDetails.orderDetails ? 
                    orderDetails.orderDetails.map((item, idx) => `
                      <tr>
                        <td class="item-description">
                          ${item.product_id || `Product ${idx+1}`}
                          ${item.customization ? `<br><span style="font-size: 12px; color: #666;">Customization: ${item.customization}</span>` : ''}
                        </td>
                        <td class="item-price">LKR ${parseFloat(item.priceAtPurchase || 0).toLocaleString()}</td>
                        <td class="item-qty">${item.quantity}</td>
                        <td class="item-total">LKR ${(parseFloat(item.priceAtPurchase || 0) * item.quantity).toLocaleString()}</td>
                      </tr>
                    `).join('') : 
                    `<tr>
                      <td class="item-description">Product</td>
                      <td class="item-price">LKR 1,500.00</td>
                      <td class="item-qty">1</td>
                      <td class="item-total">LKR 1,500.00</td>
                     </tr>`
                  }
                </tbody>
              </table>
              
              <table class="totals-table">
                <tr>
                  <td class="totals-label">Subtotal:</td>
                  <td class="totals-value">LKR ${calculateSubtotal().toLocaleString()}</td>
                </tr>
                <tr>
                  <td class="totals-label">Shipping:</td>
                  <td class="totals-value">LKR ${calculateShippingFee().toLocaleString()}</td>
                </tr>
                <tr class="total-row">
                  <td class="totals-label">Total:</td>
                  <td class="totals-value">LKR ${parseFloat(orderDetails?.totalAmount || 0).toLocaleString()}</td>
                </tr>
              </table>
              
              <div class="invoice-footer">
                <p>Thank you for your purchase!</p>
                <p>If you have any questions about this invoice, please contact<br>
                customer service at support@handix.com or +94 11 234 5678</p>
              </div>
            </div>
          </body>
        </html>
      `);
      
      // Focus the new window and print it
      printWindow.document.close();
      printWindow.focus();
      
      // Slightly delay printing to ensure styles are loaded
      setTimeout(() => {
        printWindow.print();
      }, 250);
    } else {
      // Fallback if pop-up blocked
      alert("Please allow pop-ups to download the invoice as PDF");
    }
  };

  // Show loading state while fetching order details
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Top Banner - Changed to Order Placed Successfully */}
      <div className="bg-primary text-white p-6 rounded-t-lg text-center">
        <h2 className="text-3xl font-bold mb-1">Order Placed Successfully!</h2>
        <p className="text-lg">
          Your order <span className="font-bold">{orderId}</span> has been confirmed
        </p>
      </div>
      
      {/* Order Status Card */}
      <div className="bg-white border border-gray-200 rounded-b-lg shadow-sm p-6 mb-6">
        <div className="flex items-center mb-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
            <CheckCircle size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Thank you for your order!</h3>
            <p className="text-gray-600">
              We'll send a confirmation email to {email || 'your email'}
              {orderDetails?.paymentMethod?.toLowerCase() === 'cod' && 
                " with instructions for payment upon delivery"
              }
            </p>
          </div>
        </div>
        
        {/* Order Timeline - Handix style with brand blue */}
        <div className="my-8">
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-0 top-4 w-full h-1 bg-gray-200"></div>
            <div className="absolute left-0 top-4 w-1/4 h-1 bg-primary"></div>
            
            {/* Steps - Always start with Order Placed regardless of payment status */}
            <div className="flex justify-between">
              <div className="relative text-center">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mx-auto">
                  <CheckCircle size={16} className="text-white" />
                </div>
                <p className="mt-2 text-xs font-medium text-primary">Order Placed</p>
              </div>
              
              <div className="relative text-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                  <Package size={16} className="text-gray-500" />
                </div>
                <p className="mt-2 text-xs font-medium text-gray-500">Processing</p>
              </div>
              
              <div className="relative text-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                  <ShoppingBag size={16} className="text-gray-500" />
                </div>
                <p className="mt-2 text-xs font-medium text-gray-500">Shipped</p>
              </div>
              
              <div className="relative text-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                  <CheckCircle size={16} className="text-gray-500" />
                </div>
                <p className="mt-2 text-xs font-medium text-gray-500">Delivered</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Delivery Info Card - Handix style with actual data */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-bold text-gray-800 mb-4">Delivery Information</h4>
          
          <div className="flex flex-col sm:flex-row justify-between">
            <div className="mb-4 sm:mb-0">
              <p className="text-gray-500 text-sm mb-1">Estimated Delivery</p>
              <p className="font-medium">{getEstimatedDeliveryDateRange()}</p>
            </div>
            
            <div>
              <p className="text-gray-500 text-sm mb-1">Shipping Method</p>
              <p className="font-medium">
                {orderDetails?.shippingMethod === 'pickup' ? 'Store Pickup' : 'Standard Shipping'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Order Details Section - Handix style with actual order data */}
      <div className="border border-gray-200 rounded-lg bg-white shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-lg">Order Details</h3>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between mb-6">
            <div>
              <div className="mb-3">
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="font-medium">{orderId}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium">
                  {formatDate(orderDetails?.orderDate)}
                </p>
              </div>
            </div>
            
            <div>
              <button 
                onClick={printInvoice}
                className="flex items-center text-primary hover:text-primary/80 bg-primary/5 px-4 py-2 rounded-md"
              >
                <Printer size={16} className="mr-2" />
                Download Invoice as PDF
              </button>
            </div>
          </div>
          
          {/* Show ordered items if available */}
          {orderDetails && orderDetails.orderDetails && orderDetails.orderDetails.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-3">Ordered Items</h4>
              <div className="space-y-3">
                {orderDetails.orderDetails.map((item, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-md">
                    <div className="flex-grow">
                      <p className="font-medium">{item.product_id}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      {item.customization && (
                        <p className="text-sm text-primary mt-1">Customization: {item.customization}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">LKR {parseFloat(item.priceAtPurchase).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Order total summary with actual data */}
          <div className="border-t border-dashed border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Payment Method:</div>
              <div className="font-medium">{getPaymentMethodName()}</div>
              
              <div className="text-gray-500">Payment Status:</div>
              <div className="font-medium">{getPaymentStatus()}</div>
              
              <div className="text-gray-500">Item(s) Subtotal:</div>
              <div className="font-medium">LKR {calculateSubtotal().toLocaleString()}</div>
              
              <div className="text-gray-500">Shipping:</div>
              <div className="font-medium">LKR {calculateShippingFee().toLocaleString()}</div>
              
              <div className="text-primary font-bold text-base">Order Total:</div>
              <div className="text-primary font-bold text-base">
                LKR {parseFloat(orderDetails?.totalAmount || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons - Handix style with primary blue */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
        <Link 
          to="/purchases" 
          className="flex-grow px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded font-medium transition duration-200 flex items-center justify-center"
        >
          Track Order
          <ChevronRight size={16} className="ml-1" />
        </Link>
        <Link 
          to="/products" 
          className="flex-grow px-6 py-3 border border-primary text-primary hover:bg-primary/5 rounded font-medium transition duration-200 flex items-center justify-center"
        >
          Continue Shopping
          <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>
      
      {/* Customer Service - Handix style with primary blue */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8">
        <div className="flex items-start">
          <div className="mr-3 mt-1">
            <Phone size={18} className="text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Need help with your order?</h4>
            <p className="text-sm text-gray-600 mb-2">Contact our customer service team</p>
            <Link 
              to="/contact" 
              className="text-primary text-sm hover:text-primary/80 font-medium"
            >
              Visit Customer Service
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recommended Products Section with actual products */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-4">Recommended For You</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {recommendedProducts.map((product) => (
            <Link 
              key={product.id} 
              to={`/products/${product.id}`} 
              className="block group"
            >
              <div className="bg-gray-100 aspect-square rounded-md mb-2 overflow-hidden">
                <img 
                  src={product.images?.[0] || 'https://placehold.co/300x300?text=Product'} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <p className="text-sm text-gray-800 line-clamp-2 group-hover:text-primary">
                {product.name}
              </p>
              <p className="text-primary font-bold mt-1">
                LKR {product.price?.toLocaleString() || '0'}
              </p>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500 mb-8">
        <p className="mb-1">
          Thank you for shopping with Handix. 
          Your order has been confirmed and will be shipped shortly.
        </p>
        <p>
          <Link to="/contact" className="text-primary hover:underline">Contact us</Link> if you have any questions about your order.
        </p>
      </div>
      
      {/* Hidden section that contains the printable invoice */}
      <div id="printable-invoice" ref={invoiceRef} className="hidden"></div>
    </div>
  );
};

export default ConfirmationStep;
