import React, { useEffect, useState } from 'react';
import { Check, MapPin, Truck, CreditCard, Banknote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getShippingFeeByDistrict } from '../../data/shippingZones';

const ReviewStep = ({ formData, items, subtotal, customizationTotal, total }) => {
  const [wholesaleDiscount, setWholesaleDiscount] = useState(null);
  const [discountedTotal, setDiscountedTotal] = useState(total);
  const [shippingFee, setShippingFee] = useState(0);

  useEffect(() => {
    // Calculate shipping fee based on shipping method and district from formData
    const calculateShippingFee = () => {
      if (formData.shippingMethod === 'pickup') {
        return 0; // No shipping fee for pickup
      } else {
        // Get district-specific shipping fee
        return formData.district ? getShippingFeeByDistrict(formData.district) : 350;
      }
    };
    
    const fee = calculateShippingFee();
    setShippingFee(fee);
    
    // Check if user is logged in and is a wholesale customer
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        if (userData.accountType === 'Wholesale') {
          // Calculate 5% discount on subtotal + customization (not shipping)
          const baseAmount = subtotal + customizationTotal;
          const discount = Math.round((baseAmount * 0.05) * 100) / 100;
          setWholesaleDiscount(discount);
          
          // Calculate new total with discount
          const newTotal = subtotal + customizationTotal + fee - discount;
          setDiscountedTotal(newTotal);
        } else {
          // Regular customer - total is just subtotal + customization + shipping
          setDiscountedTotal(subtotal + customizationTotal + fee);
        }
      } catch (error) {
        console.error('Error checking wholesale status:', error);
        setDiscountedTotal(subtotal + customizationTotal + fee);
      }
    } else {
      setDiscountedTotal(subtotal + customizationTotal + fee);
    }
  }, [formData.shippingMethod, formData.district, subtotal, customizationTotal, total]);

  // Function to render the payment method icon and name
  const renderPaymentMethod = () => {
    switch (formData.paymentMethod) {
      case 'card':
        return (
          <div className="flex items-center">
            <CreditCard size={16} className="text-primary mr-2" />
            <span>Credit/Debit Card</span>
            {formData.cardNumber && (
              <span className="ml-2 text-gray-500">
                **** {formData.cardNumber.slice(-4)}
              </span>
            )}
          </div>
        );
      case 'cod':
        return (
          <div className="flex items-center">
            <Banknote size={16} className="text-primary mr-2" />
            <span>Cash on Delivery</span>
          </div>
        );
      case 'paypal':
        return (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-[#0085FF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.045 6.771C19.045 9.236 17.544 10.981 15.29 10.981H13.93C13.66 10.981 13.43 11.211 13.39 11.481L12.92 14.531C12.88 14.761 12.68 14.921 12.45 14.921H10.87C10.66 14.921 10.49 14.761 10.53 14.551L12.01 5.171C12.05 5.001 12.19 4.881 12.36 4.881H16.06C17.82 4.881 19.045 5.616 19.045 6.771Z" fill="currentColor"/>
              <path d="M8.94 10.98H7.58C7.31 10.98 7.08 11.21 7.04 11.48L6.57 14.53C6.53 14.76 6.33 14.92 6.1 14.92H4.52C4.31 14.92 4.14 14.76 4.18 14.55L5.66 5.17C5.7 5.0 5.84 4.88 6.01 4.88H9.71C11.47 4.88 12.7 5.62 12.7 6.77C12.7 9.24 11.19 10.98 8.94 10.98Z" fill="currentColor"/>
              <path d="M17.3 19.121C17.3 19.441 17.04 19.701 16.72 19.701H4.73C4.41 19.701 4.15 19.441 4.15 19.121C4.15 18.801 4.41 18.541 4.73 18.541H16.72C17.04 18.541 17.3 18.801 17.3 19.121Z" fill="#00186A"/>
            </svg>
            <span>PayPal</span>
          </div>
        );
      case 'gpay':
        return (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.5 12C21.5 13.3 21.35 14.12 20.88 15H12.5V9H21.33C21.44 9.95 21.5 10.55 21.5 12Z" fill="#4285F4"/>
              <path d="M12.5 5V9H21.33C20.89 7.12 19.77 5.72 18.33 5H12.5Z" fill="#EA4335"/>
              <path d="M3.67 14.95L5.33 13.8C4.93 13.23 4.73 12.61 4.73 12C4.73 11.39 4.94 10.77 5.33 10.2L3.67 9.05C3.01 9.92 2.6 10.92 2.6 12C2.6 13.08 3.01 14.08 3.67 14.95Z" fill="#FBBC05"/>
              <path d="M12.5 19C9.94 19 7.5 17.5 7.5 14.5C7.5 11.7 9.73 10 12.5 10H20.88C19.5 15 17 19 12.5 19Z" fill="#34A853"/>
              <path d="M12.5 19C15.5 19 17.21 17.5 18.33 15.5H12.5V19Z" fill="#4285F4"/>
            </svg>
            <span>Google Pay</span>
          </div>
        );
      default:
        return <span>Not specified</span>;
    }
  };

  // Get user information from localStorage to display in summary
  const getUserInfo = () => {
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        return JSON.parse(userJson);
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };
  
  const user = getUserInfo();
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Review your order</h2>
      
      <div className="space-y-6">
        {/* Contact Information */}
        <div>
          <h3 className="font-medium text-lg mb-2">Contact Information</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex flex-col space-y-1">
              {/* Display user info from localStorage instead of form data */}
              <p><span className="font-medium">Name:</span> {user?.firstName} {user?.lastName}</p>
              <p><span className="font-medium">Email:</span> {user?.email}</p>
              <p><span className="font-medium">Phone:</span> {formData.phone}</p>
            </div>
          </div>
        </div>
        
        {/* Shipping Address */}
        <div>
          <h3 className="font-medium text-lg mb-2">Shipping Address</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p>{formData.address}</p>
            <p>{formData.city}, {formData.district}</p>
            <p>{formData.postalCode}</p>
            <p>Sri Lanka</p>
          </div>
        </div>
        
        {/* Billing Address */}
        <div>
          <h3 className="font-medium text-lg mb-2">Billing Address</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            {formData.sameAsShipping ? (
              <>
                <p><em>Same as shipping address</em></p>
              </>
            ) : (
              <>
                <p>{user?.firstName} {user?.lastName}</p>
                <p>{formData.billingAddress}</p>
                <p>{formData.billingCity}, {formData.billingDistrict}</p>
                <p>{formData.billingPostalCode}</p>
                <p>Sri Lanka</p>
              </>
            )}
          </div>
        </div>
        
        {/* Shipping Method */}
        <div>
          <h3 className="font-medium text-lg mb-2">Shipping Method</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p>
              {formData.shippingMethod === 'pickup' 
                ? `Pickup from ${formData.pickupLocation}` 
                : 'Standard Delivery (3-5 business days)'}
            </p>
          </div>
        </div>
        
        {/* Payment Method */}
        <div>
          <h3 className="font-medium text-lg mb-2">Payment Method</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            {formData.paymentMethod === 'card' && (
              <p>Credit Card (ending in {formData.cardNumber.slice(-4)})</p>
            )}
            {formData.paymentMethod === 'cod' && <p>Cash on Delivery</p>}
            {formData.paymentMethod === 'paypal' && <p>PayPal</p>}
            {formData.paymentMethod === 'gpay' && <p>Google Pay</p>}
          </div>
        </div>
        
        {/* Order Summary */}
        <div>
          <h3 className="font-medium text-lg mb-2">Order Summary</h3>
          <div className="border-t border-b py-2">
            {items.map(item => (
              <div key={`${item.product.id}-${item.customization || ''}`} className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="font-medium">{item.quantity} × </span>
                  <span className="ml-2">{item.product.name}</span>
                  {item.customization && <span className="ml-2 text-gray-500 text-sm">(Customized)</span>}
                </div>
                <span>{item.product.currency} {(
                  item.product.price * item.quantity + 
                  (item.customization && item.product.customizationFee 
                    ? item.product.customizationFee * item.quantity 
                    : 0)
                ).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>LKR {subtotal.toLocaleString()}</span>
            </div>
            {customizationTotal > 0 && (
              <div className="flex justify-between">
                <span>Customization Fee:</span>
                <span>LKR {customizationTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping:</span>
              {formData.shippingMethod === 'pickup' ? (
                <span className="text-green-600">Free (Pickup)</span>
              ) : (
                <span>LKR {shippingFee.toLocaleString()}</span>
              )}
            </div>
            {wholesaleDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Wholesale Discount (5%)</span>
                <span>-LKR {wholesaleDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
              <span>Total:</span>
              <span>LKR {discountedTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <p className="text-sm text-gray-600">
            By placing your order, you agree to our terms of service and privacy policy.
            You also acknowledge that cancellations and returns are subject to our cancellation
            and return policies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
