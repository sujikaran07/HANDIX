import React from 'react';
import { getShippingFeeByDistrict } from '../../data/shippingZones';

const ShippingMethodStep = ({ formData, errors, handleChange }) => {
  const districtShippingFee = formData.district ? getShippingFeeByDistrict(formData.district) : null;
  
  const pickupLocations = [
    { id: 'mullaitivu-store', name: 'Mullaitivu Branch', address: '15 Main Street, Mullaitivu' },
    { id: 'kilinochchi-store', name: 'Kilinochchi Branch', address: '27 KKS Road, Kilinochchi' }
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Shipping Method</h2>
      <p className="text-gray-600 mb-6">Choose how you want to receive your order.</p>
      
      <div className="space-y-6">
        {/* Home Delivery Option */}
        <div>
          <label className="flex items-center cursor-pointer mb-4">
            <input
              type="radio"
              name="shippingMethod"
              value="delivery"
              checked={formData.shippingMethod === 'delivery'}
              onChange={handleChange}
              className="form-radio h-5 w-5 text-primary"
            />
            <span className="ml-2 text-lg font-medium">Home Delivery</span>
          </label>
          
          <div className={`ml-7 ${formData.shippingMethod === 'delivery' ? 'block' : 'hidden'}`}>
            <div className="bg-blue-50 p-4 rounded-md">
              {formData.district ? (
                <div>
                  <p className="font-medium mb-1">Shipping to {formData.district}</p>
                  <p className="text-sm text-gray-600">
                    Shipping Fee: <span className="font-medium">LKR {districtShippingFee.toLocaleString()}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Estimated delivery: 2-4 business days
                  </p>
                </div>
              ) : (
                <p className="text-sm text-amber-600">
                  Please select a district in the shipping address step to see the exact shipping fee.
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Store Pickup Option */}
        <div>
          <label className="flex items-center cursor-pointer mb-4">
            <input
              type="radio"
              name="shippingMethod"
              value="pickup"
              checked={formData.shippingMethod === 'pickup'}
              onChange={handleChange}
              className="form-radio h-5 w-5 text-primary"
            />
            <span className="ml-2 text-lg font-medium">Store Pickup <span className="text-green-600 font-normal">(Free)</span></span>
          </label>
          
          <div className={`ml-7 ${formData.shippingMethod === 'pickup' ? 'block' : 'hidden'}`}>
            <div className="space-y-3">
              {pickupLocations.map(location => (
                <div key={location.id} className="border rounded-md p-3">
                  <label className="flex cursor-pointer">
                    <input
                      type="radio"
                      name="pickupLocation"
                      value={location.id}
                      checked={formData.pickupLocation === location.id}
                      onChange={handleChange}
                      className="form-radio h-5 w-5 text-primary mt-1"
                    />
                    <div className="ml-2">
                      <p className="font-medium">{location.name}</p>
                      <p className="text-sm text-gray-600">{location.address}</p>
                    </div>
                  </label>
                </div>
              ))}
            </div>
            {errors.pickupLocation && (
              <p className="text-red-500 text-sm mt-2">{errors.pickupLocation}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingMethodStep;
