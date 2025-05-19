import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import { getShippingFeeByDistrict } from '../data/shippingZones';
import axios from 'axios'; // Import axios for API requests

// Step components
import ShippingAddressStep from '../components/checkout/ShippingAddressStep';
import ShippingMethodStep from '../components/checkout/ShippingMethodStep';
import BillingAddressStep from '../components/checkout/BillingAddressStep';
import PaymentStep from '../components/checkout/PaymentStep';
import ReviewStep from '../components/checkout/ReviewStep';
import ConfirmationStep from '../components/checkout/ConfirmationStep';

const CheckoutPage = () => {
  const { items, subtotal, customizationTotal, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Current step in checkout process
  const [currentStep, setCurrentStep] = useState(1);
  
  // State to track if order is completed
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  // State for loading indicator
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get user information from localStorage
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        setUser(userData);
        
        // Pre-fill email if user is logged in
        if (userData.email) {
          setFormData(prev => ({
            ...prev,
            phone: userData.phone || '',
          }));
          
          // If user is logged in, try to fetch their saved addresses
          fetchCustomerAddresses(userData.c_id);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Function to fetch customer's saved addresses
  const fetchCustomerAddresses = async (customerId) => {
    if (!customerId) return;
    
    try {
      const token = localStorage.getItem('token');
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};
      
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${baseURL}/api/checkout/customer/${customerId}/addresses`,
        config
      );
      
      if (response.data.success && response.data.addresses.length > 0) {
        // Get all shipping addresses
        const shippingAddresses = response.data.addresses.filter(
          addr => addr.addressType === 'shipping'
        );
        
        // Sort addresses by createdAt in descending order to get the most recent one
        shippingAddresses.sort((a, b) => 
          new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)
        );
        
        // Use the most recent shipping address
        const mostRecentAddress = shippingAddresses[0];
        
        if (mostRecentAddress) {
          console.log('Using most recent shipping address:', mostRecentAddress);
          setFormData(prev => ({
            ...prev,
            address: mostRecentAddress.street_address || '',
            city: mostRecentAddress.city || '',
            district: mostRecentAddress.district || '',
            postalCode: mostRecentAddress.postalCode || ''
          }));
        }
        
        // If customer has a phone number, use it
        if (response.data.customer && response.data.customer.phone) {
          setFormData(prev => ({
            ...prev,
            phone: response.data.customer.phone
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching customer addresses:', error);
      // Continue with checkout even if we couldn't fetch addresses
    }
  };

  const [formData, setFormData] = useState({
    // Shipping address
    phone: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    
    // Shipping method
    shippingMethod: 'delivery', // 'delivery' or 'pickup'
    pickupLocation: '', // for pickup option
    
    // Billing address
    sameAsShipping: true,
    billingFirstName: '',
    billingLastName: '',
    billingAddress: '',
    billingCity: '',
    billingDistrict: '',
    billingPostalCode: '',
    
    // Payment
    paymentMethod: 'card', // 'card', 'cod', 'paypal', 'gpay'
    
    // For card payments (simplified, in production would use a payment processor)
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });
  
  // Define shipping rates
  const shippingRates = {
    standard: 350,
    express: 500
  };

  // Calculate shipping cost based on method and district
  const calculateShippingCost = () => {
    if (formData.shippingMethod === 'pickup') {
      return 0; // Free for pickup
    } else if (formData.district) {
      // Use the shipping fee function from shippingZones
      return getShippingFeeByDistrict(formData.district);
    } else {
      // Default shipping rate if no district selected
      return 350;
    }
  };

  // Calculate final total with shipping and wholesale discount if applicable
  const getFinalTotal = () => {
    // First calculate shipping cost
    const shippingCost = calculateShippingCost();
    
    // Base amount
    let finalAmount = subtotal + customizationTotal + shippingCost;
    
    // Apply wholesale discount if applicable
    if (user && user.accountType === 'Business') {
      // Apply 5% discount to subtotal + customization (not shipping)
      const discountAmount = (subtotal + customizationTotal) * 0.05;
      finalAmount = finalAmount - discountAmount;
    }
    
    return finalAmount;
  };
  
  const finalTotal = getFinalTotal();

  const [errors, setErrors] = useState({});
  
  // Set billing address fields when sameAsShipping changes
  useEffect(() => {
    if (formData.sameAsShipping) {
      setFormData(prev => ({
        ...prev,
        billingAddress: prev.address,
        billingCity: prev.city,
        billingDistrict: prev.district,
        billingPostalCode: prev.postalCode
      }));
    }
  }, [
    formData.sameAsShipping, 
    formData.address, 
    formData.city, 
    formData.district,
    formData.postalCode
  ]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Validate current step and move to the next if valid
  const handleNextStep = async () => {
    if (validateCurrentStep()) {
      // If moving from shipping address step, save address to backend
      if (currentStep === 1) {
        try {
          // Get authentication token if available
          const token = localStorage.getItem('token');
          const config = token ? {
            headers: { Authorization: `Bearer ${token}` }
          } : {};
          
          if (!token) {
            // Redirect to login if not authenticated
            toast({
              title: "Authentication Required",
              description: "Please log in to proceed with checkout.",
              variant: "destructive",
            });
            
            navigate('/login?redirect=checkout');
            return;
          }
          
          // Prepare address data
          const addressData = {
            customerInfo: {
              customerId: user?.c_id,
              // Use user data instead of form fields
              firstName: user?.firstName,
              lastName: user?.lastName,
              email: user?.email,
              phone: formData.phone
            },
            shippingAddress: {
              street: formData.address,
              city: formData.city,
              district: formData.district,
              postalCode: formData.postalCode,
              country: 'Sri Lanka'
            }
          };
          
          // Submit shipping address to backend
          const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const response = await axios.post(
            `${baseURL}/api/checkout/shipping-address`, 
            addressData, 
            config
          );
          
          // If successful, store the customer ID in case it was newly created
          if (response.data.customerId && !user?.c_id) {
            setUser(prev => ({
              ...prev,
              c_id: response.data.customerId
            }));
          }
          
          // If customer data returned, update the local user data
          if (response.data.customerData) {
            // Update user information in localStorage
            const updatedUserData = {
              ...user,
              ...response.data.customerData
            };
            
            localStorage.setItem('user', JSON.stringify(updatedUserData));
            setUser(updatedUserData);
            
            // Update form data with the returned phone if it exists
            if (response.data.customerData.phone && response.data.customerData.phone !== formData.phone) {
              setFormData(prev => ({
                ...prev,
                phone: response.data.customerData.phone
              }));
              
              toast({
                title: "Phone number updated",
                description: "Using your existing phone number from your account.",
              });
            }
          }
          
          toast({
            title: "Address saved",
            description: "Your shipping address has been saved for this checkout.",
          });
        } catch (error) {
          console.error("Error saving shipping address:", error);
          // We can continue even if saving fails
          toast({
            variant: "destructive",
            title: "Warning",
            description: "Address couldn't be saved, but you can still continue.",
          });
        }
      }
      
      // If moving from billing address step, save billing address to backend
      else if (currentStep === 3 && !formData.sameAsShipping) {
        try {
          const token = localStorage.getItem('token');
          const config = token ? {
            headers: { Authorization: `Bearer ${token}` }
          } : {};
          
          // Prepare billing address data
          const billingData = {
            customerId: user?.c_id,
            sameAsShipping: formData.sameAsShipping,
            billingAddress: {
              street: formData.billingAddress,
              city: formData.billingCity,
              district: formData.billingDistrict,
              postalCode: formData.billingPostalCode,
              country: 'Sri Lanka'
            }
          };
          
          // Submit billing address to backend
          const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          await axios.post(
            `${baseURL}/api/checkout/billing-address`, 
            billingData, 
            config
          );
        } catch (error) {
          console.error("Error saving billing address:", error);
          // Continue even if saving fails
        }
      }
      
      // Move to next step
      setCurrentStep(curr => curr + 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Move to previous step
  const handlePrevStep = () => {
    setCurrentStep(curr => curr - 1);
    window.scrollTo(0, 0);
  };
  
  // Validate the current step's fields
  const validateCurrentStep = () => {
    const newErrors = {};
    
    switch (currentStep) {
      case 1: // Shipping Address
        // Remove validation for firstName, lastName, email
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.district) newErrors.district = 'District is required';
        if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
        break;
        
      case 2: // Shipping Method
        if (formData.shippingMethod === 'pickup' && !formData.pickupLocation) {
          newErrors.pickupLocation = 'Please select a pickup location';
        }
        break;
        
      case 3: // Billing Address
        if (!formData.sameAsShipping) {
          if (!formData.billingAddress.trim()) newErrors.billingAddress = 'Address is required';
          if (!formData.billingCity.trim()) newErrors.billingCity = 'City is required';
          if (!formData.billingDistrict) newErrors.billingDistrict = 'District is required';
          if (!formData.billingPostalCode.trim()) newErrors.billingPostalCode = 'Postal code is required';
        }
        break;
        
      case 4: // Payment
        if (formData.paymentMethod === 'card') {
          if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
          if (!formData.cardExpiry) newErrors.cardExpiry = 'Expiry date is required';
          if (!formData.cardCvc) newErrors.cardCvc = 'CVC is required';
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Place order when finalizing on the review step
  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      // Get authentication token from localStorage
      const token = localStorage.getItem('token');
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      
      if (!isAuthenticated) {
        toast({
          title: "Authentication Required",
          description: "Please log in to complete your order.",
          variant: "destructive",
        });
        
        // Save cart to localStorage and redirect to login
        navigate('/login?redirect=checkout');
        return;
      }
      
      // Apply wholesale discount if applicable
      const isWholesaleCustomer = user && user.accountType === 'Business';
      
      // Calculate shipping fee
      const shippingFee = calculateShippingCost();
      
      // Calculate the final amounts with wholesale discount if applicable
      const discountAmount = isWholesaleCustomer ? (subtotal + customizationTotal) * 0.05 : 0;
      const calcTotal = subtotal + customizationTotal + shippingFee - discountAmount;
      
      // Prepare order data - use user data from the logged-in user
      const orderData = {
        customerInfo: {
          customerId: user?.c_id,
          // Use stored user data instead of form fields
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          phone: formData.phone,
          isGuest: false,
          accountType: user?.accountType || 'Personal' // Include account type
        },
        shippingAddress: {
          street: formData.address,
          city: formData.city,
          district: formData.district,
          postalCode: formData.postalCode,
          country: 'Sri Lanka'
        },
        billingAddress: formData.sameAsShipping ? null : {
          street: formData.billingAddress,
          city: formData.billingCity,
          district: formData.billingDistrict,
          postalCode: formData.billingPostalCode,
          country: 'Sri Lanka'
        },
        orderItems: items.map(item => {
          // Calculate the exact customization fee
          let customizationFee = 0;
          if (item.customization && item.product.customizationFee) {
            customizationFee = parseFloat(item.product.customizationFee);
          }
          
          // Apply wholesale discount to product price if applicable
          const productPrice = isWholesaleCustomer ? 
            item.product.price * 0.95 : 
            item.product.price;
          
          return {
            productId: item.product.id,
            quantity: item.quantity,
            price: productPrice,
            originalPrice: item.product.price,
            customization: item.customization || null,
            customizationFee: customizationFee,
            wholesaleDiscount: isWholesaleCustomer
          };
        }),
        paymentInfo: {
          method: formData.paymentMethod,
          cardDetails: formData.paymentMethod === 'card' ? {
            cardNumber: formData.cardNumber,
            expiry: formData.cardExpiry,
            cvc: formData.cardCvc
          } : null
        },
        orderSummary: {
          subtotal: subtotal,
          customizationTotal,
          shippingFee: shippingFee,
          wholesaleDiscount: discountAmount,
          isWholesaleCustomer,
          total: calcTotal
        },
        shippingMethod: formData.shippingMethod,
        pickupLocation: formData.pickupLocation || null
      };
      
      console.log('Sending order data:', JSON.stringify(orderData));
      
      // Setup request headers
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};
      
      // Submit order to backend API
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(
        `${baseURL}/api/checkout/place-order`, 
        orderData, 
        config
      );
      
      // Handle successful order creation
      const generatedOrderId = response.data.orderId || 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      setOrderId(generatedOrderId);
      
      // Show success message
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${generatedOrderId} has been placed and will be processed shortly.`,
      });
      
      // Handle payment redirects based on payment method
      switch (formData.paymentMethod) {
        case 'paypal':
          // Save order details first
          localStorage.setItem('pendingOrder', JSON.stringify({
            orderId: generatedOrderId,
            email: formData.email
          }));
          
          clearCart(); // Clear cart before redirecting
          
          // Force navigation to PayPal using direct browser redirection
          setTimeout(() => {
            window.location.href = response.data.paymentUrl || "https://www.paypal.com/checkout";
          }, 1500);
          return;
          
        case 'gpay':
          // Save order details first
          localStorage.setItem('pendingOrder', JSON.stringify({
            orderId: generatedOrderId,
            email: formData.email
          }));
          
          clearCart(); // Clear cart before redirecting
          
          // Force navigation to Google Pay
          setTimeout(() => {
            window.location.href = response.data.paymentUrl || "https://pay.google.com";
          }, 1500);
          return;
          
        default:
          // For card and COD payments, proceed directly to confirmation
          setOrderCompleted(true);
          setCurrentStep(6);
          clearCart();
          break;
      }
      
    } catch (error) {
      console.error('Error placing order:', error);
      console.error('Error response:', error.response?.data);
      toast({
        title: "Error Placing Order",
        description: error.response?.data?.message || "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If cart is empty and order not completed, redirect to cart
  if (items.length === 0 && !orderCompleted) {
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
  
  // Render the step indicator
  const renderStepIndicator = () => {
    const steps = [
      { number: 1, name: 'Shipping Address' },
      { number: 2, name: 'Shipping Method' },
      { number: 3, name: 'Billing Address' },
      { number: 4, name: 'Payment' },
      { number: 5, name: 'Review' },
    ];
    
    return (
      <div className="mb-8">
        <div className="hidden md:flex justify-between relative">
          {steps.map(step => (
            <div 
              key={step.number}
              className={`flex flex-col items-center z-10 ${
                currentStep >= step.number ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <div 
                className={`w-8 h-8 flex items-center justify-center rounded-full mb-2 ${
                  currentStep > step.number 
                    ? 'bg-primary text-white' 
                    : currentStep === step.number 
                      ? 'border-2 border-primary text-primary' 
                      : 'border-2 border-gray-300 text-gray-400'
                }`}
              >
                {currentStep > step.number ? <Check size={16} /> : step.number}
              </div>
              <div className="text-xs text-center">{step.name}</div>
            </div>
          ))}
          
          {/* Connection lines */}
          <div className="absolute top-4 h-0.5 bg-gray-200 w-full -z-0"></div>
          <div 
            className="absolute top-4 h-0.5 bg-primary w-0 -z-0 transition-all duration-500"
            style={{ width: `${(Math.min(currentStep - 1, 4) / 4) * 100}%` }}
          ></div>
        </div>
        
        {/* Mobile step indicator */}
        <div className="md:hidden flex items-center justify-between">
          <span className="text-sm font-medium">
            Step {currentStep} of 5: {steps.find(s => s.number === currentStep)?.name}
          </span>
          <div className="h-2 w-full max-w-[120px] bg-gray-200 rounded-full ml-4">
            <div 
              className="h-2 bg-primary rounded-full"
              style={{ width: `${(Math.min(currentStep, 5) / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ShippingAddressStep 
            formData={formData}
            errors={errors}
            handleChange={handleChange}
          />
        );
      case 2:
        return (
          <ShippingMethodStep
            formData={formData}
            errors={errors}
            handleChange={handleChange}
          />
        );
      case 3:
        return (
          <BillingAddressStep
            formData={formData}
            errors={errors}
            handleChange={handleChange}
          />
        );
      case 4:
        return (
          <PaymentStep
            formData={formData}
            errors={errors}
            handleChange={handleChange}
          />
        );
      case 5:
        return (
          <ReviewStep 
            formData={formData}
            items={items}
            subtotal={subtotal}
            customizationTotal={customizationTotal}
            total={total}
            shippingFee={calculateShippingCost()}
          />
        );
      case 6:
        return (
          <ConfirmationStep 
            orderId={orderId}
            email={user?.email || 'your email address'}
          />
        );
      default:
        return null;
    }
  };
  
  // Navigation buttons for each step
  const renderNavButtons = () => {
    if (currentStep === 6) return null; // No navigation on confirmation

    return (
      <div className="flex mt-8 pt-6 border-t justify-between">
        {currentStep > 1 && (
          <button 
            onClick={handlePrevStep}
            disabled={isSubmitting}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </button>
        )}
        
        {currentStep < 5 ? (
          <button
            onClick={handleNextStep}
            disabled={isSubmitting}
            className="ml-auto flex items-center bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover disabled:opacity-50"
          >
            Continue
            <ArrowRight size={16} className="ml-2" />
          </button>
        ) : currentStep === 5 ? (
          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="ml-auto bg-primary text-white px-8 py-3 rounded-md hover:bg-primary-hover font-medium disabled:opacity-50 flex items-center"
          >
            {isSubmitting ? 'Processing...' : 'Place Order'}
            {isSubmitting && (
              <svg className="animate-spin ml-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
          </button>
        ) : null}
      </div>
    );
  };
  
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
          
          {/* Only show step indicator for steps 1-5 */}
          {currentStep <= 5 && renderStepIndicator()}
          
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Main Content */}
            <div className={currentStep === 6 ? "lg:col-span-3" : "lg:col-span-2"}>
              <div className="bg-white shadow-sm rounded-lg p-6">
                {renderStepContent()}
                {renderNavButtons()}
              </div>
            </div>
            
            {/* Order Summary (not shown on confirmation) */}
            {currentStep < 6 && (
              <div className="lg:col-span-1 mt-8 lg:mt-0">
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
                        {formData.shippingMethod === 'pickup' ? (
                          <span className="text-green-600">Free (Pickup)</span>
                        ) : (
                          <span>LKR {calculateShippingCost().toLocaleString()}</span>
                        )}
                      </div>
                      {user && user.accountType === 'Business' && (
                        <div className="flex justify-between text-green-600">
                          <span>Wholesale Discount (5%)</span>
                          <span>-LKR {((subtotal + customizationTotal) * 0.05).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Total</span>
                        <span>LKR {finalTotal.toLocaleString()}</span>
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
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;