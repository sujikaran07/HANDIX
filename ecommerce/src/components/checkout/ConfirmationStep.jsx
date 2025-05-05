import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

const ConfirmationStep = ({ orderId, email }) => {
  return (
    <div className="text-center py-6">
      <div className="flex justify-center mb-6">
        <CheckCircle size={64} className="text-green-500" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Thank You for Your Order!</h2>
      <p className="text-gray-600 mb-6">
        Your order has been placed successfully. We've sent a confirmation to <strong>{email}</strong>.
      </p>
      
      <div className="bg-gray-50 p-6 rounded-lg mb-8 inline-block mx-auto text-left">
        <h3 className="font-bold text-lg mb-3">Order Details</h3>
        <p><strong>Order Number:</strong> {orderId}</p>
        <p className="mt-1"><strong>Status:</strong> <span className="text-blue-600">Processing</span></p>
        <p className="mt-1"><strong>Estimated Delivery:</strong> 3-5 business days</p>
        <p className="mt-4 text-sm text-gray-600">
          You will receive updates about your order via email.
        </p>
      </div>
    
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link to="/products" className="btn-outline flex items-center justify-center gap-2">
          Continue Shopping
          <ArrowRight size={16} />
        </Link>
        <Link to="/account/orders" className="btn-primary flex items-center justify-center gap-2">
          Track Order
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default ConfirmationStep;
