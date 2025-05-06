import React from 'react';
import { sriLankaDistricts } from '../../data/shippingZones';

const ShippingAddressStep = ({ formData, errors, handleChange }) => {
  // If shipping address is already loaded, show a helpful message
  const hasExistingAddress = formData.address && formData.city && formData.district && formData.postalCode;
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">Shipping Address</h2>
        <p className="text-gray-600">Enter your shipping information</p>
        
        {hasExistingAddress && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <p className="text-blue-700 text-sm">
              <span className="font-medium">Note:</span> We've pre-filled your shipping details with your most recent address. 
              You can update it if needed.
            </p>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="123 Main St"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="City"
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District
            </label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.district ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a district</option>
              {sriLankaDistricts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            {errors.district && (
              <p className="text-red-500 text-sm mt-1">{errors.district}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code
          </label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.postalCode ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Postal Code"
          />
          {errors.postalCode && (
            <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShippingAddressStep;
