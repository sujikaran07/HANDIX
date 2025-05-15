import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Alert, Row, Col, Table, Badge, Nav, Tab, Spinner } from 'react-bootstrap';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';
import { 
  FaArrowLeft, FaChartLine, FaChartPie, FaChartBar, FaTable, 
  FaCloudDownloadAlt, FaPrint, FaInfoCircle, FaFilePdf, FaFileCode
} from 'react-icons/fa';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/environment';
import '../../styles/artisan/ArtisanReportViewForm.css';

const ArtisanReportViewForm = ({ reportData, reportType, dateRange, onBackClick }) => {
  const [activeKey, setActiveKey] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Chart refs
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const lineChartRef = useRef(null);
  
  // Chart instances
  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);
  const lineChartInstance = useRef(null);
  
  // Define report type colors
  const reportTypeColors = {
    orders: {
      primary: '#0d6efd',
      light: '#cfe2ff',
      lighter: '#f0f7ff'
    },
    products: {
      primary: '#198754',
      light: '#d1e7dd',
      lighter: '#f0f9f6'
    }, 
    performance: {
      primary: '#6f42c1',
      light: '#e2d9f3',
      lighter: '#f3f0f9'
    }
  };
  
  const currentColors = reportTypeColors[reportType] || reportTypeColors.orders;
  
  // Initialize charts when component mounts
  useEffect(() => {
    // Clean up any existing charts
    if (barChartInstance.current) barChartInstance.current.destroy();
    if (pieChartInstance.current) pieChartInstance.current.destroy();
    if (lineChartInstance.current) barChartInstance.current.destroy();
    
    // Create charts if we have data and are on the right tab
    if (reportData && reportData.data && reportData.data.length > 0) {
      if (activeKey === 'dashboard' || activeKey === 'charts') {
        if (barChartRef.current) initBarChart();
        if (pieChartRef.current) initPieChart();
        if (lineChartRef.current) initLineChart();
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (barChartInstance.current) barChartInstance.current.destroy();
      if (pieChartInstance.current) pieChartInstance.current.destroy();
      if (lineChartInstance.current) barChartInstance.current.destroy();
    };
  }, [reportData, activeKey]);
  
  // Bar chart initialization
  const initBarChart = () => {
    const ctx = barChartRef.current.getContext('2d');
    const chartData = prepareBarChartData();
    
    barChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: chartData.title,
          data: chartData.values,
          backgroundColor: generateGradientColors(currentColors.primary, chartData.labels.length),
          borderColor: currentColors.primary,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: chartData.title
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (chartData.isCurrency) {
                  label += formatCurrency(context.raw);
                } else {
                  label += formatNumber(context.raw);
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                if (chartData.isCurrency) {
                  return 'Rs. ' + value;
                }
                return value;
              }
            }
          }
        }
      }
    });
  };
  
  // Pie chart initialization
  const initPieChart = () => {
    const ctx = pieChartRef.current.getContext('2d');
    const chartData = preparePieChartData();
    
    pieChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: chartData.labels,
        datasets: [{
          data: chartData.values,
          backgroundColor: generateGradientColors(currentColors.primary, chartData.labels.length),
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: chartData.title
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw;
                const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                const percentage = Math.round((value / total) * 100);
                
                if (chartData.isCurrency) {
                  return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                }
                return `${label}: ${formatNumber(value)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  };
  
  // Line chart initialization
  const initLineChart = () => {
    const ctx = lineChartRef.current.getContext('2d');
    const chartData = prepareLineChartData();
    
    lineChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: chartData.title,
          data: chartData.values,
          backgroundColor: `${currentColors.primary}20`,
          borderColor: currentColors.primary,
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: currentColors.primary,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: chartData.title
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (chartData.isCurrency) {
                  label += formatCurrency(context.raw);
                } else {
                  label += formatNumber(context.raw);
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                if (chartData.isCurrency) {
                  return 'Rs. ' + value;
                }
                return value;
              }
            }
          }
        }
      }
    });
  };
  
  // Prepare data for bar chart based on report type
  const prepareBarChartData = () => {
    let data = { labels: [], values: [], title: '', isCurrency: false };
    
    if (!reportData || !reportData.data || reportData.data.length === 0) return data;
    
    switch(reportType) {
      case 'orders':
        // Group orders by product or category
        const ordersByProduct = {};
        reportData.data.forEach(order => {
          if (!ordersByProduct[order.product_name]) {
            ordersByProduct[order.product_name] = 0;
          }
          ordersByProduct[order.product_name] += parseFloat(order.total_amount || 0);
        });
        
        // Sort by value and take top 7
        const sortedOrders = Object.entries(ordersByProduct)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 7);
        
        data.labels = sortedOrders.map(([name]) => name);
        data.values = sortedOrders.map(([_, value]) => value);
        data.title = 'Top Products by Sales Value';
        data.isCurrency = true;
        break;
        
      case 'products':
        // Group by product inventory
        const sortedProducts = [...reportData.data]
          .sort((a, b) => b.stock_level - a.stock_level)
          .slice(0, 7);
        
        data.labels = sortedProducts.map(product => product.product_name);
        data.values = sortedProducts.map(product => product.stock_level);
        data.title = 'Current Inventory Levels';
        break;
        
      case 'performance':
        // Performance by period
        const sortedPerformance = [...reportData.data];
        
        data.labels = sortedPerformance.map(perf => perf.period);
        data.values = sortedPerformance.map(perf => parseFloat(perf.completed_orders));
        data.title = 'Completed Orders by Period';
        break;
        
      default:
        // Default empty data
        data.title = 'No Data Available';
        break;
    }
    
    return data;
  };
  
  // Prepare data for pie chart based on report type
  const preparePieChartData = () => {
    let data = { labels: [], values: [], title: '', isCurrency: false };
    
    if (!reportData || !reportData.data || reportData.data.length === 0) return data;
    
    switch(reportType) {
      case 'orders':
        // Group orders by status
        const ordersByStatus = {};
        reportData.data.forEach(order => {
          if (!ordersByStatus[order.status]) {
            ordersByStatus[order.status] = 0;
          }
          ordersByStatus[order.status]++;
        });
        
        data.labels = Object.keys(ordersByStatus);
        data.values = Object.values(ordersByStatus);
        data.title = 'Orders by Status';
        break;
        
      case 'products':
        // Group products by category
        const productsByCategory = {};
        reportData.data.forEach(product => {
          if (!productsByCategory[product.category]) {
            productsByCategory[product.category] = 0;
          }
          productsByCategory[product.category]++;
        });
        
        data.labels = Object.keys(productsByCategory);
        data.values = Object.values(productsByCategory);
        data.title = 'Products by Category';
        break;
        
      case 'performance':
        // Performance metrics distribution
        const performanceMetrics = {
          'On Time': 0,
          'Late': 0,
          'Early': 0
        };
        
        reportData.data.forEach(perf => {
          performanceMetrics['On Time'] += parseInt(perf.on_time || 0);
          performanceMetrics['Late'] += parseInt(perf.late || 0);
          performanceMetrics['Early'] += parseInt(perf.early || 0);
        });
        
        data.labels = Object.keys(performanceMetrics);
        data.values = Object.values(performanceMetrics);
        data.title = 'Delivery Performance';
        break;
        
      default:
        // Default empty data
        data.title = 'No Data Available';
        break;
    }
    
    return data;
  };
  
  // Prepare data for line chart based on report type
  const prepareLineChartData = () => {
    let data = { labels: [], values: [], title: '', isCurrency: false };
    
    if (!reportData || !reportData.data || reportData.data.length === 0) return data;
    
    switch(reportType) {
      case 'orders':
        // Group orders by date
        const ordersByDate = {};
        reportData.data.forEach(order => {
          const date = formatDate(order.date);
          if (!ordersByDate[date]) {
            ordersByDate[date] = 0;
          }
          ordersByDate[date] += parseFloat(order.total_amount || 0);
        });
        
        // Sort by date
        const sortedDates = Object.keys(ordersByDate).sort((a, b) => {
          return new Date(a) - new Date(b);
        });
        
        data.labels = sortedDates;
        data.values = sortedDates.map(date => ordersByDate[date]);
        data.title = 'Sales Trend Over Time';
        data.isCurrency = true;
        break;
        
      case 'products':
        // Product sales over time
        // Assuming we have a date field in the data
        const productTrend = {};
        reportData.data.forEach(product => {
          if (product.sales_data) {
            Object.entries(product.sales_data).forEach(([date, value]) => {
              if (!productTrend[date]) {
                productTrend[date] = 0;
              }
              productTrend[date] += parseFloat(value || 0);
            });
          }
        });
        
        const sortedProductDates = Object.keys(productTrend).sort((a, b) => {
          return new Date(a) - new Date(b);
        });
        
        data.labels = sortedProductDates;
        data.values = sortedProductDates.map(date => productTrend[date]);
        data.title = 'Product Sales Trend';
        data.isCurrency = true;
        break;
        
      case 'performance':
        // Rating trend over time
        data.labels = reportData.data.map(perf => perf.period);
        data.values = reportData.data.map(perf => parseFloat(perf.rating || 0));
        data.title = 'Rating Trend';
        break;
        
      default:
        // Default empty data
        data.title = 'No Data Available';
        break;
    }
    
    return data;
  };
  
  // Generate gradient colors based on primary color
  const generateGradientColors = (baseColor, count) => {
    const colors = [];
    
    // Handle empty or invalid inputs
    if (!baseColor || !count || count < 1) {
      return ['#0d6efd', '#5da0e6', '#70b0ea', '#83c0ee'];
    }
    
    try {
      // Extract RGB values from hex color
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      
      // Generate variations
      for (let i = 0; i < count; i++) {
        const opacity = 1 - (i * 0.7 / count);
        colors.push(`rgba(${r}, ${g}, ${b}, ${Math.max(0.3, opacity)})`);
      }
    } catch (error) {
      console.error('Error generating gradient colors:', error);
      // Fallback colors
      return ['#0d6efd', '#5da0e6', '#70b0ea', '#83c0ee'];
    }
    
    return colors;
  };
  
  // Handle print button click
  const handlePrint = () => {
    window.print();
  };
  
  // Handle download report as JSON
  const handleDownloadJson = () => {
    const element = document.createElement('a');
    const fileData = JSON.stringify(reportData, null, 2);
    const blob = new Blob([fileData], { type: 'application/json' });
    element.href = URL.createObjectURL(blob);
    element.download = `${getReportTitle()}_${formatDate(new Date())}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  // Handle export as PDF
  const handleExportPdf = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare export data
      const exportData = {
        reportData: reportData,
        reportType: reportType,
        dateRange: dateRange,
        artisanId: reportData.artisanId || localStorage.getItem('artisanId'),
        pdfOptions: {
          paperSize: 'a4',
          orientation: 'portrait',
          includeCharts: true,
          includeDataTable: true
        }
      };
      
      // Send to API
      const response = await axios.post(
        `${API_BASE_URL}/api/artisan/reports/export/pdf`,
        exportData
      );
      
      if (response.data.success) {
        // Download the PDF
        const downloadUrl = `${API_BASE_URL}/api/artisan/reports/download/${response.data.fileName}`;
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${getReportTitle()}_${formatDate(new Date())}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('PDF exported successfully');
      } else {
        setError('Failed to generate PDF report');
        showNotification('Failed to export PDF report', 'danger');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setError(error.message || 'Failed to export PDF report');
      showNotification('Error exporting PDF report', 'danger');
    } finally {
      setLoading(false);
    }
  };
  
  // Show notification function
  const showNotification = (message, type = 'success') => {
    // Create a bootstrap alert that auto-dismisses
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed art-notification`;
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      alertDiv.classList.remove('show');
      setTimeout(() => alertDiv.remove(), 150);
    }, 3000);
  };
  
  // Get formatted report title
  const getReportTitle = () => {
    switch(reportType) {
      case 'orders': return 'Artisan Order Report';
      case 'products': return 'Artisan Product Report';
      case 'performance': return 'Artisan Performance Report';
      default: return 'Artisan Report';
    }
  };
  
  // Render summary cards based on report type
  const renderSummaryCards = () => {
    if (!reportData || !reportData.summary) {
      return (
        <Alert variant="info" className="art-alert-info">
          <FaInfoCircle className="me-2" />
          No summary data available for this report.
        </Alert>
      );
    }
    
    return (
      <Row className="g-3 mb-4 art-summary-row">
        {Object.entries(reportData.summary).map(([key, value], index) => {
          // Skip internal fields
          if (['filterApplied', 'filterType'].includes(key)) return null;
          
          // Format display name
          const displayName = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/^./, str => str.toUpperCase());
            
          // Format value
          let formattedValue;
          if (typeof value === 'number') {
            if (key.toLowerCase().includes('sales') || 
                key.toLowerCase().includes('revenue') ||
                key.toLowerCase().includes('amount')) {
              formattedValue = formatCurrency(value);
            } else {
              formattedValue = formatNumber(value);
            }
          } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
            if (key.toLowerCase().includes('sales') || 
                key.toLowerCase().includes('revenue') ||
                key.toLowerCase().includes('amount')) {
              formattedValue = formatCurrency(parseFloat(value));
            } else {
              formattedValue = formatNumber(parseFloat(value));
            }
          } else {
            formattedValue = value;
          }
          
          return (
            <Col md={4} sm={6} key={index}>
              <Card className="art-summary-card h-100" style={{borderLeftColor: currentColors.primary}}>
                <Card.Body className="p-3 d-flex flex-column align-items-center text-center">
                  <h5 className="mb-1 art-summary-value" style={{color: currentColors.primary}}>{formattedValue}</h5>
                  <p className="mb-0 small text-muted art-summary-label">{displayName}</p>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };
  
  // Render report data table
  const renderDataTable = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      return (
        <Alert variant="info" className="art-alert-info">
          <FaInfoCircle className="me-2" />
          No data available for this report.
        </Alert>
      );
    }
    
    // Get table headers (excluding any internal fields)
    const excludeFields = ['id', 'artisan_id'];
    const headers = Object.keys(reportData.data[0])
      .filter(key => !excludeFields.includes(key.toLowerCase()));
    
    return (
      <div className="table-responsive art-table-container">
        <Table striped hover bordered className="art-data-table">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="art-table-header">
                  {header.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.data.map((row, rowIndex) => (
              <tr key={rowIndex} className="art-table-row">
                {headers.map((header, colIndex) => {
                  let cellValue = row[header];
                  
                  // Format cell values based on content
                  if (header.toLowerCase().includes('date') && cellValue) {
                    cellValue = formatDate(cellValue);
                  } else if (header.toLowerCase() === 'status') {
                    // Color-code status badges
                    let variant;
                    switch(String(cellValue).toLowerCase()) {
                      case 'completed':
                      case 'delivered':
                        variant = 'success';
                        break;
                      case 'processing':
                      case 'in progress':
                        variant = 'primary';
                        break;
                      case 'pending':
                      case 'on hold':
                        variant = 'warning';
                        break;
                      case 'cancelled':
                        variant = 'danger';
                        break;
                      default:
                        variant = 'secondary';
                    }
                    
                    cellValue = <Badge bg={variant} className="art-status-badge">{cellValue}</Badge>;
                  } else if (header.toLowerCase().includes('amount') || 
                             header.toLowerCase().includes('price') ||
                             header.toLowerCase().includes('sales') ||
                             header.toLowerCase().includes('revenue')) {
                    // Format currency values
                    if (!isNaN(parseFloat(cellValue))) {
                      cellValue = formatCurrency(parseFloat(cellValue));
                    }
                  } else if (typeof cellValue === 'number' || 
                             (typeof cellValue === 'string' && !isNaN(parseFloat(cellValue)))) {
                    // Format numbers with thousands separators
                    if (typeof cellValue === 'string') {
                      cellValue = formatNumber(parseFloat(cellValue));
                    } else {
                      cellValue = formatNumber(cellValue);
                    }
                  }
                  
                  return <td key={colIndex} className="art-table-cell">{cellValue ?? '-'}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  };
  
  return (
    <div className="art-report-view-container" style={{height: '100%', overflowY: 'auto'}}>
      {/* Report Header */}
      <Card className="mb-3 shadow-sm art-report-header-card">
        <Card.Header 
          className="bg-white py-3 d-flex justify-content-between align-items-center art-report-header"
          style={{borderBottom: `2px solid ${currentColors.primary}30`}}
        >
          <div className="d-flex align-items-center">
            <Button 
              variant="outline-secondary" 
              size="sm"
              className="me-3 d-flex align-items-center justify-content-center art-back-btn"
              onClick={onBackClick}
              aria-label="Back"
            >
              <FaArrowLeft />
            </Button>
            
            <div className="art-header-title-container">
              <h4 className="mb-0 art-report-title" style={{color: currentColors.primary}}>{getReportTitle()}</h4>
              <small className="text-muted art-date-range">
                {formatDate(dateRange?.startDate)} - {formatDate(dateRange?.endDate)}
              </small>
            </div>
          </div>
          
          <div className="d-flex art-header-actions">
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="me-2 d-flex align-items-center art-print-btn"
              onClick={handlePrint}
            >
              <FaPrint className="me-1" /> Print
            </Button>
            
            <div className="dropdown d-inline-block art-export-dropdown">
              <Button 
                variant="primary" 
                size="sm" 
                className="dropdown-toggle d-flex align-items-center art-export-btn"
                id="artExportDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{
                  backgroundColor: currentColors.primary,
                  borderColor: currentColors.primary
                }}
              >
                <FaCloudDownloadAlt className="me-1" /> Export
              </Button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="artExportDropdown">
                <li>
                  <button 
                    className="dropdown-item d-flex align-items-center art-export-pdf-btn" 
                    onClick={handleExportPdf}
                    disabled={loading}
                  >
                    <FaFilePdf className="me-2" /> Export as PDF
                  </button>
                </li>
                <li>
                  <button 
                    className="dropdown-item d-flex align-items-center art-export-json-btn" 
                    onClick={handleDownloadJson}
                  >
                    <FaFileCode className="me-2" /> Export Raw Data (JSON)
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </Card.Header>
      </Card>
      
      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-3 art-error-alert">
          <FaInfoCircle className="me-2" />
          {error}
        </Alert>
      )}
      
      {/* Report Tabs Navigation */}
      <Nav 
        variant="tabs" 
        activeKey={activeKey} 
        onSelect={(k) => setActiveKey(k)}
        className="mb-3 art-report-tabs"
      >
        <Nav.Item>
          <Nav.Link 
            eventKey="dashboard"
            className="d-flex align-items-center art-nav-link"
            style={{
              borderBottomColor: activeKey === 'dashboard' ? currentColors.primary : 'transparent',
              color: activeKey === 'dashboard' ? currentColors.primary : 'inherit'
            }}
          >
            <FaChartPie className="me-2" /> Dashboard
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            eventKey="charts"
            className="d-flex align-items-center art-nav-link"
            style={{
              borderBottomColor: activeKey === 'charts' ? currentColors.primary : 'transparent',
              color: activeKey === 'charts' ? currentColors.primary : 'inherit'
            }}
          >
            <FaChartBar className="me-2" /> Charts
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            eventKey="data"
            className="d-flex align-items-center art-nav-link"
            style={{
              borderBottomColor: activeKey === 'data' ? currentColors.primary : 'transparent',
              color: activeKey === 'data' ? currentColors.primary : 'inherit'
            }}
          >
            <FaTable className="me-2" /> Data Table
          </Nav.Link>
        </Nav.Item>
      </Nav>
      
      {/* Tab Content */}
      <Tab.Content className="art-tab-content">
        {/* Dashboard Tab */}
        <Tab.Pane active={activeKey === 'dashboard'} className="art-dashboard-tab">
          <h5 className="mb-3 art-section-title" style={{color: currentColors.primary}}>Report Summary</h5>
          {renderSummaryCards()}
          
          <div className="art-line-separator" style={{height: '1px', backgroundColor: '#e9ecef', margin: '20px 0'}}></div>
          
          <Row className="mb-4 art-chart-row">
            {/* Bar Chart */}
            <Col lg={6} className="mb-4">
              <Card className="shadow-sm h-100 art-chart-card">
                <Card.Header className="bg-white art-chart-header" style={{borderBottom: `2px solid ${currentColors.primary}20`}}>
                  <h5 className="mb-0 art-chart-title" style={{color: currentColors.primary}}>
                    {reportType === 'orders' ? 'Top Products' : 
                     reportType === 'products' ? 'Inventory Levels' : 
                     'Completed Orders'}
                  </h5>
                </Card.Header>
                <Card.Body className="art-chart-body">
                  {loading ? (
                    <div className="text-center py-5 art-chart-loading">
                      <Spinner animation="border" style={{color: currentColors.primary}} />
                    </div>
                  ) : (
                    <div style={{height: '300px'}} className="art-chart-container">
                      <canvas ref={barChartRef} className="art-bar-chart"></canvas>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            {/* Pie Chart */}
            <Col lg={6} className="mb-4">
              <Card className="shadow-sm h-100 art-chart-card">
                <Card.Header className="bg-white art-chart-header" style={{borderBottom: `2px solid ${currentColors.primary}20`}}>
                  <h5 className="mb-0 art-chart-title" style={{color: currentColors.primary}}>
                    {reportType === 'orders' ? 'Order Status Distribution' : 
                     reportType === 'products' ? 'Product Categories' : 
                     'Delivery Performance'}
                  </h5>
                </Card.Header>
                <Card.Body className="art-chart-body">
                  {loading ? (
                    <div className="text-center py-5 art-chart-loading">
                      <Spinner animation="border" style={{color: currentColors.primary}} />
                    </div>
                  ) : (
                    <div style={{height: '300px'}} className="art-chart-container">
                      <canvas ref={pieChartRef} className="art-pie-chart"></canvas>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Line Chart - Full width */}
          <Card className="shadow-sm mb-4 art-chart-card">
            <Card.Header className="bg-white art-chart-header" style={{borderBottom: `2px solid ${currentColors.primary}20`}}>
              <h5 className="mb-0 art-chart-title" style={{color: currentColors.primary}}>
                {reportType === 'orders' ? 'Sales Trend' : 
                 reportType === 'products' ? 'Product Sales Trend' : 
                 'Rating Trend'}
              </h5>
            </Card.Header>
            <Card.Body className="art-chart-body">
              {loading ? (
                <div className="text-center py-5 art-chart-loading">
                  <Spinner animation="border" style={{color: currentColors.primary}} />
                </div>
              ) : (
                <div style={{height: '300px'}} className="art-chart-container">
                  <canvas ref={lineChartRef} className="art-line-chart"></canvas>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab.Pane>
        
        {/* Charts Tab */}
        <Tab.Pane active={activeKey === 'charts'} className="art-charts-tab">
          <h5 className="mb-3 art-section-title" style={{color: currentColors.primary}}>Detailed Charts</h5>
          
          {/* Line Chart - Full width */}
          <Card className="shadow-sm mb-4 art-chart-card">
            <Card.Header className="bg-white art-chart-header" style={{borderBottom: `2px solid ${currentColors.primary}20`}}>
              <h5 className="mb-0 art-chart-title" style={{color: currentColors.primary}}>
                {reportType === 'orders' ? 'Sales Trend' : 
                 reportType === 'products' ? 'Product Sales Trend' : 
                 'Rating Trend'}
              </h5>
            </Card.Header>
            <Card.Body className="art-chart-body">
              {loading ? (
                <div className="text-center py-5 art-chart-loading">
                  <Spinner animation="border" style={{color: currentColors.primary}} />
                </div>
              ) : (
                <div style={{height: '400px'}} className="art-chart-container">
                  <canvas ref={lineChartRef} className="art-line-chart-large"></canvas>
                </div>
              )}
            </Card.Body>
          </Card>
          
          <Row className="art-chart-row">
            {/* Bar Chart */}
            <Col lg={6} className="mb-4">
              <Card className="shadow-sm h-100 art-chart-card">
                <Card.Header className="bg-white art-chart-header" style={{borderBottom: `2px solid ${currentColors.primary}20`}}>
                  <h5 className="mb-0 art-chart-title" style={{color: currentColors.primary}}>
                    {reportType === 'orders' ? 'Top Products' : 
                     reportType === 'products' ? 'Inventory Levels' : 
                     'Completed Orders'}
                  </h5>
                </Card.Header>
                <Card.Body className="art-chart-body">
                  {loading ? (
                    <div className="text-center py-5 art-chart-loading">
                      <Spinner animation="border" style={{color: currentColors.primary}} />
                    </div>
                  ) : (
                    <div style={{height: '350px'}} className="art-chart-container">
                      <canvas ref={barChartRef} className="art-bar-chart-large"></canvas>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            {/* Pie Chart */}
            <Col lg={6} className="mb-4">
              <Card className="shadow-sm h-100 art-chart-card">
                <Card.Header className="bg-white art-chart-header" style={{borderBottom: `2px solid ${currentColors.primary}20`}}>
                  <h5 className="mb-0 art-chart-title" style={{color: currentColors.primary}}>
                    {reportType === 'orders' ? 'Order Status Distribution' : 
                     reportType === 'products' ? 'Product Categories' : 
                     'Delivery Performance'}
                  </h5>
                </Card.Header>
                <Card.Body className="art-chart-body">
                  {loading ? (
                    <div className="text-center py-5 art-chart-loading">
                      <Spinner animation="border" style={{color: currentColors.primary}} />
                    </div>
                  ) : (
                    <div style={{height: '350px'}} className="art-chart-container">
                      <canvas ref={pieChartRef} className="art-pie-chart-large"></canvas>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab.Pane>
        
        {/* Data Table Tab */}
        <Tab.Pane active={activeKey === 'data'} className="art-data-tab">
          <h5 className="mb-3 art-section-title" style={{color: currentColors.primary}}>Detailed Data</h5>
          
          <Card className="shadow-sm art-data-card">
            <Card.Header className="bg-white art-data-header" style={{borderBottom: `2px solid ${currentColors.primary}20`}}>
              <h5 className="mb-0 art-data-title" style={{color: currentColors.primary}}>
                {getReportTitle()} - Raw Data
              </h5>
            </Card.Header>
            <Card.Body className="p-0 art-data-body">
              {loading ? (
                <div className="text-center py-5 art-data-loading">
                  <Spinner animation="border" style={{color: currentColors.primary}} />
                </div>
              ) : (
                renderDataTable()
              )}
            </Card.Body>
          </Card>
        </Tab.Pane>
      </Tab.Content>
      
      {/* Footer Info */}
      <div className="text-muted small text-center mt-4 mb-4 art-report-footer">
        <p className="mb-0">Report generated on {formatDate(new Date(), true)}</p>
      </div>
    </div>
  );
};

export default ArtisanReportViewForm;
