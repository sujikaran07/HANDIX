import React from 'react';
import { FaRegCreditCard, FaRegMoneyBillAlt, FaExclamationTriangle } from 'react-icons/fa';
import { useCart } from '../../contexts/CartContext';

// Format card number as XXXX XXXX XXXX XXXX
const formatCardNumber = (value) => {
  return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
};

// Format expiry as MM/YY
const formatExpiry = (value) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 2) return cleaned;
  return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
};

const PaymentStep = ({ formData, errors, handleChange, user }) => {
  const { total } = useCart();
  // Check if user is business or personal
  const isBusinessAccount = user && (user.accountType === 'Business' || user.accountType === 'business');
  // Disable COD for personal accounts over 2,000 LKR
  const codDisabled = !isBusinessAccount && total > 2000;

  // Auto-switch to card if COD is not allowed
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

  // Format card number on change
  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    handleChange({
      target: {
        name: 'cardNumber',
        value: formatted
      }
    });
  };

  // Format expiry and prevent invalid input
  const handleCardExpiryChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, '');
    let prev = formData.cardExpiry || '';
    if (value.length > 4) value = value.slice(0, 4);
    let month = value.slice(0, 2);
    let year = value.slice(2, 4);
    if (month.length === 2 && (parseInt(month, 10) < 1 || parseInt(month, 10) > 12)) {
      return;
    }
    if (year.length === 2 && parseInt(year, 10) > 40) {
      return;
    }
    let formatted = month;
    if (year.length) {
      formatted += '/' + year;
    }
    handleChange({
      target: {
        name: 'cardExpiry',
        value: formatted
      }
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Payment Method</h2>

      {/* Show COD warning for personal accounts over 2,000 LKR */}
      {!isBusinessAccount && codDisabled && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 flex items-center">
          <FaExclamationTriangle className="text-yellow-500 mr-3" size={20} />
          <span className="text-sm text-yellow-700">
            Cash on Delivery is only available for orders under LKR 2,000. Please use card payment for this order.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Card payment option */}
        <label className={`
          border rounded-lg p-4 cursor-pointer flex items-center transition
          ${formData.paymentMethod === 'card' ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'}
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
            <FaRegCreditCard className="h-6 w-6 text-gray-600 mr-3" />
            <div>
              <span className="font-medium">Credit/Debit Card</span>
              <p className="text-xs text-gray-500">Visa, Mastercard, etc.</p>
            </div>
          </div>
        </label>

        {/* COD payment option */}
        <label className={`
          border rounded-lg p-4 cursor-pointer flex items-center transition
          ${formData.paymentMethod === 'cod' ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'}
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
            <FaRegMoneyBillAlt className="h-6 w-6 text-gray-600 mr-3" />
            <div>
              <span className="font-medium">Cash on Delivery</span>
              <p className="text-xs text-gray-500">Pay when you receive</p>
            </div>
          </div>
        </label>
      </div>

      {/* Card payment form fields */}
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
                onChange={handleCardNumberChange}
                inputMode="numeric"
                pattern="(?:\\d{4} ?){4}"
                maxLength={19}
                className={`input-field ${errors.cardNumber ? 'border-red-500' : ''}`}
                autoComplete="cc-number"
              />
              <p className="text-xs text-gray-400 mt-1">16 digits, numbers only</p>
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
                  onChange={handleCardExpiryChange}
                  inputMode="numeric"
                  pattern="(0[1-9]|1[0-2])/(\\d{2})"
                  maxLength={5}
                  className={`input-field ${errors.cardExpiry ? 'border-red-500' : ''}`}
                  autoComplete="cc-exp"
                />
                <p className="text-xs text-gray-400 mt-1">Format: MM/YY</p>
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
                  inputMode="numeric"
                  pattern="\d{3}"
                  maxLength={3}
                  className={`input-field ${errors.cardCvc ? 'border-red-500' : ''}`}
                  autoComplete="cc-csc"
                />
                <p className="text-xs text-gray-400 mt-1">3 digits</p>
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
