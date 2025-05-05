import React from 'react';
import { CreditCard, Banknote } from 'lucide-react';

const PaymentStep = ({ formData, errors, handleChange }) => {
  // Payment method options with actual icons
  const paymentMethods = [
    { 
      id: 'card', 
      name: 'Credit/Debit Card', 
      icon: <CreditCard className="text-blue-600" size={22} />,
      description: 'Pay securely with your credit or debit card',
      iconClass: ''
    },
    { 
      id: 'cod', 
      name: 'Cash on Delivery', 
      icon: <Banknote className="text-green-600" size={22} />,
      description: 'Pay when you receive your order',
      iconClass: ''
    },
    { 
      id: 'paypal', 
      icon: <img src="https://www.paypalobjects.com/digitalassets/c/website/logo/full-text/pp_fc_hl.svg" 
                alt="PayPal" className="h-6 object-contain" />,
      iconClass: ''
    },
    { 
      id: 'gpay',  
      icon: <img src="https://www.gstatic.com/instantbuy/svg/light_gpay.svg" 
                alt="Google Pay" className="h-6 object-contain" />,
      iconClass: ''
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Payment Method</h2>
      <p className="text-gray-600 mb-6">Choose how you would like to pay for your order.</p>
      
      <div className="space-y-4">
        {paymentMethods.map(method => (
          <div
            key={method.id}
            className={`border rounded-lg p-4 cursor-pointer ${
              formData.paymentMethod === method.id 
                ? 'border-primary bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => handleChange({ target: { name: 'paymentMethod', value: method.id } })}
          >
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                formData.paymentMethod === method.id ? 'border-primary' : 'border-gray-400'
              }`}>
                {formData.paymentMethod === method.id && (
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                )}
              </div>
              <div className="ml-3 flex items-center">
                <div className={`mr-2 flex items-center justify-center ${method.iconClass}`}>
                  {method.icon}
                </div>
                <div>
                  <span className="font-medium">{method.name}</span>
                  <p className="text-sm text-gray-500">{method.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Card payment form */}
      {formData.paymentMethod === 'card' && (
        <div className="mt-6 border-t pt-6">
          <h3 className="font-medium mb-4">Enter card details</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Card Number *</label>
              <div className="relative">
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  className={`w-full p-2 pl-10 border ${
                    errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex">
                  <CreditCard size={16} className="text-gray-400" />
                </div>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-5 w-7 object-contain" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-5 w-7 object-contain" />
                </div>
              </div>
              {errors.cardNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Expiry Date *</label>
                <input
                  type="text"
                  name="cardExpiry"
                  value={formData.cardExpiry}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  className={`w-full p-2 border ${
                    errors.cardExpiry ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                />
                {errors.cardExpiry && (
                  <p className="text-red-500 text-sm mt-1">{errors.cardExpiry}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">CVC *</label>
                <input
                  type="text"
                  name="cardCvc"
                  value={formData.cardCvc}
                  onChange={handleChange}
                  placeholder="123"
                  className={`w-full p-2 border ${
                    errors.cardCvc ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                />
                {errors.cardCvc && (
                  <p className="text-red-500 text-sm mt-1">{errors.cardCvc}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center mt-4 bg-blue-50 p-3 rounded-lg">
            <svg className="h-4 w-4 text-blue-600 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm text-gray-700">
              Your payment information is encrypted and secure.
            </p>
          </div>
        </div>
      )}
      
      {/* Cash on Delivery Notice */}
      {formData.paymentMethod === 'cod' && (
        <div className="mt-6 border-t pt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium flex items-center">
              <Banknote size={18} className="text-green-600 mr-2" />
              Cash on Delivery Information
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              You will pay for your order when it is delivered to your shipping address. 
              Please ensure that you have the exact amount ready for our delivery person.
            </p>
          </div>
        </div>
      )}
      
      {/* PayPal Notice */}
      {formData.paymentMethod === 'paypal' && (
        <div className="mt-6 border-t pt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium flex items-center">
              <img src="https://www.paypalobjects.com/digitalassets/c/website/logo/full-text/pp_fc_hl.svg" 
                alt="PayPal" className="h-5 mr-2 object-contain" />
              PayPal Information
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              After confirming your order, you will be redirected to PayPal to complete your payment securely.
            </p>
          </div>
        </div>
      )}
      
      {/* Google Pay Notice */}
      {formData.paymentMethod === 'gpay' && (
        <div className="mt-6 border-t pt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium flex items-center">
              <img src="https://www.gstatic.com/instantbuy/svg/light_gpay.svg" 
                  alt="Google Pay" className="h-5 mr-2 object-contain" />
              Google Pay Information
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              After confirming your order, you will be redirected to Google Pay to complete your payment securely.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStep;
