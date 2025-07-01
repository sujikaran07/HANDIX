import React from 'react';
import { CreditCard, Truck } from 'lucide-react';

const PaymentMethodSelector = ({ 
  selectedMethod, 
  onMethodChange 
}) => {
  return (
    <div className="space-y-3 w-full">
      {/* Credit/Debit Card payment option */}
      <label className={`
        block border rounded-md p-4 cursor-pointer transition
        ${selectedMethod === 'card' 
          ? 'border-primary bg-blue-50' 
          : 'border-gray-300 hover:border-primary'
        }
      `}>
        <div className="flex items-center">
          <input
            type="radio"
            name="paymentMethod"
            value="card"
            checked={selectedMethod === 'card'}
            onChange={() => onMethodChange('card')}
            className="mr-3 accent-primary"
          />
          <div className="flex items-center mr-3">
            {/* Card SVG icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
              <rect x="2" y="6" width="20" height="12" rx="2" fill="#E5E7EB" />
              <rect x="2" y="10" width="20" height="2" fill="#A3A3A3" />
              <rect x="6" y="14" width="4" height="2" fill="#A3A3A3" />
            </svg>
          </div>
          <span>Credit/Debit Card</span>
        </div>
      </label>
      
      {/* Cash On Delivery payment option */}
      <label className={`
        block border rounded-md p-4 cursor-pointer transition
        ${selectedMethod === 'cod' 
          ? 'border-primary bg-blue-50' 
          : 'border-gray-300 hover:border-primary'
        }
      `}>
        <div className="flex items-center">
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            checked={selectedMethod === 'cod'}
            onChange={() => onMethodChange('cod')}
            className="mr-3 accent-primary"
          />
          <div className="flex items-center mr-3">
            {/* Cash SVG icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
              <rect x="2" y="6" width="20" height="12" rx="2" fill="#E5E7EB" />
              <rect x="2" y="10" width="20" height="2" fill="#A3A3A3" />
              <rect x="6" y="14" width="4" height="2" fill="#A3A3A3" />
            </svg>
          </div>
          <span>Cash On Delivery</span>
        </div>
      </label>
    </div>
  );
};

export default PaymentMethodSelector;
