// Utility functions for data formatting used across the front-end

/**
 * Format a number as currency
 * @param {number|string} value - Number to format
 * @param {string} currency - Currency code (default: LKR)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'LKR') => {
  if (value === null || value === undefined || isNaN(value)) return '0.00';
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0.00';
  
  // Format based on currency
  switch(currency) {
    case 'LKR':
      return 'Rs. ' + numValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    case 'USD':
      return '$' + numValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    case 'EUR':
      return '€' + numValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    default:
      return numValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + ' ' + currency;
  }
};

/**
 * Format a date string to a human-readable format
 * @param {string} dateString - The date string to format
 * @param {boolean} includeTime - Whether to include time in the output
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
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
    return dateString || '';
  }
};

/**
 * Truncate text to a specific length and add ellipsis
 * @param {string} text - The text to truncate
 * @param {number} length - Maximum length before truncation
 * @returns {string} - Truncated text
 */
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  
  return text.substring(0, length) + '...';
};

/**
 * Format a number as percentage
 * @param {number} value - The number to format as percentage (0.1 for 10%)
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0%';
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0%';
  
  // If value is already in percentage form (e.g. 10 instead of 0.1)
  const adjustedValue = numValue > 1 && numValue <= 100 ? numValue : numValue * 100;
  
  return `${adjustedValue.toFixed(decimals)}%`;
};

/**
 * Format a number with thousandth separators
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted number string
 */
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  return numValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Format report value for display with improved handling of types and formats
 * @param {*} value - The value to format
 * @param {string} field - Field identifier
 * @returns {string|React.Element} - Formatted value
 */
export const formatReportValue = (value, field) => {
  if (value === null || value === undefined) return '-';

  // Get field name in lowercase if available
  const fieldName = typeof field === 'string' ? field.toLowerCase() : '';

  // Handle dates
  if (fieldName.includes('date') || fieldName.includes('time')) {
    return formatDate(value);
  }
  
  // Handle monetary values
  if (fieldName.includes('price') || 
      fieldName.includes('amount') || 
      fieldName.includes('revenue') || 
      fieldName.includes('sales') || 
      fieldName.includes('spent') ||
      fieldName.includes('value')) {
    return formatCurrency(value);
  }
  
  // Handle percentages and growth
  if (fieldName.includes('percent') || fieldName.includes('growth') || fieldName.includes('rate')) {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const prefix = numValue >= 0 ? '+' : '';
      return `${prefix}${formatPercentage(value)}`;
    }
  }
  
  // Handle quantities
  if (fieldName.includes('count') || fieldName.includes('quantity') || fieldName.includes('level')) {
    return formatNumber(value);
  }
  
  // Default to string
  return String(value);
};

/**
 * Get column class for table cell based on field name
 * @param {string} field - Field name
 * @returns {string} - CSS class
 */
export const getColumnClass = (field) => {
  if (typeof field !== 'string') return '';
  
  const fieldName = field.toLowerCase();
  
  // Date columns
  if (fieldName.includes('date') || fieldName.includes('time')) {
    return 'text-nowrap';
  }
  
  // Numeric columns right-aligned
  if (fieldName.includes('price') || 
      fieldName.includes('amount') || 
      fieldName.includes('revenue') || 
      fieldName.includes('sales') || 
      fieldName.includes('spent') ||
      fieldName.includes('count') ||
      fieldName.includes('quantity') ||
      fieldName.includes('level') ||
      fieldName.includes('percent') ||
      fieldName.includes('growth') ||
      fieldName.includes('rate') ||
      fieldName.includes('value')) {
    return 'text-end';
  }
  
  return '';
};

/**
 * Get a growth indicator class based on value
 * @param {number} value - The growth value
 * @returns {string} - CSS class for styling growth indicators
 */
export const getGrowthClass = (value) => {
  if (value === null || value === undefined) return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '';
  
  if (numValue > 0) return 'text-success';
  if (numValue < 0) return 'text-danger';
  return 'text-muted';
};
