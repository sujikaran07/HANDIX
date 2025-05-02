import React from 'react';
import { CreditCard, Truck } from 'lucide-react';

const PaymentMethodSelector = ({ 
  selectedMethod, 
  onMethodChange 
}) => {
  return (
    <div className="space-y-3 w-full">
      {/* Credit Card Option */}
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
            <CreditCard size={20} className="text-primary" />
          </div>
          <span>Credit / Debit Card</span>
        </div>
      </label>
      
      {/* Cash On Delivery Option */}
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
            <Truck size={20} className="text-primary" />
          </div>
          <span>Cash On Delivery</span>
        </div>
      </label>

      {/* PayPal Option */}
      <label className={`
        block border rounded-md p-4 cursor-pointer transition
        ${selectedMethod === 'paypal' 
          ? 'border-primary bg-blue-50' 
          : 'border-gray-300 hover:border-primary'
        }
      `}>
        <div className="flex items-center">
          <input
            type="radio"
            name="paymentMethod"
            value="paypal"
            checked={selectedMethod === 'paypal'}
            onChange={() => onMethodChange('paypal')}
            className="mr-3 accent-primary"
          />
          <div className="flex items-center mr-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
              <path d="M19.0748 7.84232C19.1488 7.42001 19.0748 7.12001 18.8528 6.82001C18.6308 6.44001 18.1868 6.29001 17.6688 6.29001H14.3028C14.1548 6.29001 14.0068 6.44001 13.9328 6.59001L11.9348 15.08C11.9348 15.23 11.9348 15.31 12.0088 15.38C12.0828 15.46 12.1568 15.46 12.3048 15.46H13.9328C14.0808 15.46 14.2288 15.38 14.2288 15.23V15.16L14.6728 12.88V12.95C14.6728 12.8 14.8208 12.65 15.0428 12.65H15.7088C17.7068 12.65 19.1858 11.96 19.6298 9.68C19.8518 8.69 19.7038 7.99 19.0748 7.54V7.84232Z" fill="currentColor"/>
              <path d="M9.49 6.29001C9.342 6.29001 9.194 6.44001 9.12 6.59001L7.122 15.08C7.122 15.23 7.122 15.31 7.196 15.38C7.27 15.46 7.344 15.46 7.492 15.46H9.194C9.342 15.46 9.49 15.31 9.564 15.16L11.562 6.67001C11.562 6.52001 11.562 6.44001 11.488 6.37001C11.414 6.29001 11.34 6.29001 11.192 6.29001H9.49Z" fill="currentColor"/>
            </svg>
          </div>
          <span>PayPal</span>
        </div>
      </label>

      {/* Google Pay Option */}
      <label className={`
        block border rounded-md p-4 cursor-pointer transition
        ${selectedMethod === 'gpay' 
          ? 'border-primary bg-blue-50' 
          : 'border-gray-300 hover:border-primary'
        }
      `}>
        <div className="flex items-center">
          <input
            type="radio"
            name="paymentMethod"
            value="gpay"
            checked={selectedMethod === 'gpay'}
            onChange={() => onMethodChange('gpay')}
            className="mr-3 accent-primary"
          />
          <div className="flex items-center mr-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-800">
              <path d="M21 11.2C21 10.7 20.9 10.2 20.9 9.8H12V12.5H17.2C17 13.5 16.3 14.4 15.2 15V17.1H17.9C19.7 15.4 21 13.5 21 11.2Z" fill="#4285F4"/>
              <path d="M12 21C14.3 21 16.2 20.2 17.9 17.9L15.2 16C14.3 16.6 13.2 17 12 17C9.5 17 7.3 15.3 6.5 13H3.7V15.1C5.4 18.6 8.5 21 12 21Z" fill="#34A853"/>
              <path d="M6.5 11C6.3 10.5 6.1 9.8 6.1 9.2C6.1 8.6 6.3 7.9 6.5 7.4V5.3H3.7C3 6.5 2.5 8.1 2.5 9.8C2.5 11.5 3 12.9 3.7 14.1L6.5 11Z" fill="#FBBC05"/>
              <path d="M12 5.4C13.4 5.4 14.6 5.9 15.5 6.8L18 4.3C16.2 2.6 14.3 1.8 12 1.8C8.5 1.8 5.4 4.2 3.7 7.7L6.5 9.8C7.3 7.5 9.5 5.4 12 5.4Z" fill="#EA4335"/>
            </svg>
          </div>
          <span>Google Pay</span>
        </div>
      </label>
    </div>
  );
};

export default PaymentMethodSelector;
