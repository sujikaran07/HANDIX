import React, { useEffect, useState } from 'react';
import { Check, MapPin, Truck, CreditCard, Banknote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getShippingFeeByDistrict } from '../../data/shippingZones';

const ReviewStep = ({ formData, items, subtotal, customizationTotal, total, user }) => {
  const isBusinessAccount = user && (user.accountType === 'Business' || user.accountType === 'business');
  const [businessDiscount, setBusinessDiscount] = useState(null);
  const [discountedTotal, setDiscountedTotal] = useState(total);
  const [shippingFee, setShippingFee] = useState(0);

  useEffect(() => {
    // Calculate shipping fee based on shipping method and district from formData
    const calculateShippingFee = () => {
      if (formData.shippingMethod === 'pickup') {
        return 0; // No shipping fee for pickup
      } else if (user && (user.accountType === 'Personal' || user.accountType === 'personal')) {
        return 500; // Always 500 for personal accounts
      } else if (formData.district) {
        return getShippingFeeByDistrict(formData.district, isBusinessAccount ? 'Business' : undefined);
      } else {
        return 350;
      }
    };
    const fee = calculateShippingFee();
    setShippingFee(fee);
    if (isBusinessAccount) {
      // Calculate 10% discount on subtotal + customization + shipping
      const baseAmount = subtotal + customizationTotal + fee;
      const discount = Math.round((baseAmount * 0.10) * 100) / 100;
      setBusinessDiscount(discount);
      // Calculate new total with discount
      const newTotal = baseAmount - discount;
      setDiscountedTotal(newTotal);
    } else {
      // Regular customer - total is just subtotal + customization + shipping
      setDiscountedTotal(subtotal + customizationTotal + fee);
    }
  }, [formData.shippingMethod, formData.district, subtotal, customizationTotal, total, isBusinessAccount, user]);

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
      default:
        return <span>Not specified</span>;
    }
  };

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
            {/* Additional message for personal accounts with district selected */}
            {user && (user.accountType === 'Personal' || user.accountType === 'personal') && formData.district && (
              <div className="text-xs text-amber-600 mt-1">
                Additional charges may apply based on package weight and courier service.
              </div>
            )}
            {businessDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Business Discount (10%)</span>
                <span>-LKR {businessDiscount.toLocaleString()}</span>
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
