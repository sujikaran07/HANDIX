import React from 'react';
import { CreditCard, DollarSign, AlertTriangle } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const PaymentStep = ({ formData, errors, handleChange }) => {
  const { total } = useCart();
  const codDisabled = total > 5000;
  
  // If COD was selected but total is over limit, switch to card payment
  React.useEffect(() => {
    if (codDisabled && formData.paymentMethod === 'cod') {
      handleChange({
        target: {
          name: 'paymentMethod',
          value: 'card'
        }
      });
    }
  }, [codDisabled, formData.paymentMethod]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Payment Method</h2>
      
      {/* COD warning for orders over 5000 */}
      {codDisabled && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle size={20} className="text-yellow-500 mr-2 mt-0.5" />
            <p className="text-sm text-yellow-700">
              Cash on Delivery is only available for orders under LKR 5,000.
              Please use online payment for this order.
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <label className={`
          border rounded-lg p-4 cursor-pointer flex items-center
          ${formData.paymentMethod === 'card' ? 'border-primary bg-blue-50' : 'border-gray-300'}
        `}>
          <input
            type="radio"
            name="paymentMethod"
            value="card"
            checked={formData.paymentMethod === 'card'}
            onChange={handleChange}
            className="sr-only"
          />
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-gray-500 mr-3" />
            <div>
              <span className="font-medium">Credit/Debit Card</span>
              <p className="text-sm text-gray-500">Visa, Mastercard, etc.</p>
            </div>
          </div>
        </label>
        
        <label className={`
          border rounded-lg p-4 cursor-pointer flex items-center
          ${formData.paymentMethod === 'cod' ? 'border-primary bg-blue-50' : 'border-gray-300'}
          ${codDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            checked={formData.paymentMethod === 'cod'}
            onChange={handleChange}
            disabled={codDisabled}
            className="sr-only"
          />
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-gray-500 mr-3" />
            <div>
              <span className="font-medium">Cash on Delivery</span>
              <p className="text-sm text-gray-500">Pay when you receive</p>
            </div>
          </div>
        </label>
        
        <label className={`
          border rounded-lg p-4 cursor-pointer flex items-center
          ${formData.paymentMethod === 'paypal' ? 'border-primary bg-blue-50' : 'border-gray-300'}
        `}>
          <input
            type="radio"
            name="paymentMethod"
            value="paypal"
            checked={formData.paymentMethod === 'paypal'}
            onChange={handleChange}
            className="sr-only"
          />
          <div className="flex items-center">
            {/* PayPal SVG logo instead of LogoPaypal component */}
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="#0070BA">
              <path d="M20.067 8.478c.492.315.844.823.844 1.462 0 1.871-1.712 3.513-3.865 3.513h-1.95c-.2 0-.378.12-.437.291l-.668 3.295-.767 3.787c-.059.171-.237.291-.437.291h-2.874c-.15 0-.243-.132-.214-.262.719-3.312 2.144-9.899 2.144-9.899.079-.363.419-.631.814-.631h4.607c.983 0 2.339.273 2.803.153z"></path>
              <path d="M21.563 5.443c0 2.011-1.843 3.704-4.101 3.704h-2.904c-.244 0-.458.146-.53.354l-1.812 8.937c-.075.207-.289.354-.533.354h-1.73c-.244 0-.458.146-.53.354l-1.067 5.272c-.056.169-.229.287-.426.287H3.517c-.151 0-.245-.131-.216-.262.717-3.312 4.42-20.167 4.42-20.167.075-.207.289-.353.533-.353h6.292c2.259 0 4.101 1.693 4.101 3.705v.477c.446.468.916 1.208.916 1.892z" fillRule="evenodd"></path>
            </svg>
            <div>
              <span className="font-medium">PayPal</span>
              <p className="text-sm text-gray-500">Pay with your PayPal account</p>
            </div>
          </div>
        </label>
        
        <label className={`
          border rounded-lg p-4 cursor-pointer flex items-center
          ${formData.paymentMethod === 'gpay' ? 'border-primary bg-blue-50' : 'border-gray-300'}
        `}>
          <input
            type="radio"
            name="paymentMethod"
            value="gpay"
            checked={formData.paymentMethod === 'gpay'}
            onChange={handleChange}
            className="sr-only"
          />
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none">
              <path d="M22.5 12c0-5.799-4.701-10.5-10.5-10.5S1.5 6.201 1.5 12c0 5.799 4.701 10.5 10.5 10.5S22.5 17.799 22.5 12z" fill="#5F6368"/>
              <path d="M12.75 10.811v2.689h4.256c-.167 1.122-1.241 3.294-4.256 3.294-2.568 0-4.662-2.126-4.662-4.745s2.094-4.75 4.662-4.75c1.45 0 2.423.623 2.983 1.16l2.035-1.962c-1.315-1.228-3.016-1.981-5.018-1.981C7.75 4.5 4.5 7.75 4.5 12s3.25 7.5 7.5 7.5c4.33 0 7.207-3.048 7.207-7.331 0-.498-.067-.878-.156-1.262l-7.05.004z" fill="#fff"/>
            </svg>
            <div>
              <span className="font-medium">Google Pay</span>
              <p className="text-sm text-gray-500">Fast checkout with Google</p>
            </div>
          </div>
        </label>
      </div>
      
      {/* Conditional card payment form */}
      {formData.paymentMethod === 'card' && (
        <div className="mt-6 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Card Details</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={handleChange}
                className={`input-field ${errors.cardNumber ? 'border-red-500' : ''}`}
              />
              {errors.cardNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  id="cardExpiry"
                  name="cardExpiry"
                  placeholder="MM/YY"
                  value={formData.cardExpiry}
                  onChange={handleChange}
                  className={`input-field ${errors.cardExpiry ? 'border-red-500' : ''}`}
                />
                {errors.cardExpiry && (
                  <p className="text-red-500 text-sm mt-1">{errors.cardExpiry}</p>
                )}
              </div>
              <div>
                <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700 mb-1">
                  CVC
                </label>
                <input
                  type="text"
                  id="cardCvc"
                  name="cardCvc"
                  placeholder="123"
                  value={formData.cardCvc}
                  onChange={handleChange}
                  className={`input-field ${errors.cardCvc ? 'border-red-500' : ''}`}
                />
                {errors.cardCvc && (
                  <p className="text-red-500 text-sm mt-1">{errors.cardCvc}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStep;
