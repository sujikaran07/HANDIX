import React from 'react';
import { sriLankaDistricts } from '../../data/shippingZones';

const ShippingAddressStep = ({ formData, errors, handleChange }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Enter your shipping address</h2>
      
      <div className="space-y-6">
        {/* Phone */}
        <div className="form-group">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone number <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+94 XX XXX XXXX"
            className={`w-full px-4 py-2.5 rounded-md border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} focus:outline-none focus:ring-2`}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>
        
        {/* Address */}
        <div className="form-group">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Street Address <span className="text-red-500">*</span>
          </label>
          <input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            placeholder="123 Main St, Apartment 4B"
            className={`w-full px-4 py-2.5 rounded-md border ${errors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} focus:outline-none focus:ring-2`}
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* City */}
          <div className="form-group md:col-span-1">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              placeholder="City name"
              className={`w-full px-4 py-2.5 rounded-md border ${errors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} focus:outline-none focus:ring-2`}
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>
          
          {/* District */}
          <div className="form-group md:col-span-1">
            <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
              District <span className="text-red-500">*</span>
            </label>
            <select
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-md border bg-white ${errors.district ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} focus:outline-none focus:ring-2`}
            >
              <option value="">Select district</option>
              {sriLankaDistricts.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
            {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
          </div>
          
          {/* Postal Code */}
          <div className="form-group md:col-span-1">
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="10100"
              className={`w-full px-4 py-2.5 rounded-md border ${errors.postalCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'} focus:outline-none focus:ring-2`}
            />
            {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
          </div>
        </div>

        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Please ensure your shipping address is accurate to avoid delivery issues.
            All fields marked with <span className="text-red-500">*</span> are required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShippingAddressStep;
