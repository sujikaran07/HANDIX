/**
 * Report Chart Utility Functions
 * This module provides helper functions for generating appropriate charts
 * based on different report types.
 */

// Add color schemes for different report types
const reportColorSchemes = {
  sales: {
    primary: '#0d6efd', // Blue
    secondary: '#6610f2', // Indigo
    accent: '#0dcaf0', // Cyan
    gradient: ['#0d6efd', '#6610f2'],
    palette: ['#0d6efd', '#6610f2', '#0dcaf0', '#6f42c1', '#0d6efd80', '#6610f280']
  },
  products: {
    primary: '#198754', // Green
    secondary: '#20c997', // Teal
    accent: '#75b798', // Light green
    gradient: ['#198754', '#20c997'],
    palette: ['#198754', '#20c997', '#75b798', '#28a745', '#19875480', '#20c99780']
  },
  customers: {
    primary: '#0dcaf0', // Cyan
    secondary: '#0d6efd', // Blue
    accent: '#6edff6', // Light cyan
    gradient: ['#0dcaf0', '#0d6efd'],
    palette: ['#0dcaf0', '#0d6efd', '#6edff6', '#17a2b8', '#0dcaf080', '#0d6efd80']
  },
  artisans: {
    primary: '#fd7e14', // Orange
    secondary: '#ffc107', // Yellow
    accent: '#ffda6a', // Light yellow
    gradient: ['#fd7e14', '#ffc107'],
    palette: ['#fd7e14', '#ffc107', '#ffda6a', '#e67e22', '#fd7e1480', '#ffc10780']
  }
};

// Helper function to get colors for a specific report type
export const getReportColors = (reportType) => {
  return reportColorSchemes[reportType] || reportColorSchemes.sales; // Default to sales colors
};

/**
 * Determines which charts should be displayed for a specific report type
 * @param {string} reportType - The type of report (sales, products, customers, artisans)
 * @param {Object} reportData - The report data object
 * @returns {Object} Configuration object with flags for which charts to show
 */
export const getChartConfig = (reportType, reportData) => {
  if (!reportData || !reportData.data || reportData.data.length === 0) {
    return {
      showBarChart: false,
      showPieChart: false,
      showLineChart: false,
      showAreaChart: false,
      showTables: true,
      showSummary: true,
      dashboardCharts: [] // No charts for dashboard
    };
  }

  switch (reportType) {
    case 'sales':
      return {
        showBarChart: true, // Top products by sales
        showPieChart: true, // Sales distribution by category
        showLineChart: true, // Sales trend over time
        showAreaChart: false,
        showTables: true,
        showSummary: true,
        barChartTitle: 'Top Products by Sales',
        pieChartTitle: 'Sales by Category',
        lineChartTitle: 'Sales Trend',
        // For sales, line chart and bar chart are most important for dashboard
        dashboardCharts: ['lineChart', 'barChart']
      };
    
    case 'products':
      return {
        showBarChart: true, // Top products by units sold
        showPieChart: true, // Product distribution by category
        showLineChart: false,
        showAreaChart: false,
        showTables: true,
        showSummary: true,
        barChartTitle: 'Top Products by Units Sold',
        pieChartTitle: 'Products by Category',
        // For products, show both available charts
        dashboardCharts: ['barChart', 'pieChart']
      };
    
    case 'customers':
      return {
        showBarChart: true, // Top customers by order count
        showPieChart: false,
        showLineChart: true, // Customer activity over time
        showAreaChart: false,
        showTables: true,
        showSummary: true,
        barChartTitle: 'Top Customers by Orders',
        lineChartTitle: 'New Customers Trend',
        // For customers, show both available charts
        dashboardCharts: ['barChart', 'lineChart']
      };
    
    case 'artisans':
      return {
        showBarChart: true, // Top artisans by sales
        showPieChart: true, // Artisan contribution to total sales
        showLineChart: false,
        showAreaChart: false,
        showTables: true,
        showSummary: true,
        barChartTitle: 'Top Artisans by Sales',
        pieChartTitle: 'Artisan Sales Distribution',
        // For artisans, show both available charts
        dashboardCharts: ['barChart', 'pieChart']
      };
    
    default:
      return {
        showBarChart: false,
        showPieChart: false,
        showLineChart: false,
        showAreaChart: false,
        showTables: true,
        showSummary: true,
        dashboardCharts: []
      };
  }
};

/**
 * Gets chart configuration for artisan reports with specific handling for order reports
 * @param {string} reportType - The type of report
 * @param {object} reportData - The report data
 * @returns {object} Chart configuration
 */
export const getArtisanChartConfig = (reportType, reportData) => {
  let config = {
    showBarChart: true,
    showPieChart: true,
    showLineChart: true,
    showTables: true,
    showSummary: true,
    dashboardCharts: ['barChart', 'pieChart', 'lineChart']
  };

  switch (reportType) {
    case 'orders':
      config.barChartTitle = 'Top Products by Sales Value';
      config.pieChartTitle = 'Orders by Status';
      config.lineChartTitle = 'Monthly Order Trend';
      
      // For order reports, prioritize what's shown in dashboard
      if (reportData && reportData.charts) {
        config.dashboardCharts = ['pieChart', 'barChart']; // Show status distribution and product distribution
      }
      break;
    case 'products':
      config.barChartTitle = 'Top Products by Units Sold';
      config.pieChartTitle = 'Products by Category';
      config.lineChartTitle = 'Sales Trend';
      break;
    case 'performance':
      config.barChartTitle = 'Performance by Period';
      config.pieChartTitle = 'Delivery Performance';
      config.lineChartTitle = 'Rating Trend';
      break;
    case 'assignments':
      config.barChartTitle = 'Orders by Status';
      config.pieChartTitle = 'Order Status Distribution';
      config.lineChartTitle = 'Upcoming Deadlines';
      break;
    case 'inventory':
      config.barChartTitle = 'Stock Levels';
      config.pieChartTitle = 'Products by Category';
      config.lineChartTitle = 'Product Sales History';
      config.dashboardCharts = ['barChart', 'pieChart'];
      break;
    case 'custom-performance':
      config.barChartTitle = 'Top Customized Products';
      config.pieChartTitle = 'Custom Order Distribution';
      config.lineChartTitle = 'Custom Orders Trend';
      break;
    default:
      break;
  }

  // Check if we have enough data for charts
  if (reportData && reportData.data && reportData.data.length < 2) {
    config.dashboardCharts = [];
  }

  return config;
};

/**
 * Prepares data for a bar chart based on report type
 * @param {string} reportType - The type of report
 * @param {Array} data - The report data
 * @param {boolean} isArtisan - Whether this is for artisan view
 * @returns {Object} Formatted data for bar chart
 */
export const prepareBarChartData = (reportType, data, isArtisan = false) => {
  if (!data || data.length === 0) return { labels: [], values: [], isCurrency: false };
  
  let labels = [];
  let values = [];
  let isCurrency = false;
  let lowStockCount = 0; // Add counter for low stock products
  const colors = getReportColors(reportType).palette; // Get color palette for this report type
  
  // Special handling for artisan order reports
  if (isArtisan && reportType === 'orders' && data.charts && data.charts.productDistribution) {
    const productData = data.charts.productDistribution;
    return {
      labels: productData.map(item => item.label),
      values: productData.map(item => item.value),
      title: 'Top Products by Sales Value',
      isCurrency: true
    };
  }

  switch (reportType) {
    case 'sales':
      // Group by product_name and sum total_amount
      const salesByProduct = {};
      data.forEach(item => {
        if (item.product_name) {
          if (!salesByProduct[item.product_name]) {
            salesByProduct[item.product_name] = 0;
          }
          salesByProduct[item.product_name] += parseFloat(item.total_amount || 0);
        }
      });
      
      // Sort by sales amount and take top 6
      const sortedProducts = Object.entries(salesByProduct)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
        
      labels = sortedProducts.map(([name]) => name);
      values = sortedProducts.map(([_, value]) => value);
      isCurrency = true; // This indicates values are monetary
      break;
    
    case 'products':
      // Sort products by quantity sold and take top 6
      const sortedByQuantity = [...data]
        .sort((a, b) => b.total_sold - a.total_sold)
        .slice(0, 6);
      
      // Count products with quantity below 10 (low stock threshold)
      lowStockCount = data.filter(item => item.quantity < 10 && item.quantity > 0).length;
        
      labels = sortedByQuantity.map(item => item.product_name);
      values = sortedByQuantity.map(item => item.total_sold);
      isCurrency = false; // This indicates values are quantities
      break;
      
    case 'customers':
      // Sort customers by orders and take top 6
      const sortedCustomers = [...data]
        .sort((a, b) => b.order_count - a.order_count)
        .slice(0, 6);
        
      labels = sortedCustomers.map(item => item.customer_name || item.email);
      values = sortedCustomers.map(item => item.order_count);
      isCurrency = false; // This indicates values are counts
      break;
      
    case 'artisans':
      // Sort artisans by sales and take top 6
      const sortedArtisans = [...data]
        .sort((a, b) => b.total_sales - a.total_sales)
        .slice(0, 6);
        
      labels = sortedArtisans.map(item => item.artisan_name);
      values = sortedArtisans.map(item => item.total_sales);
      isCurrency = true; // This indicates values are monetary
      break;
      
    default:
      break;
  }
  
  // Calculate percentages for bar heights
  let percentages = [];
  if (values.length > 0) {
    const maxValue = Math.max(...values);
    percentages = values.map(value => (maxValue > 0 ? (value / maxValue) * 90 : 0)); // Max 90% height to keep labels visible
  }
  
  return { labels, values, percentages, isCurrency, lowStockCount, colors };
};

/**
 * Prepares data for a pie chart based on report type
 * @param {string} reportType - The type of report
 * @param {Array} data - The report data
 * @param {boolean} isArtisan - Whether this is for artisan view
 * @returns {Array} Formatted data for pie chart
 */
export const preparePieChartData = (reportType, data, isArtisan = false) => {
  if (!data || data.length === 0) return [];
  
  let groupedData = {};
  let total = 0;
  let field, labelField;
  
  // Special handling for artisan order reports
  if (isArtisan && reportType === 'orders' && data.charts && data.charts.statusDistribution) {
    return data.charts.statusDistribution;
  }

  switch (reportType) {
    case 'sales':
      field = 'total_amount';
      labelField = 'category_name';
      break;
    case 'products':
      field = 'total_sold';
      labelField = 'category_name';
      break;
    case 'customers':
      field = 'total_spent';
      labelField = 'customer_type';
      break;
    case 'artisans':
      field = 'total_sales';
      labelField = 'artisan_type';
      break;
    default:
      return [];
  }
  
  // Group by label field
  data.forEach(item => {
    const label = item[labelField] || 'Other';
    const value = parseFloat(item[field]) || 0;
    
    if (!groupedData[label]) {
      groupedData[label] = 0;
    }
    
    groupedData[label] += value;
    total += value;
  });
  
  // Convert to array and calculate percentages
  let pieData = Object.keys(groupedData)
    .map(label => ({
      label,
      value: groupedData[label],
      percentage: total > 0 ? (groupedData[label] / total) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value);
  
  // Limit to top 4 categories + "Others" if needed
  if (pieData.length > 4) {
    const topCategories = pieData.slice(0, 3);
    const otherCategories = pieData.slice(3);
    
    const otherValue = otherCategories.reduce((sum, item) => sum + item.value, 0);
    const otherPercentage = total > 0 ? (otherValue / total) * 100 : 0;
    
    pieData = [
      ...topCategories,
      {
        label: 'Other',
        value: otherValue,
        percentage: otherPercentage
      }
    ];
  }
  
  // Add colors based on report type
  const pieColors = getReportColors(reportType).palette;
  pieData = pieData.map((item, index) => ({
    ...item,
    color: pieColors[index % pieColors.length]
  }));
  
  // Calculate start and end angles for SVG
  let currentAngle = 0;
  
  pieData = pieData.map(segment => {
    const startAngle = currentAngle;
    const angleSize = (segment.percentage / 100) * 360;
    const endAngle = startAngle + angleSize;
    
    currentAngle = endAngle;
    
    return {
      ...segment,
      startAngle,
      endAngle
    };
  });
  
  return pieData;
};

/**
 * Prepares data for line chart based on report type
 * @param {string} reportType - The type of report
 * @param {Object} reportData - The report data object
 * @param {boolean} isArtisan - Whether this is for artisan view
 * @returns {Object} Formatted data for line chart
 */
export const prepareLineChartData = (reportType, reportData, isArtisan = false) => {
  if (!reportData || !reportData.data || reportData.data.length === 0) {
    return { 
      labels: [], 
      values: [], 
      title: 'No data available',
      isCurrency: false,
      colors: getReportColors(reportType) // Add colors to return object
    };
  }
  
  // Special handling for artisan order reports
  if (isArtisan && reportType === 'orders' && reportData.charts && reportData.charts.monthlyTrend) {
    return {
      labels: reportData.charts.monthlyTrend.labels,
      values: reportData.charts.monthlyTrend.values,
      title: 'Monthly Order Trend',
      isCurrency: false
    };
  }

  // Check if we have timeSeries data first
  if (reportData.timeSeries && reportData.timeSeries.length > 0) {
    const timeData = [...reportData.timeSeries].sort((a, b) => 
      new Date(a.period) - new Date(b.period)
    );
    
    const labels = timeData.map(item => formatDate(item.period));
    let values = [];
    let title = '';
    let isCurrency = false;
    
    switch (reportType) {
      case 'sales':
        values = timeData.map(item => parseFloat(item.sales_amount || 0));
        title = 'Sales Trend';
        isCurrency = true;
        break;
      
      case 'customers':
        values = timeData.map(item => parseFloat(item.new_customers || 0));
        title = 'New Customers';
        isCurrency = false;
        break;
        
      default:
        values = timeData.map(item => parseFloat(item.value || 0));
        title = 'Trend';
        isCurrency = false;
    }
    
    return { labels, values, title, isCurrency, colors: getReportColors(reportType) };
  }
  
  // If no timeSeries, try to extract time data from regular data
  const data = reportData.data;
  
  // For sales report, we can try to group by date
  if (reportType === 'sales') {
    const salesByDate = {};
    
    data.forEach(item => {
      if (item.order_date) {
        const dateKey = formatDate(item.order_date);
        if (!salesByDate[dateKey]) {
          salesByDate[dateKey] = 0;
        }
        salesByDate[dateKey] += parseFloat(item.total_amount || 0);
      }
    });
    
    // Convert to arrays and sort by date
    const sortedDates = Object.keys(salesByDate).sort((a, b) => 
      new Date(a) - new Date(b)
    );
    
    return {
      labels: sortedDates,
      values: sortedDates.map(date => salesByDate[date]),
      title: 'Sales Trend',
      isCurrency: true,
      colors: getReportColors(reportType)
    };
  }
  
  // Fallback to dummy data
  return {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [100, 200, 150, 300, 250, 400],
    title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Trend`,
    isCurrency: reportType === 'sales' || reportType === 'artisans',
    colors: getReportColors(reportType)
  };
};

// Helper function to format date strings
const formatDate = (dateString) => {
  try {
    // If already a Date object, use it directly
    const date = typeof dateString === 'string'
      ? new Date(dateString.replace(/-/g, '/')) // Replace dashes with slashes for Safari compatibility
      : dateString;
    if (isNaN(date)) return dateString;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (e) {
    return dateString;
  }
};
