import React from 'react';
import { districtNames, getShippingFeeByDistrict } from '../../data/shippingZones';

const ShippingAddressStep = ({ formData, errors, handleChange }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
      <p className="text-gray-600 mb-6">Enter your shipping details below.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label className="block text-gray-700 mb-1">First Name *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full p-2 border ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>
        
        {/* Last Name */}
        <div>
          <label className="block text-gray-700 mb-1">Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full p-2 border ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>
        
        {/* Email */}
        <div>
          <label className="block text-gray-700 mb-1">Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-2 border ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
        
        {/* Phone */}
        <div>
          <label className="block text-gray-700 mb-1">Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full p-2 border ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
            placeholder="e.g. 071 234 5678"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>
        
        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-gray-700 mb-1">Street Address *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`w-full p-2 border ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
          )}
        </div>
        
        {/* District - Dropdown */}
        <div>
          <label className="block text-gray-700 mb-1">District *</label>
          <select
            name="district"
            value={formData.district || ''}
            onChange={handleChange}
            className={`w-full p-2 border ${
              errors.district ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white`}
          >
            <option value="" disabled>Select District</option>
            {districtNames.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          {errors.district && (
            <p className="text-red-500 text-sm mt-1">{errors.district}</p>
          )}
          {formData.district && (
            <p className="text-xs text-blue-600 mt-1">
              Shipping fee for {formData.district}: LKR {getShippingFeeByDistrict(formData.district).toLocaleString()}
            </p>
          )}
        </div>
        
        {/* City */}
        <div>
          <label className="block text-gray-700 mb-1">City *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`w-full p-2 border ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
          )}
        </div>
        
        {/* Postal Code */}
        <div>
          <label className="block text-gray-700 mb-1">Postal Code *</label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            className={`w-full p-2 border ${
              errors.postalCode ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
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
