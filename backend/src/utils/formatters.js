/**
 * Format a number as currency (LKR)
 * @param {number} value - The number to format
 * @returns {string} - Formatted currency string
 */
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'Rs 0.00';
  }
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if it's a valid number
  if (isNaN(numValue)) {
    return 'Rs 0.00';
  }
  
  // Format with Rs prefix and thousands separators
  return `Rs ${numValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Format a date string to a human-readable format
 * @param {string|Date} dateString - The date to format
 * @param {boolean} includeTime - Whether to include time in the output
 * @returns {string} - Formatted date string
 */
const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return '';
  
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    
    if (isNaN(date.getTime())) return '';
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      ...(includeTime && { hour: '2-digit', minute: '2-digit' })
    };
    
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(dateString) || '';
  }
};

/**
 * Format a number with appropriate separators
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted number
 */
const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if it's a valid number
  if (isNaN(numValue)) {
    return '0';
  }
  
  return numValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

module.exports = { formatCurrency, formatDate, formatNumber };
