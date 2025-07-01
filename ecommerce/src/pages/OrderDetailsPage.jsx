import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Package, Calendar, Truck, Clock, ArrowLeft, MapPin, 
  Download, Phone, Star, User, HelpCircle, ChevronRight, Printer 
} from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import orderService from '../services/orderService';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const invoiceRef = useRef(null);
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch order details on mount
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        if (!orderId) {
          throw new Error('Order ID is required');
        }
        
        console.log(`Fetching order details for ID: ${orderId}`);
        
        // Get order data from API
        const data = await orderService.getOrderById(orderId);
        console.log('Order details response:', data);
        
        if (!data) {
          throw new Error('No data returned from API');
        }
        
        // Fetch product images for each order detail
        const productsWithImages = await Promise.all((data.orderDetails || []).map(async detail => {
          // First try to use the image already included in the response
          let productImage = detail.product_image || null;
          let productName = detail.product_name || '';
          
          // If no image in response, try to fetch it
          if (!productImage) {
            try {
              productImage = await orderService.getProductImage(detail.product_id);
            } catch (err) {
              console.log(`Failed to fetch image for product ${detail.product_id}`);
            }
          }
          
          // If no product name, try to fetch product details from inventory
          if (!productName) {
            try {
              // Get product data from inventory table
              const inventoryItem = await orderService.getInventoryItem(detail.product_id);
              if (inventoryItem && inventoryItem.product_name) {
                productName = inventoryItem.product_name;
              } else {
                // Fallback to product details
                const productDetails = await orderService.getProductDetails(detail.product_id);
                if (productDetails && productDetails.name) {
                  productName = productDetails.name;
                }
              }
            } catch (err) {
              console.log(`Failed to fetch name for product ${detail.product_id} from inventory`, err);
            }
          }
          
          return {
            id: detail.product_id,
            name: productName || 'Handix Product', // Use actual name or default to "Handix Product"
            image: productImage || 
                  `${baseURL}/uploads/products/${detail.product_id}.jpg` || 
                  `https://via.placeholder.com/300?text=Product+${detail.product_id}`,
            price: parseFloat(detail.priceAtPurchase || detail.price || 0),
            quantity: detail.quantity || 1,
            artisan: detail.artisan_name || 'Handix Artisan',
            customization: detail.customization || null
          };
        }));
        
        // Calculate shipping fee from total - subtotal difference
        const calculateShippingFee = () => {
          const subtotal = calculateSubtotal(data.orderDetails || []);
          const total = parseFloat(data.totalAmount || 0);
          
          // Use the difference between total and subtotal as shipping fee
          return Math.max(0, total - subtotal);
        };
        
        // Transform API response to match our component's expected structure
        const processedOrder = {
          id: data.order_id,
          date: data.orderDate,
          status: data.orderStatus?.toLowerCase() || 'processing',
          total: parseFloat(data.totalAmount || 0),
          items: data.orderDetails?.length || 0,
          estimatedDelivery: calculateEstimatedDelivery(data.orderDate),
          deliveredDate: data.deliveryDate || null,
          shippingAddress: getShippingAddressFromData(data),
          billingAddress: getBillingAddressFromData(data),
          paymentMethod: data.paymentMethod || 'Card payment',
          subtotal: calculateSubtotal(data.orderDetails || []),
          shipping: calculateShippingFee(),
          discount: 0,
          products: productsWithImages,
          timeline: generateTimelineFromStatus(data)
        };
        
        console.log('Processed order data with actual images:', processedOrder);
        setOrder(processedOrder);
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        // Handle fetch error
        setError(err.message || 'Could not load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId, baseURL]);

  // Helper function to calculate estimated delivery date
  const calculateEstimatedDelivery = (orderDate) => {
    if (!orderDate) return null;
    
    const date = new Date(orderDate);
    const estimatedDate = new Date(date);
    estimatedDate.setDate(date.getDate() + 10); // 10 days from order date
    
    return estimatedDate.toISOString();
  };
  
  // Extract shipping address from API data with better handling for nested objects
  const getShippingAddressFromData = (data) => {
    const customerInfo = data.customerInfo || {};
    const addresses = customerInfo.addresses || [];
    // Try to find a default address or use the first available one
    const address = addresses.find(addr => addr.is_default) || addresses[0] || {};
    
    return {
      name: data.customerName || `${customerInfo.firstName || ''} ${customerInfo.lastName || ''}`.trim(),
      street: address.street_address || address.streetAddress || 'N/A',
      city: address.city || 'N/A',
      state: address.district || address.state || 'N/A',
      zip: address.postal_code || address.postalCode || address.zip || 'N/A',
      country: address.country || 'Sri Lanka',
      phone: customerInfo.phone || 'N/A'
    };
  };
  
  // Extract billing address from API data
  const getBillingAddressFromData = (data) => {
    // For now, use same address as shipping
    return getShippingAddressFromData(data);
  };
  
  // Calculate subtotal from order details
  const calculateSubtotal = (orderDetails) => {
    return orderDetails.reduce((sum, item) => {
      const price = parseFloat(item.priceAtPurchase || item.price || 0);
      const quantity = parseInt(item.quantity || 1);
      return sum + (price * quantity);
    }, 0);
  };
  
  // Transform order details to products array
  const transformOrderDetailsToProducts = (orderDetails) => {
    return orderDetails.map(detail => ({
      id: detail.product_id,
      name: detail.product_name || `Product #${detail.product_id}`,
      image: detail.product_image || 'https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg',
      price: parseFloat(detail.priceAtPurchase || detail.price || 0),
      quantity: detail.quantity || 1,
      artisan: detail.artisan_name || 'Handix Artisan',
      customization: detail.customization || null
    }));
  };
  
  // Generate timeline from order status
  const generateTimelineFromStatus = (data) => {
    const timeline = [];
    const orderDate = new Date(data.orderDate);
    const status = data.orderStatus?.toLowerCase() || 'processing';
    
    // Always add Order Placed event
    timeline.push({
      date: data.orderDate,
      status: 'Order Placed',
      description: 'Your order has been confirmed'
    });
    
    // Add Processing event if status is beyond "placed"
    if (['processing', 'shipped', 'delivered'].includes(status)) {
      const processingDate = new Date(orderDate);
      processingDate.setDate(orderDate.getDate() + 1);
      
      timeline.push({
        date: processingDate.toISOString(),
        status: 'Processing',
        description: 'Your order is being prepared'
      });
    }
    
    // Add Shipped event if status is shipped or delivered
    if (['shipped', 'delivered'].includes(status)) {
      const shippedDate = new Date(orderDate);
      shippedDate.setDate(orderDate.getDate() + 3);
      
      timeline.push({
        date: shippedDate.toISOString(),
        status: 'Shipped',
        description: 'Your order has been shipped'
      });
    }
    
    // Add Delivered event if status is delivered
    if (status === 'delivered') {
      const deliveredDate = data.deliveryDate 
        ? new Date(data.deliveryDate)
        : (() => {
            const date = new Date(orderDate);
            date.setDate(orderDate.getDate() + 10);
            return date;
          })();
      
      timeline.push({
        date: deliveredDate.toISOString(),
        status: 'Delivered',
        description: 'Your order has been delivered'
      });
    }
    
    return timeline;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get status color class based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get status icon based on status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <Package className="h-5 w-5" />;
      case 'cancelled':
        return <X className="h-5 w-5" />;
      default:
        return <HelpCircle className="h-5 w-5" />;
    }
  };

  // Print invoice as PDF using actual order data
  const printInvoice = () => {
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
                  <p style="margin: 5px 0 0;">${formatDate(order?.date)}</p>
                </div>
              </div>
              
              <div class="invoice-details">
                <div class="invoice-details-group">
                  <h3>Bill To:</h3>
                  <p>${order?.shippingAddress?.name || 'Customer'}</p>
                  <p>${order?.shippingAddress?.street || ''}</p>
                  <p>${order?.shippingAddress?.city || ''}, ${order?.shippingAddress?.state || ''}</p>
                  <p>${order?.shippingAddress?.country || 'Sri Lanka'}</p>
                </div>
                <div class="invoice-details-group" style="text-align: right;">
                  <h3>Payment Information:</h3>
                  <p><strong>Method:</strong> ${order?.paymentMethod || 'Card Payment'}</p>
                  <p><strong>Status:</strong> ${order?.status === 'delivered' ? 'Paid' : 'Processing'}</p>
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
                  ${order && order.products ? 
                    order.products.map(product => `
                      <tr>
                        <td class="item-description">
                          <div style="display: flex; align-items: center;">
                            <div style="width: 40px; height: 40px; margin-right: 10px; overflow: hidden; border-radius: 4px;">
                              <img src="${product.image}" 
                                 alt="${product.name}" 
                                 style="width: 100%; height: 100%; object-fit: cover;"
                                 onerror="this.onerror=null; this.src='https://via.placeholder.com/40?text=Product'">
                            </div>
                            <div>
                              ${product.name}
                              ${product.customization ? `<br><span style="font-size: 12px; color: #666;">Customization: ${product.customization}</span>` : ''}
                              <br><span style="font-size: 12px; color: #666;">By ${product.artisan}</span>
                            </div>
                          </div>
                        </td>
                        <td class="item-price">LKR ${product.price.toLocaleString()}</td>
                        <td class="item-qty">${product.quantity}</td>
                        <td class="item-total">LKR ${(product.price * product.quantity).toLocaleString()}</td>
                      </tr>
                    `).join('') : 
                    `<tr>
                      <td class="item-description">No products found</td>
                      <td class="item-price">-</td>
                      <td class="item-qty">-</td>
                      <td class="item-total">-</td>
                    </tr>`
                  }
                </tbody>
              </table>
              
              <table class="totals-table">
                <tr>
                  <td class="totals-label">Subtotal:</td>
                  <td class="totals-value">LKR ${(order?.subtotal || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td class="totals-label">Shipping:</td>
                  <td class="totals-value">${(order?.shipping || 0) <= 0 ? 'Free' : `LKR ${(order?.shipping || 0).toLocaleString()}`}</td>
                </tr>
                ${order?.discount > 0 ? `
                <tr>
                  <td class="totals-label">Discount:</td>
                  <td class="totals-value">-LKR ${order.discount.toLocaleString()}</td>
                </tr>` : ''}
                <tr class="total-row">
                  <td class="totals-label">Total:</td>
                  <td class="totals-value">LKR ${(order?.total || 0).toLocaleString()}</td>
                </tr>
              </table>
              
              <div class="invoice-footer">
                <p>Thank you for your purchase!</p>
                <p>If you have any questions about this invoice, please contact<br>
                customer service at support@handix.com or +94 77-63 60319</p>
              </div>
            </div>
            
            <script>
              // Auto-print when loaded
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 250);
              };
            </script>
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

  // Show error message if something went wrong
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Order</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If no order found
  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find the order you're looking for.</p>
          <Link 
            to="/purchases" 
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link to="/purchases" className="inline-flex items-center text-gray-600 mb-6 hover:text-primary">
            <ArrowLeft size={16} className="mr-2" />
            Back to My Orders
          </Link>
          
          {/* Order Summary Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-wrap justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold">Order #{order.id}</h1>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <Calendar size={14} className="mr-1" />
                    <span>Placed on {formatDate(order.date)}</span>
                  </div>
                </div>
                <div className="mt-3 sm:mt-0">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Timeline */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium mb-6">Order Progress</h2>
              <div className="relative">
                {/* Progress bar */}
                <div className="absolute left-0 top-4 w-full h-1 bg-gray-200"></div>
                {order.timeline && (
                  <div 
                    className="absolute left-0 top-4 h-1 bg-primary transition-all duration-500"
                    style={{ 
                      width: `${(order.timeline.findIndex(item => item.status.toLowerCase() === order.status) + 1) / order.timeline.length * 100}%` 
                    }}
                  ></div>
                )}
                
                {/* Timeline steps */}
                <div className="flex justify-between relative z-10">
                  {order.timeline && order.timeline.map((step, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index <= order.timeline.findIndex(item => item.status.toLowerCase() === order.status) 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                      <p className={`mt-2 text-xs font-medium ${
                        index <= order.timeline.findIndex(item => item.status.toLowerCase() === order.status) 
                          ? 'text-primary' 
                          : 'text-gray-500'
                      }`}>{step.status}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(step.date)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Shipping Details */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium mb-4">Shipping Details</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm uppercase text-gray-500 mb-2">Shipping Address</h3>
                  <div className="flex">
                    <MapPin size={16} className="mr-2 flex-shrink-0 text-gray-500" />
                    <div>
                      <p className="font-medium">{order.shippingAddress.name}</p>
                      <p>{order.shippingAddress.street}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                      {order.shippingAddress.phone && (
                        <p className="flex items-center mt-1">
                          <Phone size={14} className="mr-1 text-gray-500" />
                          {order.shippingAddress.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm uppercase text-gray-500 mb-2">Delivery Information</h3>
                  <div className="space-y-2">
                    <div className="flex">
                      <Truck size={16} className="mr-2 flex-shrink-0 text-gray-500" />
                      <div>
                        <p className="font-medium">{order.shipping <= 0 ? 'Store Pickup' : 'Standard Shipping'}</p>
                        <p className="text-sm text-gray-600">
                          {order.status === 'delivered'
                            ? `Delivered on ${formatDate(order.deliveredDate)}`
                            : `Estimated delivery by ${formatDate(order.estimatedDelivery)}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Items in Your Order</h2>
                <button 
                  onClick={printInvoice}
                  className="flex items-center text-primary hover:text-primary/80 text-sm"
                >
                  <Printer size={16} className="mr-1" />
                  Print Invoice
                </button>
              </div>
              
              <div className="space-y-4">
                {order.products && order.products.map((product, index) => (
                  <div key={index} className="flex flex-wrap md:flex-nowrap border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="w-full md:w-auto md:mr-4 mb-3 md:mb-0">
                      <div className="w-20 h-20 rounded overflow-hidden border">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">{product.name}</h3>
                      {product.customization && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="text-primary font-medium">Customization:</span> {product.customization}
                        </p>
                      )}
                      <div className="text-sm text-gray-500 mt-1">Quantity: {product.quantity}</div>
                      <div className="text-sm text-gray-500">Artisan: {product.artisan}</div>
                    </div>
                    <div className="w-full md:w-auto mt-3 md:mt-0 text-right">
                      <div className="font-medium">LKR {product.price.toLocaleString()}</div>
                      {order.status === 'delivered' && (
                        <Link 
                          to={`/reviews/write/${order.id}`}
                          state={{ 
                            orderId: order.id, 
                            product: product 
                          }}
                          className="inline-flex items-center text-sm text-primary hover:underline mt-2"
                        >
                          <Star size={14} className="mr-1" />
                          Write a review
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Payment Information */}
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Payment Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm uppercase text-gray-500 mb-2">Payment Method</h3>
                  <p className="font-medium">{order.paymentMethod}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.status === 'delivered' ? 'Payment completed' : 'Payment processing'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm uppercase text-gray-500 mb-2">Order Summary</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>LKR {order.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span>{order.shipping <= 0 ? 'Free' : `LKR ${order.shipping.toLocaleString()}`}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-primary">
                        <span>Discount</span>
                        <span>-LKR {order.discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t border-gray-200 pt-2 mt-2">
                      <span>Total</span>
                      <span>LKR {order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Link to="/purchases" className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Back to My Orders
            </Link>
            <Link to="/contact" className="px-5 py-2 border border-primary text-primary rounded-md hover:bg-blue-50">
              Contact Support
            </Link>
          </div>
          
          {/* Help Text */}
          <div className="text-sm text-gray-500 mb-8">
            <p className="mb-1">Need help with your order?</p>
            <p>Contact our customer service at <a href="mailto:support@handix.com" className="text-primary hover:underline">support@handix.com</a> or call +94 77-63 60319</p>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Hidden div for printing */}
      <div id="printable-invoice" ref={invoiceRef} className="hidden"></div>
    </div>
  );
};

export default OrderDetailsPage;
