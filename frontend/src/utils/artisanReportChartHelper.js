/**
 * Helper functions for artisan report charts
 */

// Get color schemes for different report types
export const getArtisanReportColors = (reportType) => {
  switch (reportType) {
    case 'orders':bhgjgjfgjhtjfhgggfgdgd
      return {
        primary: '#0d6efd',
        secondary: '#6c757d',
        palette: [
          'rgba(13, 110, 253, 0.7)',
          'rgba(13, 110, 253, 0.6)',
          'rgba(13, 110, 253, 0.5)',
          'rgba(13, 110, 253, 0.4)',
          'rgba(13, 110, 253, 0.3)',
          'rgba(13, 110, 253, 0.2)',
        ],
      };
    case 'products':
      return {
        primary: '#198754',
        secondary: '#6c757d',
        palette: [
          'rgba(25, 135, 84, 0.7)',
          'rgba(25, 135, 84, 0.6)',
          'rgba(25, 135, 84, 0.5)',
          'rgba(25, 135, 84, 0.4)',
          'rgba(25, 135, 84, 0.3)',
          'rgba(25, 135, 84, 0.2)',
        ],
      };
    case 'performance':
      return {
        primary: '#6f42c1',
        secondary: '#6c757d',
        palette: [
          'rgba(111, 66, 193, 0.7)',
          'rgba(111, 66, 193, 0.6)',
          'rgba(111, 66, 193, 0.5)',
          'rgba(111, 66, 193, 0.4)',
          'rgba(111, 66, 193, 0.3)',
          'rgba(111, 66, 193, 0.2)',
        ],
      };
    default:
      return {
        primary: '#0d6efd',
        secondary: '#6c757d',
        palette: [
          'rgba(13, 110, 253, 0.7)',
          'rgba(13, 110, 253, 0.6)',
          'rgba(13, 110, 253, 0.5)',
          'rgba(13, 110, 253, 0.4)',
          'rgba(13, 110, 253, 0.3)',
          'rgba(13, 110, 253, 0.2)',
        ],
      };
  }
};

// Get chart configuration based on report type
export const getArtisanChartConfig = (reportType) => {
  const baseConfig = {
    showBarChart: true,
    showPieChart: true,
    showLineChart: true,
    showTables: true,
    showSummary: true,
    dashboardCharts: ['barChart', 'pieChart', 'lineChart']
  };

  switch (reportType) {
    case 'orders':
      return {
        ...baseConfig,
        barChartTitle: 'Top Products by Sales Value',
        pieChartTitle: 'Order Status Distribution',
        lineChartTitle: 'Sales Trend Over Time'
      };
    case 'products':
      return {
        ...baseConfig,
        barChartTitle: 'Product Inventory Levels',
        pieChartTitle: 'Products by Category',
        lineChartTitle: 'Product Sales Over Time'
      };
    case 'performance':
      return {
        ...baseConfig,
        barChartTitle: 'Completed Orders by Period',
        pieChartTitle: 'Delivery Performance',
        lineChartTitle: 'Rating Trend'
      };
    default:
      return baseConfig;
  }
};

// Prepare bar chart data with sorting and aggregation
export const prepareArtisanBarChartData = (reportType, data) => {
  const result = {
    labels: [],
    values: [],
    isCurrency: false,
    title: ''
  };

  if (!data || data.length === 0) {
    return result;
  }

  switch (reportType) {
    case 'orders': {
      // Group orders by product and sum total amounts
      const ordersByProduct = {};
      data.forEach(order => {
        if (!ordersByProduct[order.product_name]) {
          ordersByProduct[order.product_name] = 0;
        }
        ordersByProduct[order.product_name] += parseFloat(order.total_amount || 0);
      });

      // Sort by value and take top 7 products
      const sortedProducts = Object.entries(ordersByProduct)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7);

      result.labels = sortedProducts.map(([name]) => name);
      result.values = sortedProducts.map(([_, value]) => value);
      result.title = 'Top Products by Sales Value';
      result.isCurrency = true;
      break;
    }
    case 'products': {
      // Sort products by stock level
      const sortedProducts = [...data]
        .sort((a, b) => b.stock_level - a.stock_level)
        .slice(0, 7);

      result.labels = sortedProducts.map(product => product.product_name);
      result.values = sortedProducts.map(product => product.stock_level);
      result.title = 'Product Inventory Levels';
      break;
    }
    case 'performance': {
      const sortedData = [...data].sort((a, b) => {
        return new Date(a.period) - new Date(b.period);
      });
      
      result.labels = sortedData.map(item => item.period);
      result.values = sortedData.map(item => parseFloat(item.completed_orders || 0));
      result.title = 'Completed Orders by Period';
      break;
    }
  }

  return result;
};

// Prepare pie chart data with percentage calculations
export const prepareArtisanPieChartData = (reportType, data) => {
  const result = [];

  if (!data || data.length === 0) {
    return result;
  }

  switch (reportType) {
    case 'orders': {
      // Group orders by status and calculate percentages
      const statusCounts = {};
      let totalOrders = 0;

      data.forEach(order => {
        if (!statusCounts[order.status]) {
          statusCounts[order.status] = 0;
        }
        statusCounts[order.status]++;
        totalOrders++;
      });

      Object.entries(statusCounts).forEach(([status, count]) => {
        result.push({
          label: status,
          value: count,
          percentage: (count / totalOrders) * 100
        });
      });
      break;
    }
    case 'products': {
      // Group products by category
      const categoryCounts = {};
      let totalProducts = 0;

      data.forEach(product => {
        if (!categoryCounts[product.category]) {
          categoryCounts[product.category] = 0;
        }
        categoryCounts[product.category]++;
        totalProducts++;
      });

      Object.entries(categoryCounts).forEach(([category, count]) => {
        result.push({
          label: category || 'Uncategorized',
          value: count,
          percentage: (count / totalProducts) * 100
        });
      });
      break;
    }
    case 'performance': {
      // Performance delivery metrics distribution
      const metrics = {
        onTime: 0,
        late: 0,
        early: 0
      };

      let total = 0;

      data.forEach(item => {
        metrics.onTime += parseInt(item.on_time || 0);
        metrics.late += parseInt(item.late || 0);
        metrics.early += parseInt(item.early || 0);
      });

      total = metrics.onTime + metrics.late + metrics.early;

      if (total > 0) {
        result.push({
          label: 'On Time',
          value: metrics.onTime,
          percentage: (metrics.onTime / total) * 100
        });
        result.push({
          label: 'Late',
          value: metrics.late,
          percentage: (metrics.late / total) * 100
        });
        result.push({
          label: 'Early',
          value: metrics.early,
          percentage: (metrics.early / total) * 100
        });
      }
      break;
    }
  }

  return result;
};

// Prepare line chart data with trend analysis
export const prepareArtisanLineChartData = (reportType, reportData) => {
  const result = {
    labels: [],
    values: [],
    title: '',
    isCurrency: false
  };

  if (!reportData || !reportData.data || reportData.data.length === 0) {
    return result;
  }

  const data = reportData.data;

  switch (reportType) {
    case 'orders': {
      // Group sales by date for trend analysis
      const salesByDate = {};
      
      data.forEach(order => {
        if (order.date) {
          const dateStr = formatDate(order.date);
          if (!salesByDate[dateStr]) {
            salesByDate[dateStr] = 0;
          }
          salesByDate[dateStr] += parseFloat(order.total_amount || 0);
        }
      });
      
      // Sort chronologically
      const sortedDates = Object.keys(salesByDate).sort((a, b) => new Date(a) - new Date(b));
      
      result.labels = sortedDates;
      result.values = sortedDates.map(date => salesByDate[date]);
      result.title = 'Daily Sales Trend';
      result.isCurrency = true;
      break;
    }
    case 'products': {
      // Aggregate product sales data over time
      const aggregatedSales = {};
      
      data.forEach(product => {
        if (product.sales_data) {
          Object.entries(product.sales_data).forEach(([date, value]) => {
            if (!aggregatedSales[date]) {
              aggregatedSales[date] = 0;
            }
            aggregatedSales[date] += parseFloat(value || 0);
          });
        }
      });
      
      const sortedDates = Object.keys(aggregatedSales).sort((a, b) => new Date(a) - new Date(b));
      
      result.labels = sortedDates;
      result.values = sortedDates.map(date => aggregatedSales[date]);
      result.title = 'Product Sales Trend';
      result.isCurrency = true;
      break;
    }
    case 'performance': {
      // Performance rating trend over time
      const sortedData = [...data].sort((a, b) => {
        return new Date(a.period) - new Date(b.period);
      });
      
      result.labels = sortedData.map(item => item.period);
      result.values = sortedData.map(item => parseFloat(item.rating || 0));
      result.title = 'Rating Trend';
      break;
    }
  }

  return result;
};

/**
 * Helper function to format a date
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};
