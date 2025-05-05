import React from 'react';
import { sriLankaDistricts } from '../../data/shippingZones';

const BillingAddressStep = ({ formData, errors, handleChange }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Billing Address</h2>
      
      <div className="mb-6">
        <div className="form-group">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="sameAsShipping"
              checked={formData.sameAsShipping}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <span className="ml-2 text-base">Same as shipping address</span>
          </label>
        </div>
      </div>
      
      {!formData.sameAsShipping && (
        <div className="space-y-6">
          {/* Address */}
          <div className="form-group">
            <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              id="billingAddress"
              name="billingAddress"
              type="text"
              value={formData.billingAddress}
              onChange={handleChange}
              placeholder="123 Main St, Apartment 4B"
              className={`w-full px-4 py-2.5 rounded-md border ${errors.billingAddress ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} focus:outline-none focus:ring-2`}
            />
            {errors.billingAddress && <p className="text-red-500 text-sm mt-1">{errors.billingAddress}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* City */}
            <div className="form-group md:col-span-1">
              <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                id="billingCity"
                name="billingCity"
                type="text"
                value={formData.billingCity}
                onChange={handleChange}
                placeholder="City name"
                className={`w-full px-4 py-2.5 rounded-md border ${errors.billingCity ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} focus:outline-none focus:ring-2`}
              />
              {errors.billingCity && <p className="text-red-500 text-sm mt-1">{errors.billingCity}</p>}
            </div>
            
            {/* District */}
            <div className="form-group md:col-span-1">
              <label htmlFor="billingDistrict" className="block text-sm font-medium text-gray-700 mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <select
                id="billingDistrict"
                name="billingDistrict"
                value={formData.billingDistrict}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-md border bg-white ${errors.billingDistrict ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} focus:outline-none focus:ring-2`}
              >
                <option value="">Select district</option>
                {sriLankaDistricts.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
              {errors.billingDistrict && <p className="text-red-500 text-sm mt-1">{errors.billingDistrict}</p>}
            </div>
            
            {/* Postal Code */}
            <div className="form-group md:col-span-1">
              <label htmlFor="billingPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                id="billingPostalCode"
                name="billingPostalCode"
                type="text"
                value={formData.billingPostalCode}
                onChange={handleChange}
                placeholder="10100"
                className={`w-full px-4 py-2.5 rounded-md border ${errors.billingPostalCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} focus:outline-none focus:ring-2`}
              />
              {errors.billingPostalCode && <p className="text-red-500 text-sm mt-1">{errors.billingPostalCode}</p>}
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <p className="text-sm text-gray-500">
          Your billing address is used for verification purposes and should match the address associated with your payment method.
          All fields marked with <span className="text-red-500">*</span> are required.
        </p>
      </div>
    </div>
  );
};

export default BillingAddressStep;
