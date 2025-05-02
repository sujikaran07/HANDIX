import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Check, CreditCard, Truck } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import PaymentMethodSelector from '../components/PaymentMethodSelector';

const CheckoutPage = () => {
  const { items, subtotal, customizationTotal, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'card'
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handlePaymentMethodChange = (method) => {
    setFormData(prev => ({ ...prev, paymentMethod: method }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Process the order
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been placed and will be processed shortly.",
      });
      
      clearCart();
      
      // Redirect based on payment method
      switch (formData.paymentMethod) {
        case 'card':
          // In a real app this would redirect to a payment processor
          navigate('/');
          break;
        case 'cod':
          navigate('/');
          break;
        case 'paypal':
          window.location.href = "https://www.paypal.com"; // Demo redirect
          break;
        case 'gpay':
          window.location.href = "https://pay.google.com"; // Demo redirect
          break;
        default:
          navigate('/');
          break;
      }
    }
  };
  
  // If cart is empty, redirect to cart page
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%] py-16 text-center">
          <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">
            You need to add items to your cart before proceeding to checkout.
          </p>
          <Link
            to="/products"
            className="btn-primary"
          >
            Start Shopping
          </Link>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow bg-gray-50 py-16">
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
          {/* Breadcrumb */}
          <div className="flex items-center mb-6 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight size={14} className="mx-2" />
            <Link to="/cart" className="hover:text-primary">Cart</Link>
            <ChevronRight size={14} className="mx-2" />
            <span>Checkout</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 mb-8 lg:mb-0">
              <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Delivery Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full p-2 border ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  
                  {/* Last Name */}
                  <div>
                    <label className="block text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full p-2 border ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label className="block text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full p-2 border ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  {/* Phone */}
                  <div>
                    <label className="block text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full p-2 border ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                  
                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-1">Street Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full p-2 border ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>
                  
                  {/* City */}
                  <div>
                    <label className="block text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full p-2 border ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>
                  
                  {/* Postal Code */}
                  <div>
                    <label className="block text-gray-700 mb-1">Postal Code *</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className={`w-full p-2 border ${
                        errors.postalCode ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                    {errors.postalCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                    )}
                  </div>
                </div>
                
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                
                <PaymentMethodSelector 
                  selectedMethod={formData.paymentMethod} 
                  onMethodChange={handlePaymentMethodChange}
                />
                
                <button 
                  type="submit" 
                  className="w-full py-3 px-6 rounded-md bg-primary text-white hover:bg-primary-hover mt-6"
                >
                  Place Order
                </button>
              </form>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-sm rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  {items.map(item => (
                    <div key={`${item.product.id}-${item.customization || ''}`} className="flex">
                      <div className="h-16 w-16 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-grow">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                          {item.customization && ' (Customized)'}
                        </p>
                        <p className="text-primary">
                          {item.product.currency} {(
                            item.product.price * item.quantity + 
                            (item.customization && item.product.customizationFee 
                              ? item.product.customizationFee * item.quantity 
                              : 0)
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>LKR {subtotal.toLocaleString()}</span>
                    </div>
                    {customizationTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customization Fee</span>
                        <span>LKR {customizationTotal.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>LKR {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-start">
                    <Check size={16} className="text-green-500 mt-1 mr-2" />
                    <p className="text-sm text-gray-600">
                      Your personal data will be used to process your order, support your experience, 
                      and for other purposes described in our privacy policy.
                    </p>
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

export default CheckoutPage;