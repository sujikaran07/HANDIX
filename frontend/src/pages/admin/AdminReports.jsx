import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartBar, faCalendarAlt, faFilter, faChartLine, faBoxOpen, 
  faUsers, faPaintBrush, faChartPie, faTable, faPrint, faFileDownload,
  faExclamationTriangle, faTimes, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/admin/AdminReports.css';
import axios from 'axios';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';
import ReportViewForm from '../../components/admin/ReportViewForm';
import { getReportColors } from '../../utils/reportChartHelper';

// Define API base URL
const API_BASE_URL = 'http://localhost:5000';

const reportTypeInfo = {
  sales: { 
    title: 'Sales Report', 
    icon: faChartLine, 
    description: 'Sales performance analysis',
    color: 'primary'
  },
  products: { 
    title: 'Product Report', 
    icon: faBoxOpen, 
    description: 'Inventory performance',
    color: 'success'
  },
  customers: { 
    title: 'Customer Report', 
    icon: faUsers, 
    description: 'Customer activity',
    color: 'info'
  },
  artisans: { 
    title: 'Artisan Report', 
    icon: faPaintBrush, 
    description: 'Artisan productivity',
    color: 'warning'
  }
};

const AdminReportsPage = () => {
  const navigate = useNavigate();
  
  // State variables
  const [currentReport, setCurrentReport] = useState('sales');
  const [timeRange, setTimeRange] = useState('this-month');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [metadata, setMetadata] = useState({
    categories: []
  });
  const [filters, setFilters] = useState({
    categories: [],
    stockStatus: '',
    customerType: '',
    minLifetimeValue: '',
    productivityLevel: '',
    compareWithPrevious: false,
    includeGraphs: true,
    dataPointsLimit: 10,
    groupBy: 'day'
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [error, setError] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState([]);

  // Initialize component on mount
  useEffect(() => {
    fetchMetadata();
    setDefaultDateRange();
    
    // Event listener for outside click to close modal
    const handleOutsideClick = (e) => {
      const modal = document.getElementById('filterModal');
      if (modal && showFilterModal && !modal.contains(e.target)) {
        setShowFilterModal(false);
      }
    };
    
    if (showFilterModal) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showFilterModal]);

  // Set default date range helper
  const setDefaultDateRange = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    setCustomDateRange({
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
  };

  // Fetch metadata for filters
  const fetchMetadata = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/reports/metadata`);
      if (response.data.success) {
        setMetadata({
          categories: response.data.categories || []
        });
        
        if (response.data.isMockData) {
          console.warn("Using mock metadata - database tables may be missing");
        }
      }
    } catch (error) {
      console.error('Error fetching report metadata:', error);
      setError('Failed to load report options.');
      setMetadata({
        categories: []
      });
    }
  };

  // Get date range based on selected preset
  const getDateRangeFromPreset = useCallback(() => {
    const today = new Date();
    let startDate, endDate = today.toISOString().split('T')[0];
    
    switch (timeRange) {
      case 'today':
        startDate = today.toISOString().split('T')[0];
        break;
      case 'this-week': {
        const firstDayOfWeek = new Date(today);
        const day = today.getDay() || 7; // Convert Sunday (0) to 7
        firstDayOfWeek.setDate(today.getDate() - day + 1); // Monday is first day
        startDate = firstDayOfWeek.toISOString().split('T')[0];
        break;
      }
      case 'this-month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        break;
      case 'last-month': {
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      }
      case 'last-quarter': {
        const lastQuarter = new Date(today);
        lastQuarter.setMonth(Math.floor(today.getMonth() / 3) * 3 - 3);
        startDate = new Date(lastQuarter.getFullYear(), lastQuarter.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(lastQuarter.getFullYear(), lastQuarter.getMonth() + 3, 0).toISOString().split('T')[0];
        break;
      }
      case 'year-to-date':
        startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        break;
      case 'custom':
        return customDateRange;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    }
    
    return { startDate, endDate };
  }, [timeRange, customDateRange]);

  // Update applied filters array whenever filters change
  useEffect(() => {
    const newAppliedFilters = [];
    
    // Add categories
    if (filters.categories && filters.categories.length > 0) {
      const categoryNames = filters.categories.map(id => {
        const category = metadata.categories.find(c => c.id === id);
        return category ? category.name : `Category ${id}`;
      });
      newAppliedFilters.push({
        key: 'categories',
        label: `Categories: ${categoryNames.join(', ')}`
      });
    }
    
    // Add stock status for products
    if (filters.stockStatus) {
      const stockLabels = {
        'in-stock': 'In Stock',
        'low-stock': 'Low Stock',
        'out-of-stock': 'Out of Stock'
      };
      newAppliedFilters.push({
        key: 'stockStatus',
        label: `Stock: ${stockLabels[filters.stockStatus]}`
      });
    }
    
    // Add customer type for customers
    if (filters.customerType) {
      newAppliedFilters.push({
        key: 'customerType',
        label: `Customer Type: ${filters.customerType}`
      });
    }
    
    // Add min lifetime value for customers
    if (filters.minLifetimeValue) {
      newAppliedFilters.push({
        key: 'minLifetimeValue',
        label: `Min Lifetime Value: Rs ${filters.minLifetimeValue}`
      });
    }
    
    // Add productivity level for artisans
    if (filters.productivityLevel) {
      const productivityLabels = {
        'high': 'High Performers',
        'medium': 'Average Performers',
        'low': 'Low Performers'
      };
      newAppliedFilters.push({
        key: 'productivityLevel',
        label: `Productivity: ${productivityLabels[filters.productivityLevel]}`
      });
    }
    
    setAppliedFilters(newAppliedFilters);
  }, [filters, metadata.categories]);

  // Generate report with improved filter handling
const handleGenerateReport = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const dateRange = getDateRangeFromPreset();
    
    // Validate date range
    if (!dateRange.startDate || !dateRange.endDate) {
      throw new Error('Please select a valid date range');
    }
    
    // Base request data with common parameters
    const requestData = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      // Always include the includeGraphs setting
      includeGraphs: filters.includeGraphs
    };
    
    console.log("Report request with includeGraphs =", filters.includeGraphs);
    
    // Add categories only if there are selected categories
    if (filters.categories && filters.categories.length > 0) {
      requestData.categories = [...filters.categories]; // Create a copy to avoid reference issues
    }
    
    // Apply report-specific filters
    switch (currentReport) {
      case 'products':
        // Product-specific filters
        if (filters.stockStatus) {
          requestData.stockStatus = filters.stockStatus;
        }
        if (filters.customizableOnly) {
          requestData.customizableOnly = true;
        }
        if (filters.bestSellers) {
          requestData.bestSellers = true;
        }
        break;
        
      case 'customers':
        // Customer-specific filters
        if (filters.customerType) {
          requestData.customerType = filters.customerType;
        }
        if (filters.minLifetimeValue) {
          // Ensure this is a number, not a string
          requestData.minLifetimeValue = Number(filters.minLifetimeValue);
        }
        break;
        
      case 'artisans':
        // Artisan-specific filters
        if (filters.productivityLevel) {
          requestData.productivityLevel = filters.productivityLevel;
        }
        break;
        
      case 'sales':
        // Sales-specific filters
        if (filters.groupBy) {
          requestData.groupBy = filters.groupBy;
        }
        break;
    }
    
    // Make the API request
    const response = await axios.post(
      `${API_BASE_URL}/api/reports/${currentReport}`,
      requestData
    );
    
    if (response.data.success) {
      // Ensure applied filters are included in the response
      if (!response.data.appliedFilters) {
        response.data.appliedFilters = {};
      }
      
      // Make sure includeGraphs setting is passed through
      response.data.appliedFilters.includeGraphs = filters.includeGraphs;
      
      setReportData(response.data);
      
      // Check if we got data
      if (response.data.data && response.data.data.length === 0) {
        setError('No data found for the selected date range and filters.');
      }
      
      setActiveTab('summary');
    } else {
      setError('Failed to generate report: ' + (response.data.message || 'Unknown error'));
    }
  } catch (error) {
    console.error(`Error generating ${currentReport} report:`, error);
    setError(error.response?.data?.message || error.message || 'Failed to generate report');
  } finally {
    setLoading(false);
  }
};

  // Handle print function
  const handlePrint = () => {
    window.print();
  };
  
  // Handle download function
  const handleDownload = () => {
    if (!reportData) return;
    
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(reportData, null, 2)], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = `${getReportTitle()}_${Date.now()}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Get report title based on current selection
  const getReportTitle = () => {
    return reportTypeInfo[currentReport]?.title || 'Report';
  };

  // Add a helper function to determine if a value represents a monetary amount
const isCurrencyField = (key) => {
  // Explicitly check for totalSales
  if (key === 'totalSales') return true;
  
  // Other patterns for currency fields
  return key.toLowerCase().includes('sales') || 
         key.toLowerCase().includes('revenue') || 
         key.toLowerCase().includes('value') || 
         key.toLowerCase().includes('price') ||
         key.toLowerCase().includes('amount') ||
         key.toLowerCase().includes('spent');
};

// Then update renderSummaryCards() to use this function
const renderSummaryCards = () => {
  if (!reportData || !reportData.summary) {
    return (
      <div className="alert alert-info">
        <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
        No summary data available for the selected date range and filters.
      </div>
    );
  }
  
  const summary = reportData.summary;
  const displayLabels = {
    totalSales: 'Total Sales',
    orderCount: 'Order Count',
    averageOrderValue: 'Avg. Order Value',
    totalProducts: 'Total Products',
    productsOutOfStock: 'Out of Stock',
    productsLowStock: 'Low Stock',
    totalCustomers: 'Total Customers',
    newCustomers: 'New Customers',
    returningCustomers: 'Returning Customers',
    totalArtisans: 'Total Artisans',
    activeArtisans: 'Active Artisans',
    topPerformer: 'Top Performer'
  };
  
  // If all summary values are zero, show a message
  if (Object.values(summary).every(value => 
    value === 0 || value === "N/A" || value === "" || value === null)) {
    return (
      <div className="alert alert-info">
        <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
        No data available for the selected date range and filters.
      </div>
    );
  }
  
  return (
    <div className="row mb-3 g-2">
      {Object.keys(summary).map((key, index) => (
        <div className="col-md-4 col-sm-6" key={index}>
          <div className="card h-100 summary-card">
            <div className="card-body p-3 text-center">
              <h5 className="fw-bold text-primary mb-1">
                {typeof summary[key] === 'number' && isCurrencyField(key)
                  ? formatCurrency(summary[key])
                  : typeof summary[key] === 'number'
                    ? formatNumber(summary[key])
                    : summary[key].toString()}
              </h5>
              <p className="mb-0 small text-muted">{displayLabels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

  // Render bar chart with real data
  const renderBarChart = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      return renderBarChartPlaceholder();
    }
  
    // Calculate data for bar chart based on current report type
    const chartData = calculateChartData(reportData.data);
    
    return (
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">{getReportTitle()} Overview</h5>
        </div>
        <div className="card-body chart-container">
          <div className="bar-chart-placeholder">
            {chartData.map((item, index) => (
              <div 
                className="chart-bar" 
                key={index} 
                style={{
                  height: `${Math.max(10, item.percentage)}%`,
                  backgroundColor: getBarColor(index, chartData.length)
                }}
                title={`${item.label}: ${item.value}`}
              >
                <div className="chart-label">{truncateLabel(item.label)}</div>
              </div>
            ))}
          </div>
          <div className="text-center text-muted mt-3">
            <small>{getChartDescription()}</small>
          </div>
        </div>
      </div>
    );
  };
  
  // Render bar chart placeholder when no data is available
  const renderBarChartPlaceholder = () => {
    return (
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">{getReportTitle()} Overview</h5>
        </div>
        <div className="card-body chart-container">
          <div className="bar-chart-placeholder">
            <div className="chart-bar" style={{height: '60%'}}><div className="chart-label">Jan</div></div>
            <div className="chart-bar" style={{height: '75%'}}><div className="chart-label">Feb</div></div>
            <div className="chart-bar" style={{height: '45%'}}><div className="chart-label">Mar</div></div>
            <div className="chart-bar" style={{height: '90%'}}><div className="chart-label">Apr</div></div>
            <div className="chart-bar" style={{height: '65%'}}><div className="chart-label">May</div></div>
            <div className="chart-bar" style={{height: '80%'}}><div className="chart-label">Jun</div></div>
          </div>
          <div className="text-center text-muted mt-3">
            <small>No data available for chart visualization</small>
          </div>
        </div>
      </div>
    );
  };
  
  // Helper function to calculate chart data from report data
  const calculateChartData = (data) => {
    if (!data || data.length === 0) return [];
    
    // Limit to 6 data points for better visualization
    let chartData = [];
    
    switch (currentReport) {
      case 'sales':
        // Group by product_name and sum total_amount
        const salesByProduct = {};
        data.forEach(item => {
          if (!salesByProduct[item.product_name]) {
            salesByProduct[item.product_name] = 0;
          }
          salesByProduct[item.product_name] += parseFloat(item.total_amount);
        });
        
        chartData = Object.keys(salesByProduct)
          .map(product => ({
            label: product,
            value: salesByProduct[product]
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6);
        break;
      
      case 'products':
        // Use total_sold from product report
        chartData = data
          .sort((a, b) => b.total_sold - a.total_sold)
          .slice(0, 6)
          .map(item => ({
            label: item.product_name,
            value: item.total_sold
          }));
        break;
      
      case 'customers':
        // Use order_count from customer report
        chartData = data
          .sort((a, b) => b.order_count - a.order_count)
          .slice(0, 6)
          .map(item => ({
            label: item.customer_name,
            value: item.order_count
          }));
        break;
      
      case 'artisans':
        // Use total_sales from artisan report
        chartData = data
          .sort((a, b) => b.total_sales - a.total_sales)
          .slice(0, 6)
          .map(item => ({
            label: item.artisan_name,
            value: item.total_sales
          }));
        break;
      
      default:
        return [];
    }
    
    // Calculate percentages for bar heights
    if (chartData.length > 0) {
      const maxValue = Math.max(...chartData.map(item => item.value));
      chartData = chartData.map(item => ({
        ...item,
        percentage: (item.value / maxValue) * 90 // Max 90% height to keep labels visible
      }));
    }
    
    return chartData;
  };
  
  // Get different colors for bars
  const getBarColor = (index, total) => {
    const colors = getReportColors(currentReport).palette;
    return colors[index % colors.length];
  };
  
  // Truncate long product/customer names for labels
  const truncateLabel = (label) => {
    if (!label) return '';
    return label.length > 8 ? label.substring(0, 7) + '…' : label;
  };
  
  // Get description for chart based on report type
  const getChartDescription = () => {
    switch (currentReport) {
      case 'sales':
        return 'Top 6 Products by Sales Value';
      case 'products':
        return 'Top 6 Products by Units Sold';
      case 'customers':
        return 'Top 6 Customers by Order Count';
      case 'artisans':
        return 'Top 6 Artisans by Sales Value';
      default:
        return '';
    }
  };
  
  // Render pie chart with real data
  const renderPieChart = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      return renderPieChartPlaceholder();
    }
    
    // Calculate data for pie chart
    const pieData = calculatePieChartData();
    
    return (
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Distribution Analysis</h5>
        </div>
        <div className="card-body chart-container">
          <div className="pie-chart-container">
            <svg viewBox="0 0 100 100" className="pie-chart">
              {renderPieSegments(pieData)}
            </svg>
          </div>
          <div className="pie-chart-legend">
            {pieData.map((segment, index) => (
              <div className="legend-item" key={index}>
                <span 
                  className="legend-color" 
                  style={{backgroundColor: segment.color}}
                ></span>
                {segment.label} ({segment.percentage.toFixed(0)}%)
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Render pie chart placeholder when no data
  const renderPieChartPlaceholder = () => {
    return (
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Distribution Analysis</h5>
        </div>
        <div className="card-body chart-container">
          <div className="pie-chart-placeholder">
            <div className="pie-segment segment-1"></div>
            <div className="pie-segment segment-2"></div>
            <div className="pie-segment segment-3"></div>
            <div className="pie-segment segment-4"></div>
          </div>
          <div className="pie-chart-legend">
            <div className="legend-item"><span className="legend-color legend-1"></span> Category 1 (35%)</div>
            <div className="legend-item"><span className="legend-color legend-2"></span> Category 2 (25%)</div>
            <div className="legend-item"><span className="legend-color legend-3"></span> Category 3 (20%)</div>
            <div className="legend-item"><span className="legend-color legend-4"></span> Other (20%)</div>
          </div>
        </div>
      </div>
    );
  };
  
  // Calculate pie chart data based on report type
  const calculatePieChartData = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      return [];
    }
    
    let groupedData = {};
    let total = 0;
    let field, labelField;
    
    switch (currentReport) {
      case 'sales':
        field = 'total_amount';
        labelField = 'category_name';
        break;
      case 'products':
        field = 'total_revenue';
        labelField = 'category_name';
        break;
      case 'customers':
        field = 'total_spent';
        labelField = 'email';
        break;
      case 'artisans':
        field = 'total_sales';
        labelField = 'artisan_name';
        break;
      default:
        return [];
    }
    
    // Group by label field
    reportData.data.forEach(item => {
      const label = item[labelField] || 'Unknown';
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
        percentage: (groupedData[label] / total) * 100
      }))
      .sort((a, b) => b.value - a.value);
    
    // Limit to top 4 categories + "Others" if needed
    if (pieData.length > 4) {
      const topCategories = pieData.slice(0, 3);
      const otherCategories = pieData.slice(3);
      
      const otherValue = otherCategories.reduce((sum, item) => sum + item.value, 0);
      const otherPercentage = (otherValue / total) * 100;
      
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
    const pieColors = getReportColors(currentReport).palette;
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
  
  // Render SVG pie segments
  const renderPieSegments = (data) => {
    const center = { x: 50, y: 50 };
    const radius = 40;
    
    return data.map((segment, index) => {
      const startAngleRad = (segment.startAngle - 90) * Math.PI / 180;
      const endAngleRad = (segment.endAngle - 90) * Math.PI / 180;
      
      // Calculate the two points on the arc
      const startX = center.x + radius * Math.cos(startAngleRad);
      const startY = center.y + radius * Math.sin(startAngleRad);
      const endX = center.x + radius * Math.cos(endAngleRad);
      const endY = center.y + radius * Math.sin(endAngleRad);
      
      // Determine if the arc should be drawn as a large arc
      const largeArc = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
      
      // Create the SVG path for the pie segment
      const path = `
        M ${center.x} ${center.y}
        L ${startX} ${startY}
        A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}
        Z
      `;
      
      return (
        <path
          key={index}
          d={path}
          fill={segment.color}
          stroke="#fff"
          strokeWidth="1"
        />
      );
    });
  };

  // Render report table with actual data or empty message
  const renderReportTable = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      return (
        <div className="alert alert-info">
          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
          No data available for the selected date range and filters.
        </div>
      );
    }
    
    return renderActualReportTable();
  };

  // Render actual report table with data
  const renderActualReportTable = () => {
    const data = reportData.data;
    
    if (!data || data.length === 0) {
      return (
        <div className="alert alert-info">
          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
          No data available for the selected date range and filters.
        </div>
      );
    }
    
    const headers = Object.keys(data[0]).filter(key => key !== 'id');
    
    return (
      <div className="table-responsive">
        <table className="table table-hover table-bordered inventory-table">
          <thead className="table-light">
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? data.map((item, rowIndex) => (
              <tr key={rowIndex} className="hover-row">
                {headers.map((header, index) => (
                  <td key={index}>
                    {header.toLowerCase().includes('date') && item[header]
                      ? formatDate(item[header])
                      : header.toLowerCase().includes('amount') || 
                        header.toLowerCase().includes('sales') || 
                        header.toLowerCase().includes('revenue') || 
                        header.toLowerCase().includes('spent') ||
                        header.toLowerCase().includes('value')
                        ? formatCurrency(item[header])
                        : header.toLowerCase().includes('growth')
                          ? <span className={parseFloat(item[header]) >= 0 ? 'text-success' : 'text-danger'}>
                              {parseFloat(item[header]) >= 0 ? '+' : ''}{item[header]}%
                            </span>
                          : (header.toLowerCase().includes('count') || 
                             header.toLowerCase().includes('level') || 
                             header.toLowerCase().includes('quantity'))
                            ? formatNumber(item[header])
                            : item[header]}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={headers.length} className="text-center">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Render filter modal with dynamic options based on report type
  const renderFilterModal = () => {
    const reportColor = getReportColors(currentReport).primary;
    
    // When the Apply Filters button is clicked
    const handleApplyFilters = () => {
      // Log selected filters before closing the modal
      console.log("Applied filters:", {
        reportType: currentReport,
        categories: filters.categories,
        stockStatus: filters.stockStatus,
        customerType: filters.customerType,
        minLifetimeValue: filters.minLifetimeValue, 
        productivityLevel: filters.productivityLevel,
        includeGraphs: filters.includeGraphs // Log this specifically
      });
      
      // Now close the modal
      setShowFilterModal(false);
    };
    
    return (
      <div className={`modal fade ${showFilterModal ? 'show' : ''}`} 
           id="filterModal" 
           tabIndex="-1" 
           role="dialog"
           style={{ display: showFilterModal ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
          <div className="modal-content filter-modal-content">
            <div className="modal-header filter-modal-header" 
                 style={{ 
                   background: `linear-gradient(135deg, ${reportColor}, ${reportColor}DD)`,
                   color: 'white' 
                 }}>
              <h5 className="modal-title">
                Advanced Options for {reportTypeInfo[currentReport]?.title || 'Report'}
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                aria-label="Close"
                onClick={() => setShowFilterModal(false)}
              ></button>
            </div>
            <div className="modal-body filter-modal-body">
              
              {/* Common Filters - Categories - shown for all reports */}
              <div className="filter-section">
                <h6 style={{ color: reportColor, borderBottom: `2px solid ${reportColor}30`, paddingBottom: '8px' }}>Categories</h6>
                <div className="row">
                  {metadata.categories.map((category, index) => (
                    <div className="col-md-6" key={index}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`category-${category.id}`}
                          checked={filters.categories.includes(category.id)}
                          onChange={(e) => {
                            const newCategories = e.target.checked 
                              ? [...filters.categories, category.id]
                              : filters.categories.filter(id => id !== category.id);
                            setFilters({...filters, categories: newCategories});
                          }}
                          style={{ 
                            borderColor: filters.categories.includes(category.id) ? reportColor : '',
                            backgroundColor: filters.categories.includes(category.id) ? reportColor : '',
                            boxShadow: filters.categories.includes(category.id) ? `0 0 0 0.2rem ${reportColor}40` : ''
                          }}
                        />
                        <label 
                          className="form-check-label" 
                          htmlFor={`category-${category.id}`}
                          style={{ 
                            fontWeight: filters.categories.includes(category.id) ? '500' : 'normal',
                            color: filters.categories.includes(category.id) ? reportColor : ''
                          }}
                        >
                          {category.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Product Report Specific Filters */}
              {currentReport === 'products' && (
                <div className="filter-section">
                  <h6 style={{ color: reportColor, borderBottom: `2px solid ${reportColor}30`, paddingBottom: '8px' }}>Product Filters</h6>
                  <div className="form-group mb-3">
                    <label className="form-label" style={{ color: reportColor }}>Stock Status</label>
                    <select 
                      className="form-select"
                      value={filters.stockStatus}
                      onChange={(e) => setFilters({...filters, stockStatus: e.target.value})}
                      style={{ 
                        borderColor: filters.stockStatus ? reportColor : '', 
                        boxShadow: filters.stockStatus ? `0 0 0 0.2rem ${reportColor}40` : ''
                      }}
                    >
                      <option value="">All Stock Status</option>
                      <option value="in-stock">In Stock</option>
                      <option value="low-stock">Low Stock</option>
                      <option value="out-of-stock">Out of Stock</option>
                    </select>
                  </div>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="customizableOnly"
                      checked={filters.customizableOnly || false}
                      onChange={(e) => setFilters({...filters, customizableOnly: e.target.checked})}
                      style={{ 
                        borderColor: filters.customizableOnly ? reportColor : '',
                        backgroundColor: filters.customizableOnly ? reportColor : '',
                        boxShadow: filters.customizableOnly ? `0 0 0 0.2rem ${reportColor}40` : ''
                      }}
                    />
                    <label 
                      className="form-check-label" 
                      htmlFor="customizableOnly"
                      style={{
                        fontWeight: filters.customizableOnly ? '500' : 'normal',
                        color: filters.customizableOnly ? reportColor : ''
                      }}
                    >
                      Show customizable products only
                    </label>
                  </div>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="bestSellers"
                      checked={filters.bestSellers || false}
                      onChange={(e) => setFilters({...filters, bestSellers: e.target.checked})}
                      style={{ 
                        borderColor: filters.bestSellers ? reportColor : '',
                        backgroundColor: filters.bestSellers ? reportColor : '',
                        boxShadow: filters.bestSellers ? `0 0 0 0.2rem ${reportColor}40` : ''
                      }}
                    />
                    <label 
                      className="form-check-label" 
                      htmlFor="bestSellers"
                      style={{
                        fontWeight: filters.bestSellers ? '500' : 'normal',
                        color: filters.bestSellers ? reportColor : ''
                      }}
                    >
                      Show best selling products only
                    </label>
                  </div>
                </div>
              )}
              
              {/* Customer Report Specific Filters */}
              {currentReport === 'customers' && (
                <div className="filter-section">
                  <h6 style={{ color: reportColor }}>Customer Filters</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label className="form-label">Customer Type</label>
                        <select 
                          className="form-select"
                          value={filters.customerType}
                          onChange={(e) => setFilters({...filters, customerType: e.target.value})}
                          style={{ borderColor: filters.customerType ? reportColor : '' }}
                        >
                          <option value="">All Types</option>
                          <option value="Retail">Retail</option>
                          <option value="Wholesale">Wholesale</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label className="form-label">Min. Lifetime Value</label>
                        <input 
                          type="number" 
                          className="form-control"
                          placeholder="Min value"
                          value={filters.minLifetimeValue || ''}
                          onChange={(e) => setFilters({...filters, minLifetimeValue: e.target.value})}
                          style={{ borderColor: filters.minLifetimeValue ? reportColor : '' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Artisan Report Specific Filters */}
              {currentReport === 'artisans' && (
                <div className="filter-section">
                  <h6 style={{ color: reportColor }}>Artisan Filters</h6>
                  <div className="form-group mb-3">
                    <label className="form-label">Productivity Level</label>
                    <select 
                      className="form-select"
                      value={filters.productivityLevel || ''}
                      onChange={(e) => setFilters({...filters, productivityLevel: e.target.value})}
                      style={{ borderColor: filters.productivityLevel ? reportColor : '' }}
                    >
                      <option value="">All Levels</option>
                      <option value="high">High Performers</option>
                      <option value="medium">Average Performers</option>
                      <option value="low">Low Performers</option>
                    </select>
                  </div>
                </div>
              )}
              
              {/* Display Options - make this available for all reports */}
              <div className="filter-section">
                <h6 style={{ color: reportColor, borderBottom: `2px solid ${reportColor}30`, paddingBottom: '8px' }}>Display Options</h6>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="includeGraphs"
                    checked={filters.includeGraphs}
                    onChange={(e) => {
                      console.log("includeGraphs changed to:", e.target.checked);
                      setFilters({...filters, includeGraphs: e.target.checked});
                    }}
                    style={{ 
                      borderColor: filters.includeGraphs ? reportColor : '',
                      backgroundColor: filters.includeGraphs ? reportColor : ''
                    }}
                  />
                  <label className="form-check-label" htmlFor="includeGraphs">
                    Include graphs in report
                    <span 
                      className="ms-1 tooltip-icon" 
                      title="When enabled, shows charts and visualizations in the report"
                    >
                      <FontAwesomeIcon icon={faInfoCircle} style={{ opacity: 0.7 }} />
                    </span>
                  </label>
                </div>
                
              </div>
              
              {/* Filter Actions */}
              <div className="filter-actions">
                <button 
                  className="btn btn-link"
                  style={{ color: reportColor }}
                  onClick={() => {
                    // Reset to default filters - keep only report-specific ones
                    const defaultFilters = {
                      categories: [],
                      includeGraphs: true, // Reset to default (true)
                      dataPointsLimit: 10
                    };
                    
                    // Add report-specific default values
                    if (currentReport === 'products') {
                      defaultFilters.stockStatus = '';
                      defaultFilters.customizableOnly = false;
                      defaultFilters.bestSellers = false;
                    } else if (currentReport === 'customers') {
                      defaultFilters.customerType = '';
                      defaultFilters.minLifetimeValue = '';
                    } else if (currentReport === 'artisans') {
                      defaultFilters.productivityLevel = '';
                    } else if (currentReport === 'sales') {
                    }
                    
                    setFilters(defaultFilters);
                    console.log("Reset filters to defaults");
                  }}
                >
                  Reset Filters
                </button>
                <button 
                  className="btn"
                  style={{ 
                    backgroundColor: reportColor,
                    color: 'white',
                    borderColor: reportColor,
                    boxShadow: `0 2px 5px ${reportColor}50`
                  }}
                  onClick={handleApplyFilters}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  
const renderReportTypeCards = () => {
  const reportColors = {
    sales: { primary: '#0d6efd', gradient: 'linear-gradient(135deg, #0d6efd, #0a58ca)' },
    products: { primary: '#198754', gradient: 'linear-gradient(135deg, #198754, #146c43)' },
    customers: { primary: '#0dcaf0', gradient: 'linear-gradient(135deg, #0dcaf0, #0aa2c0)' },
    artisans: { primary: '#ffc107', gradient: 'linear-gradient(135deg, #ffc107, #cc9a06)' }
  };
  
  return (
    <div className="report-type-selector mb-4">
      {Object.entries(reportTypeInfo).map(([key, info]) => {
        const isSelected = currentReport === key;
        const colors = reportColors[key] || reportColors.sales;
        
        return (
          <div 
            className={`report-type-card ${isSelected ? 'selected' : ''}`}
            onClick={() => setCurrentReport(key)}
            key={key}
            style={isSelected ? {
              borderColor: colors.primary,
              backgroundColor: `${colors.primary}08`,
              boxShadow: `0 5px 15px rgba(0,0,0,0.08), 0 0 0 2px ${colors.primary}30`
            } : {}}
          >
            <div 
              className="report-type-icon" 
              style={{
                background: isSelected ? colors.gradient : '#f8f9fa',
                color: isSelected ? '#fff' : colors.primary,
                boxShadow: isSelected ? `0 4px 10px ${colors.primary}40` : 'none'
              }}
            >
              <FontAwesomeIcon icon={info.icon} />
            </div>
            <div className="report-type-info">
              <h5 style={isSelected ? {color: colors.primary} : {}}>{info.title}</h5>
              <p>{info.description}</p>
            </div>
            {isSelected && (
              <div className="report-type-check">
                <span className="checkmark-circle" style={{backgroundColor: colors.primary}}>
                  <FontAwesomeIcon icon={faChartBar} className="text-white" />
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Replace the renderDateSelector function with this enhanced version
const renderDateSelector = () => {
  const reportColor = getReportColors(currentReport).primary;
  
  return (
    <div className="date-range-selector">
      <h6 className="section-title">Select Date Range</h6>
      
      <div className="date-preset-buttons">
        {[
          { value: 'today', label: 'Today', icon: faCalendarAlt },
          { value: 'this-week', label: 'This Week', icon: faCalendarAlt },
          { value: 'this-month', label: 'This Month', icon: faCalendarAlt },
          { value: 'last-month', label: 'Last Month', icon: faCalendarAlt },
          { value: 'custom', label: 'Custom Range', icon: faCalendarAlt }
        ].map(option => (
          <button 
            key={option.value}
            type="button"
            className={`date-preset-btn ${timeRange === option.value ? 'active pulse' : ''}`}
            onClick={() => setTimeRange(option.value)}
            style={timeRange === option.value ? {
              borderColor: reportColor,
              backgroundColor: `${reportColor}10`,
              boxShadow: `0 3px 10px ${reportColor}20`
            } : {}}
          >
            <span 
              className="preset-icon"
              style={{
                backgroundColor: timeRange === option.value ? reportColor : `${reportColor}20`,
                color: timeRange === option.value ? 'white' : reportColor
              }}
            >
              <FontAwesomeIcon icon={option.icon} />
            </span>
            <span 
              className="preset-label"
              style={{
                color: timeRange === option.value ? reportColor : ''
              }}
            >
              {option.label}
            </span>
            {timeRange === option.value && (
              <span className="preset-selected">
                <span className="check-icon">✓</span>
              </span>
            )}
          </button>
        ))}
      </div>
      
      {timeRange === 'custom' && (
        <div className="custom-date-inputs" style={{borderTop: `3px solid ${reportColor}`}}>
          <div className="date-range-header">
            <FontAwesomeIcon icon={faCalendarAlt} className="date-range-icon" style={{color: reportColor}} />
            <span>Enter Custom Date Range</span>
          </div>
          
          <div className="date-inputs-container">
            <div className="date-input-group">
              <label style={{color: reportColor}}>Start Date</label>
              <div className="date-input-wrapper">
                <FontAwesomeIcon icon={faCalendarAlt} className="date-input-icon" />
                <input
                  type="date"
                  className="form-control"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
                  style={{borderColor: `${reportColor}50`}}
                />
              </div>
            </div>
            
            <div className="date-range-separator">
              <span>to</span>
            </div>
            
            <div className="date-input-group">
              <label style={{color: reportColor}}>End Date</label>
              <div className="date-input-wrapper">
                <FontAwesomeIcon icon={faCalendarAlt} className="date-input-icon" />
                <input
                  type="date"
                  className="form-control"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange({...customDateRange, endDate: e.target.value})}
                  style={{borderColor: `${reportColor}50`}}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Date range summary */}
      {timeRange !== 'custom' && (
        <div className="date-range-summary" style={{borderLeft: `4px solid ${reportColor}`}}>
          <FontAwesomeIcon icon={faCalendarAlt} className="summary-icon" style={{color: reportColor}} />
          <div className="date-range-info">
            <div className="date-range-period">Selected Period</div>
            <div className="date-range-dates">
              <span className="date-value">{formatDate(getDateRangeFromPreset().startDate)}</span>
              <span className="date-separator">to</span>
              <span className="date-value">{formatDate(getDateRangeFromPreset().endDate)}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Applied filters */}
      {appliedFilters.length > 0 && (
        <div className="applied-filters-section">
          <div className="filters-header">
            <FontAwesomeIcon icon={faFilter} className="filters-icon" style={{color: reportColor}} />
            <h6 className="filters-title">Applied Filters</h6>
          </div>
          
          <div className="applied-filters-tags">
            {appliedFilters.map((filter, index) => (
              <div 
                key={index} 
                className="filter-tag"
                style={{
                  backgroundColor: `${reportColor}15`,
                  borderColor: `${reportColor}30`,
                  color: reportColor
                }}
              >
                <span className="filter-label">{filter.label}</span>
                <button
                  type="button"
                  className="filter-remove-btn"
                  onClick={() => {
                    if (filter.key === 'categories') {
                      setFilters({...filters, categories: []});
                    } else {
                      setFilters({...filters, [filter.key]: ''});
                    }
                  }}
                  style={{
                    backgroundColor: `${reportColor}20`,
                    color: reportColor
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="report-actions">
        <button
          type="button"
          className="btn-advanced-options"
          onClick={() => setShowFilterModal(true)}
          style={{borderColor: reportColor}}
        >
          <div className="option-icon" style={{backgroundColor: `${reportColor}20`, color: reportColor}}>
            <FontAwesomeIcon icon={faFilter} />
          </div>
          <span>Advanced Options</span>
        </button>
        
        <button
          type="button"
          className="btn-generate-report"
          onClick={handleGenerateReport}
          disabled={loading}
          style={{
            background: `linear-gradient(45deg, ${reportColor}, ${reportColor}DD)`,
            boxShadow: `0 4px 15px ${reportColor}40`
          }}
        >
          <div className="generate-icon">
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <FontAwesomeIcon icon={faChartBar} />
            )}
          </div>
          <span>{loading ? 'Generating...' : 'Generate Report'}</span>
        </button>
      </div>
    </div>
  );
};

// Update the return statement UI
return (
  <div className="admin-inventory-page ar-reports-page">
    <AdminSidebar />
    <div className="ar-main-content">
      <AdminTopbar />
      
      <div className="ar-fixed-height-container">
        <div className="card ar-fixed-height-card">
          {!reportData ? (
            <>
              {/* Report configuration section with enhanced header */}
              <div className="card-header bg-white ar-card-header">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="header-icon">
                      <FontAwesomeIcon icon={faChartBar} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="h5 mb-0 ar-header-title">Reports & Analytics</h2>
                      <p className="text-muted small mb-0">Generate comprehensive business reports</p>
                    </div>
                  </div>
                  
                  <div className="header-report-type">
                    <span className="report-type-label">Currently viewing:</span>
                    <span 
                      className="report-type-value"
                      style={{ color: getReportColors(currentReport).primary }}
                    >
                      {reportTypeInfo[currentReport]?.title}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="card-body p-0 ar-fixed-body">
                {/* Show error message if any */}
                {error && (
                  <div className="alert alert-danger m-3 ar-alert">
                    <div className="error-content">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="me-2 error-icon" />
                      <div className="error-message">{error}</div>
                    </div>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setError(null)}
                    ></button>
                  </div>
                )}
                
                <div className="report-config-container">
                  <div className="report-type-container">
                    <h6 className="section-title with-tooltip">
                      Report Type
                      <span className="tooltip-icon" title="Select the type of report you want to generate">
                        <FontAwesomeIcon icon={faInfoCircle} />
                      </span>
                    </h6>
                    {renderReportTypeCards()}
                  </div>
                  
                  <div className="report-options-container">
                    {renderDateSelector()}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-0 h-100 overflow-auto">
              <ReportViewForm 
                reportData={reportData} 
                reportType={currentReport}
                dateRange={getDateRangeFromPreset()}
                onBackClick={() => setReportData(null)}
                appliedFilters={appliedFilters} // Pass the applied filters
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced Filter modal */}
      {showFilterModal && renderFilterModal()}
    </div>
  </div>
);

};

export default AdminReportsPage;
