import React from 'react';
import { districtNames } from '../../data/shippingZones';

const BillingAddressStep = ({ formData, errors, handleChange }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Billing Address</h2>
      <p className="text-gray-600 mb-6">Enter your billing information.</p>
      
      <div className="mb-6">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="sameAsShipping"
            checked={formData.sameAsShipping}
            onChange={handleChange}
            className="form-checkbox h-5 w-5 text-primary rounded"
          />
          <span className="ml-2 text-gray-700">Same as shipping address</span>
        </label>
      </div>
      
      {!formData.sameAsShipping && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* First Name */}
          <div>
            <label className="block text-gray-700 mb-1">First Name *</label>
            <input
              type="text"
              name="billingFirstName"
              value={formData.billingFirstName}
              onChange={handleChange}
              className={`w-full p-2 border ${
                errors.billingFirstName ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.billingFirstName && (
              <p className="text-red-500 text-sm mt-1">{errors.billingFirstName}</p>
            )}
          </div>
          
          {/* Last Name */}
          <div>
            <label className="block text-gray-700 mb-1">Last Name *</label>
            <input
              type="text"
              name="billingLastName"
              value={formData.billingLastName}
              onChange={handleChange}
              className={`w-full p-2 border ${
                errors.billingLastName ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.billingLastName && (
              <p className="text-red-500 text-sm mt-1">{errors.billingLastName}</p>
            )}
          </div>
          
          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-1">Street Address *</label>
            <input
              type="text"
              name="billingAddress"
              value={formData.billingAddress}
              onChange={handleChange}
              className={`w-full p-2 border ${
                errors.billingAddress ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.billingAddress && (
              <p className="text-red-500 text-sm mt-1">{errors.billingAddress}</p>
            )}
          </div>
          
          {/* District */}
          <div>
            <label className="block text-gray-700 mb-1">District *</label>
            <select
              name="billingDistrict"
              value={formData.billingDistrict || ''}
              onChange={handleChange}
              className={`w-full p-2 border ${
                errors.billingDistrict ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white`}
            >
              <option value="" disabled>Select District</option>
              {districtNames.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
            {errors.billingDistrict && (
              <p className="text-red-500 text-sm mt-1">{errors.billingDistrict}</p>
            )}
          </div>
          
          {/* City */}
          <div>
            <label className="block text-gray-700 mb-1">City / Town *</label>
            <input
              type="text"
              name="billingCity"
              value={formData.billingCity}
              onChange={handleChange}
              className={`w-full p-2 border ${
                errors.billingCity ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.billingCity && (
              <p className="text-red-500 text-sm mt-1">{errors.billingCity}</p>
            )}
          </div>
          
          {/* Postal Code */}
          <div>
            <label className="block text-gray-700 mb-1">Postal Code *</label>
            <input
              type="text"
              name="billingPostalCode"
              value={formData.billingPostalCode}
              onChange={handleChange}
              className={`w-full p-2 border ${
                errors.billingPostalCode ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.billingPostalCode && (
              <p className="text-red-500 text-sm mt-1">{errors.billingPostalCode}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingAddressStep;
