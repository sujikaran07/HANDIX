import { formatCurrency, formatDate, formatNumber, formatPercentage } from './formatters';

/**
 * Prepares and formats data for time series charts
 * @param {Array} data - Raw report data
 * @param {string} reportType - Type of report
 * @param {string} dateField - Name of date field
 * @param {string} valueField - Name of value field
 * @return {Object} Formatted chart data
 */
export const prepareTimeSeriesData = (data, reportType, dateField = 'order_date', valueField = 'total_amount') => {
  if (!data || data.length === 0) return { labels: [], values: [], formatted: [] };
  
  // Group by date
  const dateMap = {};
  
  data.forEach(item => {
    const date = new Date(item[dateField]);
    if (isNaN(date.getTime())) return;
    
    const dateString = date.toISOString().split('T')[0];
    if (!dateMap[dateString]) {
      dateMap[dateString] = 0;
    }
    
    dateMap[dateString] += parseFloat(item[valueField] || 0);
  });
  
  // Convert to array and sort by date
  const sortedData = Object.entries(dateMap)
    .map(([date, value]) => ({
      date: new Date(date),
      label: formatDate(date),
      value: value
    }))
    .sort((a, b) => a.date - b.date);
  
  // Format for chart display
  return {
    labels: sortedData.map(item => item.label),
    values: sortedData.map(item => item.value),
    formatted: sortedData.map(item => formatCurrency(item.value))
  };
};

/**
 * Prepare data for category distribution charts
 * @param {Array} data - Raw report data
 * @param {string} reportType - Type of report
 * @param {string} categoryField - Name of category field
 * @param {string} valueField - Name of value field
 * @return {Array} Category data ready for visualization
 */
export const prepareCategoryData = (data, reportType, categoryField = 'category_name', valueField = 'total_amount') => {
  if (!data || data.length === 0) return [];
  
  // Group by category
  const categoryMap = {};
  
  data.forEach(item => {
    const category = item[categoryField] || 'Unknown';
    if (!categoryMap[category]) {
      categoryMap[category] = { value: 0, count: 0 };
    }
    
    categoryMap[category].value += parseFloat(item[valueField] || 0);
    categoryMap[category].count++;
  });
  
  // Convert to array format
  const categoryData = Object.entries(categoryMap)
    .map(([category, data]) => ({
      category,
      value: data.value,
      count: data.count,
      formattedValue: formatCurrency(data.value),
      formattedCount: formatNumber(data.count)
    }))
    .sort((a, b) => b.value - a.value);
  
  // Calculate percentages
  const total = categoryData.reduce((sum, item) => sum + item.value, 0);
  
  return categoryData.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0,
    formattedPercentage: formatPercentage((item.value / total) * 100)
  }));
};

/**
 * Get colors for visualization based on index
 * @param {number} index - Index of item
 * @return {string} CSS color value
 */
export const getVisualizationColor = (index) => {
  const colors = [
    '#FF4747', // Primary red
    '#FF6A00', // Orange
    '#20C997', // Teal
    '#0D6EFD', // Blue
    '#FFC107', // Yellow
    '#6F42C1', // Purple
    '#20c9c9', // Cyan
    '#fd7e14', // Dark orange
    '#0dcaf0', // Light blue
    '#198754'  // Green
  ];
  
  return colors[index % colors.length];
};

/**
 * Format table cell values based on column type
 * @param {any} value - The cell value
 * @param {string} column - Column name/ID
 * @return {string|JSX} Formatted cell content
 */
export const formatTableCell = (value, column) => {
  if (value === null || value === undefined) return '-';
  
  const colName = column.toLowerCase();
  
  // Handle dates
  if (colName.includes('date') || colName.includes('time')) {
    return formatDate(value);
  }
  
  // Handle monetary values
  if (colName.includes('price') || 
      colName.includes('amount') || 
      colName.includes('sales') || 
      colName.includes('revenue') || 
      colName.includes('value') || 
      colName.includes('spent')) {
    return formatCurrency(value);
  }
  
  // Handle percentages
  if (colName.includes('percent') || colName.includes('growth') || colName.includes('rate')) {
    return formatPercentage(value);
  }
  
  // Handle quantities
  if (colName.includes('count') || colName.includes('quantity') || colName.includes('number')) {
    return formatNumber(value);
  }
  
  // Return as string for everything else
  return String(value);
};

/**
 * Get summary metrics description
 * @param {string} key - Metric key
 * @return {string} Description of the metric
 */
export const getMetricDescription = (key) => {
  const descriptions = {
    totalSales: 'Total monetary value of all sales in the selected period.',
    orderCount: 'Number of orders placed during the selected period.',
    averageOrderValue: 'Average monetary value per order.',
    uniqueCustomers: 'Count of distinct customers who made purchases.',
    totalQuantity: 'Total number of products sold across all orders.',
    uniqueProducts: 'Count of distinct products sold during this period.',
    totalProducts: 'Total number of products in inventory.',
    productsOutOfStock: 'Number of products that are currently out of stock.',
    productsLowStock: 'Number of products with low inventory levels.',
    totalCustomers: 'Total customer count in the system.',
    newCustomers: 'Customers who registered during this period.',
    returningCustomers: 'Customers who made repeat purchases.',
    totalArtisans: 'Total number of artisans in the system.',
    activeArtisans: 'Artisans who had sales during this period.',
    topPerformer: 'Artisan with the highest sales value.'
  };
  
  return descriptions[key] || 'No description available.';
};

export default {
  prepareTimeSeriesData,
  prepareCategoryData,
  getVisualizationColor,
  formatTableCell,
  getMetricDescription
};
