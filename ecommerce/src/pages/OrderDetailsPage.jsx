import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Package, Calendar, Truck, Clock, ArrowLeft, MapPin, 
  Download, Phone, Star, User, HelpCircle, ChevronRight 
} from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, fetch order data from API
    // For demo, we'll simulate with static data
    
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Find the matching order data
      // This would be an API call in a real application
      const mockOrder = {
        id: orderId,
        date: '2023-04-15',
        status: 'delivered',
        total: 9000, // Updated total without tax
        items: 3,
        estimatedDelivery: '2023-04-20',
        deliveredDate: '2023-04-19',
        shippingAddress: {
          name: 'Sarah Johnson',
          street: '456 Palm Avenue',
          city: 'Colombo',
          state: 'Western Province',
          zip: '10300',
          country: 'Sri Lanka',
          phone: '+94 71 1234567'
        },
        billingAddress: {
          name: 'Sarah Johnson',
          street: '456 Palm Avenue',
          city: 'Colombo',
          state: 'Western Province',
          zip: '10300',
          country: 'Sri Lanka',
        },
        paymentMethod: 'Visa card ending in 4242',
        subtotal: 9000,
        shipping: 0,
        discount: 0,
        products: [
          { 
            id: 'prod-1',
            name: 'Handcrafted Ceramic Vase', 
            image: 'https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg',
            price: 3500,
            quantity: 1,
            artisan: 'Ceramic Artisans Co.'
          },
          { 
            id: 'prod-2',
            name: 'Wooden Kitchenware Set', 
            image: 'https://images.pexels.com/photos/6270663/pexels-photo-6270663.jpeg',
            price: 2800,
            quantity: 1,
            artisan: 'Woodland Crafters'
          },
          { 
            id: 'prod-3',
            name: 'Handwoven Wall Hanging', 
            image: 'https://images.pexels.com/photos/6048185/pexels-photo-6048185.jpeg',
            price: 2700,
            quantity: 1,
            artisan: 'Textile Artists Guild'
          }
        ],
        timeline: [
          { date: '2023-04-15', status: 'Order Placed', description: 'Your order has been confirmed' },
          { date: '2023-04-16', status: 'Processing', description: 'Your order is being prepared' },
          { date: '2023-04-17', status: 'Shipped', description: 'Your order has been shipped' },
          { date: '2023-04-19', status: 'Delivered', description: 'Your order has been delivered' }
        ]
      };
      
      setOrder(mockOrder);
      setLoading(false);
    }, 800);
  }, [orderId]);
  
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
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <Clock size={16} className="mr-1" />;
      case 'shipped':
        return <Truck size={16} className="mr-1" />;
      case 'delivered':
        return <Package size={16} className="mr-1" />;
      default:
        return null;
    }
  };
  
  // Format date for better display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Navigate to the review page for a product
  const navigateToReview = (product) => {
    navigate(`/reviews/write/${orderId}`, { 
      state: { 
        orderId: orderId, 
        product: product 
      } 
    });
  };

  // Function to handle invoice download - Updated with design from ConfirmationStep
  const handleDownloadInvoice = () => {
    const invoiceWindow = window.open('', '_blank');
    
    if (!invoiceWindow) {
      alert('Please allow pop-ups to download your invoice');
      return;
    }
    
    // Create HTML invoice with design matching ConfirmationStep
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
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
                <p style="margin: 5px 0 0;"><strong>#${order.id}</strong></p>
                <p style="margin: 5px 0 0;">${formatDate(order.date)}</p>
              </div>
            </div>
            
            <div class="invoice-details">
              <div class="invoice-details-group">
                <h3>Bill To:</h3>
                <p>${order.shippingAddress.name}</p>
                <p>${order.shippingAddress.street}</p>
                <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}</p>
                <p>${order.shippingAddress.country}</p>
              </div>
              <div class="invoice-details-group" style="text-align: right;">
                <h3>Payment Information:</h3>
                <p><strong>Method:</strong> ${order.paymentMethod}</p>
                <p><strong>Status:</strong> ${order.status === 'delivered' ? 'Paid' : 'Processing'}</p>
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
                ${order.products.map(product => `
                  <tr>
                    <td class="item-description">
                      ${product.name}
                      <br><span style="font-size: 12px; color: #666;">By ${product.artisan}</span>
                    </td>
                    <td class="item-price">LKR ${product.price.toLocaleString()}</td>
                    <td class="item-qty">${product.quantity}</td>
                    <td class="item-total">LKR ${(product.price * product.quantity).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <table class="totals-table">
              <tr>
                <td class="totals-label">Subtotal:</td>
                <td class="totals-value">LKR ${order.subtotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="totals-label">Shipping:</td>
                <td class="totals-value">${order.shipping > 0 ? `LKR ${order.shipping.toLocaleString()}` : 'Free'}</td>
              </tr>
              ${order.discount > 0 ? `
              <tr>
                <td class="totals-label">Discount:</td>
                <td class="totals-value">-LKR ${order.discount.toLocaleString()}</td>
              </tr>` : ''}
              <tr class="total-row">
                <td class="totals-label">Total:</td>
                <td class="totals-value">LKR ${order.total.toLocaleString()}</td>
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
    `;
    
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <div className="p-8 text-center">
            <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-600">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow bg-gray-50 py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <HelpCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
              <p className="text-gray-500 mb-6">We couldn't find the order you're looking for.</p>
              <Link
                to="/purchases"
                className="inline-block py-2 px-6 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                View All Orders
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <button 
              onClick={() => navigate('/purchases')}
              className="flex items-center text-gray-600 hover:text-primary mb-6"
            >
              <ArrowLeft size={18} className="mr-1" />
              Back to Purchases
            </button>
            
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              {/* Order Header Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 flex-1">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">Order #{order.id}</h1>
                    <div className="flex items-center text-gray-500 mb-1">
                      <Calendar size={16} className="mr-1" />
                      <span>Placed on {formatDate(order.date)}</span>
                    </div>
                    {order.deliveredDate && order.status === 'delivered' && (
                      <div className="flex items-center text-gray-500">
                        <Package size={16} className="mr-1" />
                        <span>Delivered on {formatDate(order.deliveredDate)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className={`flex items-center px-3 py-1 rounded-full text-xs mb-2 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                    <div className="font-medium text-lg">Total: LKR {order.total.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6 md:w-72">
                <h2 className="font-medium mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button 
                    onClick={handleDownloadInvoice} 
                    className="w-full py-2 px-4 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <Download size={16} className="mr-2" />
                    Download Invoice
                  </button>
                  
                  <Link 
                    to="/contact"
                    className="w-full py-2 px-4 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <HelpCircle size={16} className="mr-2" />
                    Help with Order
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="font-medium mb-6">Order Journey</h2>
              <div className="relative">
                {order.timeline.map((event, idx) => (
                  <div 
                    key={idx} 
                    className={`flex mb-8 ${idx === order.timeline.length - 1 ? '' : 'pb-2'}`}
                  >
                    {/* Timeline connector */}
                    {idx < order.timeline.length - 1 && (
                      <div className="absolute h-full border-l-2 border-gray-200 ml-3 top-5 z-0"></div>
                    )}
                    
                    {/* Status dot */}
                    <div className="relative z-10 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white mr-4">
                      {event.status === 'Order Placed' && <Calendar size={14} />}
                      {event.status === 'Processing' && <Clock size={14} />}
                      {event.status === 'Shipped' && <Truck size={14} />}
                      {event.status === 'Delivered' && <Package size={14} />}
                    </div>
                    
                    {/* Status details */}
                    <div className="flex-1">
                      <h3 className="font-medium">{event.status}</h3>
                      <p className="text-gray-500 text-sm mb-1">{event.description}</p>
                      <p className="text-gray-400 text-xs">{formatDate(event.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Product Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="font-medium mb-4">Items in Your Order</h2>
              <div className="divide-y">
                {order.products.map((product, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex gap-4 flex-wrap md:flex-nowrap">
                      {/* Product image */}
                      <div className="w-20 h-20 rounded-md overflow-hidden border flex-shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      
                      {/* Product info */}
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{product.name}</h3>
                        <p className="text-gray-500 text-sm mb-1">By {product.artisan}</p>
                        <p className="text-sm text-gray-500">Quantity: {product.quantity}</p>
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Link 
                            to={`/products/${product.id}`}
                            className="text-sm text-primary hover:underline flex items-center"
                          >
                            View Product <ChevronRight size={14} className="ml-1" />
                          </Link>
                          
                          {order.status === 'delivered' && (
                            <button 
                              onClick={() => navigateToReview(product)}
                              className="text-sm text-primary hover:underline flex items-center"
                            >
                              <Star size={14} className="mr-1" /> Write Review
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="w-full md:w-auto text-right mt-2 md:mt-0">
                        <p className="font-medium">
                          LKR {product.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Shipping Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="font-medium mb-4">Shipping Details</h2>
                <div className="mb-4">
                  <h3 className="text-sm text-gray-500 mb-1">Delivery Address</h3>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{order.shippingAddress.name}</p>
                      <p className="text-sm">{order.shippingAddress.street}</p>
                      <p className="text-sm">
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                      </p>
                      <p className="text-sm">{order.shippingAddress.country}</p>
                      
                      {order.shippingAddress.phone && (
                        <p className="text-sm mt-2 flex items-center text-gray-500">
                          <Phone size={14} className="mr-1" /> {order.shippingAddress.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Tracking information section removed */}
              </div>
              
              {/* Payment Information - Fixed JSX structure */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="font-medium mb-4">Payment Summary</h2>
                
                <div className="mb-4">
                  <h3 className="text-sm text-gray-500 mb-1">Payment Method</h3>
                  <p className="font-medium">{order.paymentMethod}</p>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>LKR {order.subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span>{order.shipping > 0 ? `LKR ${order.shipping.toLocaleString()}` : 'Free'}</span>
                  </div>
                  
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-LKR {order.discount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>LKR {order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetailsPage;
