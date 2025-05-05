import React from 'react';
import { Check, MapPin, Truck, CreditCard, Banknote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getShippingFeeByDistrict } from '../../data/shippingZones';

const ReviewStep = ({ formData, items, subtotal, customizationTotal, total }) => {
  const shippingFee = formData.shippingMethod === 'pickup' ? 0 : 
    formData.district ? getShippingFeeByDistrict(formData.district) : 350;
  
  const finalTotal = total + shippingFee;

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

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Review Your Order</h2>
      <p className="text-gray-600 mb-6">Please review your order details before placing your order.</p>
      
      {/* Shipping Details */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2">Shipping Information</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Phone:</strong> {formData.phone}</p>
          <p><strong>Method:</strong> {formData.shippingMethod === 'pickup' ? 'Store Pickup' : 'Home Delivery'}</p>
          
          {formData.shippingMethod === 'pickup' ? (
            <p><strong>Pickup Location:</strong> {
              formData.pickupLocation === 'mullaitivu-store' ? 'Mullaitivu Branch' : 
              formData.pickupLocation === 'kilinochchi-store' ? 'Kilinochchi Branch' : ''
            }</p>
          ) : (
            <>
              <p><strong>Address:</strong> {formData.address}</p>
              <p><strong>City:</strong> {formData.city}</p>
              <p><strong>District:</strong> {formData.district}</p>
              <p><strong>Postal Code:</strong> {formData.postalCode}</p>
            </>
          )}
        </div>
      </div>
      
      {/* Billing Details */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2">Billing Information</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          {formData.sameAsShipping ? (
            <p className="italic">Same as shipping address</p>
          ) : (
            <>
              <p><strong>Name:</strong> {formData.billingFirstName} {formData.billingLastName}</p>
              <p><strong>Address:</strong> {formData.billingAddress}</p>
              <p><strong>City:</strong> {formData.billingCity}</p>
              <p><strong>District:</strong> {formData.billingDistrict}</p>
              <p><strong>Postal Code:</strong> {formData.billingPostalCode}</p>
            </>
          )}
        </div>
      </div>
      
      {/* Payment Method */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2">Payment Method</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <p>
            {formData.paymentMethod === 'card' && 'Credit/Debit Card'}
            {formData.paymentMethod === 'cod' && 'Cash on Delivery'}
            {formData.paymentMethod === 'paypal' && 'PayPal'}
            {formData.paymentMethod === 'gpay' && 'Google Pay'}
          </p>
          {formData.paymentMethod === 'card' && (
            <p className="text-sm text-gray-600 mt-1">
              Card ending in {formData.cardNumber.slice(-4)}
            </p>
          )}
        </div>
      </div>
      
      {/* Order Summary */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2">Order Summary</h3>
        <div className="border rounded-md overflow-hidden">
          {/* Items */}
          <div className="divide-y">
            {items.map(item => (
              <div key={`${item.product.id}-${item.customization || ''}`} className="p-4 flex">
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
                    {item.customization && ` | Customization: ${item.customization}`}
                  </p>
                  <p className="text-primary">
                    LKR {(
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
          
          {/* Totals */}
          <div className="bg-gray-50 p-4">
            <div className="space-y-2">
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
                  <span>LKR {shippingFee.toLocaleString()}</span>
                )}
              </div>
              <div className="pt-2 flex justify-between font-bold border-t">
                <span>Total</span>
                <span>LKR {finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
