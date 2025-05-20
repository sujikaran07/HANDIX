import React, { useState, useEffect, useRef } from 'react';
import { Card, Container, Row, Col, Button, Alert, Spinner, Badge, Modal, Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, faChartPie, faChartBar, faTable, 
  faFileDownload, faPrint, faInfoCircle, faExclamationTriangle,
  faExclamation, faFilePdf, faFileCode, faArrowLeft, 
  faBoxOpen, faTools, faTruck, faCalendarCheck
} from '@fortawesome/free-solid-svg-icons';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';
import Chart from 'chart.js/auto';
import { getArtisanChartConfig, prepareBarChartData, preparePieChartData, prepareLineChartData } from '../../utils/reportChartHelper';
import '../../styles/artisan/ArtisanReportViewForm.css';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Report type colors and icons mapping
const reportTypeInfo = {
  orders: {
    title: 'Orders Report',
    icon: faChartLine,
    color: '#0d6efd',
    gradientColor: '#0a58ca'
  },
  products: {
    title: 'Products Report',
    icon: faBoxOpen,
    color: '#198754',
    gradientColor: '#146c43'
  },
  assignments: {
    title: 'Order Assignments',
    icon: faTruck,
    color: '#6f42c1',
    gradientColor: '#5a32a3'
  },
  inventory: {
    title: 'Customizable Inventory',
    icon: faTools,
    color: '#fd7e14',
    gradientColor: '#ca6510'
  },
  'custom-performance': {
    title: 'Custom Products Performance',
    icon: faCalendarCheck,
    color: '#20c997',
    gradientColor: '#17a47b'
  },
  performance: {
    title: 'Performance Report',
    icon: faChartPie,
    color: '#ffc107',
    gradientColor: '#cc9a06'
  }
};

const ArtisanReportViewForm = ({ reportData, reportType, dateRange, onBackClick, appliedFilters = [] }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartConfig, setChartConfig] = useState({
    showBarChart: true,
    showPieChart: true,
    showLineChart: true,
    showTables: true,
    showSummary: true
  });
  const [dashboardCharts, setDashboardCharts] = useState([]);
  
  // Refs for chart instances
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const lineChartRef = useRef(null);
  
  // Chart instances
  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);
  const lineChartInstance = useRef(null);

  // Get report title based on type
  const getReportTitle = () => {
    return reportTypeInfo[reportType]?.title || 'Report';
  };
  
  // Get report icon based on type
  const getReportIcon = () => {
    return reportTypeInfo[reportType]?.icon || faChartLine;
  };
  
  // Get report color based on type
  const getReportColor = () => {
    return reportTypeInfo[reportType]?.color || '#0d6efd';
  };

  // Determine which charts to show based on report type
  useEffect(() => {
    const config = getArtisanChartConfig(reportType, reportData);
    setChartConfig(config);
    setDashboardCharts(config.dashboardCharts || []);
  }, [reportType, reportData]);

  // Initialize charts when reportData changes
  useEffect(() => {
    // Check explicitly for the isEmptyResponse flag first
    if (reportData?.isEmptyResponse === true) {
      console.log('Empty response detected, skipping chart initialization');
      return;
    }
    
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      // Don't try to initialize charts if there's no data
      return;
    }
    
    // Clean up any existing charts
    if (barChartInstance.current) {
      barChartInstance.current.destroy();
      barChartInstance.current = null;
    }
    if (pieChartInstance.current) {
      pieChartInstance.current.destroy();
      pieChartInstance.current = null;
    }
    if (lineChartInstance.current) {
      lineChartInstance.current.destroy();
      lineChartInstance.current = null;
    }
    
    // Initialize charts if we have data and the canvas elements exist
    if (barChartRef.current && chartConfig.showBarChart) {
      initBarChart();
    }
    if (pieChartRef.current && chartConfig.showPieChart) {
      initPieChart();
    }
    if (lineChartRef.current && chartConfig.showLineChart) {
      initLineChart();
    }
    
    // Clean up on unmount
    return () => {
      if (barChartInstance.current) barChartInstance.current.destroy();
      if (pieChartInstance.current) pieChartInstance.current.destroy();
      if (lineChartInstance.current) barChartInstance.current.destroy();
    };
  }, [reportData, activeTab, chartConfig]);

  // Initialize bar chart
  const initBarChart = () => {
    const ctx = barChartRef.current.getContext('2d');
    const chartData = prepareBarChartData(reportType, reportData.data, true); // true for artisan specific
    const reportColor = getReportColor();
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, reportColor);
    gradient.addColorStop(1, reportColor + '80');
    
    barChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: chartConfig.barChartTitle || 'Values',
          data: chartData.values,
          backgroundColor: chartData.colors || gradient,
          borderColor: reportColor,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
        },
        plugins: {
          legend: {
            display: false
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
        }
      }
    });
  };

  // Initialize pie chart
  const initPieChart = () => {
    const ctx = pieChartRef.current.getContext('2d');
    const chartData = preparePieChartData(reportType, reportData.data, true); // true for artisan specific
    const reportColor = getReportColor();
    
    // Generate color palette based on report type
    const colorPalette = [
      reportColor,
      reportColor + 'CC',
      reportColor + '99',
      reportColor + '66',
      '#6c757d',
      '#495057'
    ];
    
    pieChartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: chartData.map(item => item.label),
        datasets: [{
          data: chartData.map(item => item.value),
          backgroundColor: chartData.map((_, index) => colorPalette[index % colorPalette.length]),
          borderColor: '#fff',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 15,
              padding: 15
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const item = chartData[context.dataIndex];
                const value = ['orders', 'custom-performance', 'assignments'].includes(reportType) ? 
                  formatCurrency(item.value) : formatNumber(item.value);
                return `${item.label}: ${value} (${item.percentage.toFixed(1)}%)`;
              }
            }
          },
          title: {
            display: true,
            text: chartConfig.pieChartTitle || 'Distribution',
            color: reportColor,
            font: {
              size: 16
            }
          }
        }
      }
    });
  };

  // Initialize line chart
  const initLineChart = () => {
    const ctx = lineChartRef.current.getContext('2d');
    const chartData = prepareLineChartData(reportType, reportData, true); // true for artisan specific
    const reportColor = getReportColor();
    
    // Create gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, reportColor + '40');
    gradient.addColorStop(1, reportColor + '05');
    
    lineChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: chartData.title,
          data: chartData.values,
          backgroundColor: gradient,
          borderColor: reportColor,
          pointBackgroundColor: reportColor,
          pointBorderColor: '#fff',
          pointRadius: 4,
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
        },
        plugins: {
          legend: {
            display: false
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
          },
          title: {
            display: true,
            text: chartConfig.lineChartTitle || chartData.title,
            color: reportColor,
            font: {
              size: 16
            }
          }
        }
      }
    });
  };

  // Helper function to detect currency fields
  const shouldUseCurrency = (key) => {
    const fieldName = key.toLowerCase();
    
    // Check for currency-related field name patterns
    return fieldName.includes('sales') || 
           fieldName.includes('revenue') || 
           fieldName.includes('amount') ||
           fieldName.includes('price') || 
           fieldName.includes('value') ||
           fieldName.includes('spent');
  };

  // Format value based on field name
  const formatValue = (value, field) => {
    if (value === null || value === undefined) return '-';
    
    // Check if value is a date
    if (field && field.toLowerCase().includes('date')) {
      return formatDate(value);
    }
    
    // Check if it's a number
    if (typeof value === 'number' || !isNaN(parseFloat(value))) {
      if (field && shouldUseCurrency(field)) {
        return formatCurrency(value);
      }
      return formatNumber(value);
    }
    
    return String(value);
  };

  // Render summary cards with report colors
  const renderSummaryCards = () => {
    if (!reportData || !reportData.summary) {
      return (
        <Alert variant="info">
          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
          No summary data available for this report.
        </Alert>
      );
    }
    
    const summary = reportData.summary;
    const reportColor = getReportColor();
    
    // Exclude fields that shouldn't be displayed as cards
    const excludeFields = ['filterApplied', 'filterType'];
    
    return (
      <Row className="g-3 mb-4">
        {Object.entries(summary).map(([key, summaryValue], index) => {
          // Skip fields in exclude list
          if (excludeFields.includes(key)) return null;
          
          // Format the display name
          const displayName = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/^./, str => str.toUpperCase());
          
          // Format the value based on the key name
          let formattedValue;
          if (typeof summaryValue === 'number') {
            if (shouldUseCurrency(key)) {
              formattedValue = formatCurrency(summaryValue);
            } else {
              formattedValue = formatNumber(summaryValue);
            }
          } else {
            formattedValue = summaryValue.toString();
          }
          
          // Add special styling for certain values (like low stock or urgent orders)
          let valueStyle = { color: reportColor };
          let badgeVariant = null;
          
          if (key === 'lowStockProducts' && summaryValue > 0) {
            valueStyle.color = '#ffc107';
            badgeVariant = 'warning';
          } else if (key === 'outOfStockProducts' && summaryValue > 0) {
            valueStyle.color = '#dc3545';
            badgeVariant = 'danger';
          } else if (key === 'urgentOrders' && summaryValue > 0) {
            valueStyle.color = '#dc3545';
            badgeVariant = 'danger';
          }
          
          // Card style with gradient border
          const cardStyle = {
            borderLeft: `4px solid ${reportColor}`,
            borderRadius: '0.5rem',
            transition: 'transform 0.2s',
            boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)'
          };

          return (
            <Col md={4} sm={6} key={index}>
              <Card className="h-100" style={cardStyle}>
                <Card.Body className="p-3">
                  <div className="d-flex flex-column align-items-center text-center">
                    <h3 style={valueStyle} className="mb-1">
                      {formattedValue}
                      {badgeVariant && (
                        <Badge bg={badgeVariant} className="ms-2" pill>!</Badge>
                      )}
                    </h3>
                    <p className="text-muted mb-0">{displayName}</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  // Add this component after the renderSummaryCards method
  // This will display the specific cards for order assignments

  const renderOrderAssignmentCards = () => {
    if (!reportData || !reportData.summary) {
      return null;
    }
    
    const summary = reportData.summary;
    const reportColor = getReportColor();
    
    // Only show for orders report type
    if (reportType !== 'orders') return null;
    
    return (
      <Row className="g-3 mb-4">
        {/* Assigned Orders Card */}
        <Col md={4} sm={6}>
          <Card className="h-100" style={{
            borderLeft: `4px solid ${reportColor}`,
            borderRadius: '0.5rem',
            transition: 'transform 0.2s',
            boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)'
          }}>
            <Card.Body className="p-3">
              <div className="d-flex flex-column align-items-center text-center">
                <h3 style={{ color: reportColor }} className="mb-1">
                  {formatNumber(summary.assignedOrderCount || 0)}
                </h3>
                <p className="text-muted mb-0">Assigned Orders</p>
                <div className="mt-2 small text-muted">
                  Orders specifically assigned to you
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Customized Orders Card */}
        <Col md={4} sm={6}>
          <Card className="h-100" style={{
            borderLeft: `4px solid #20c997`,
            borderRadius: '0.5rem',
            transition: 'transform 0.2s',
            boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)'
          }}>
            <Card.Body className="p-3">
              <div className="d-flex flex-column align-items-center text-center">
                <h3 style={{ color: '#20c997' }} className="mb-1">
                  {formatNumber(summary.customizedCount || 0)}
                </h3>
                <p className="text-muted mb-0">Customized Orders</p>
                <div className="mt-2 small text-muted">
                  Orders with customization requests
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Total Value Card */}
        <Col md={4} sm={6}>
          <Card className="h-100" style={{
            borderLeft: `4px solid #fd7e14`,
            borderRadius: '0.5rem',
            transition: 'transform 0.2s',
            boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)'
          }}>
            <Card.Body className="p-3">
              <div className="d-flex flex-column align-items-center text-center">
                <h3 style={{ color: '#fd7e14' }} className="mb-1">
                  {formatCurrency(summary.assignedOrdersValue || 0)}
                </h3>
                <p className="text-muted mb-0">Assigned Orders Value</p>
                <div className="mt-2 small text-muted">
                  Total value of your assigned orders
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  // Render data table
  const renderDataTable = () => {
    // First check for isEmptyResponse flag
    if (reportData?.isEmptyResponse === true || !reportData || !reportData.data || reportData.data.length === 0) {
      return (
        <Alert variant="info">
          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
          {reportData?.message || 'No data available for this report.'}
        </Alert>
      );
    }
    
    const data = reportData.data;
    
    // Exclude fields that shouldn't be displayed in the table
    const excludeFields = ['id', 'entry_id', 'e_id', 'artisan_id', 'customization_requests'];
    
    // Get column headers excluding excluded fields
    const headers = Object.keys(data[0]).filter(key => !excludeFields.includes(key));
    
    return (
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>
                  {header.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header, colIndex) => {
                  // Format cell values based on header name
                  let cellValue = row[header];
                  
                  if (header.toLowerCase().includes('date')) {
                    cellValue = formatDate(cellValue);
                  } else if (header.toLowerCase().includes('days_remaining')) {
                    if (cellValue !== null) {
                      const daysNum = parseInt(cellValue);
                      const textClass = daysNum <= 2 ? 'text-danger' : 
                                      daysNum <= 5 ? 'text-warning' : 'text-success';
                      cellValue = <span className={textClass}>{daysNum} days</span>;
                    }
                  } else if (header === 'order_status') {
                    const statusClass = getStatusClass(cellValue);
                    cellValue = <Badge bg={statusClass}>{cellValue}</Badge>;
                  } else if (header === 'is_customized') {
                    cellValue = cellValue ? <Badge bg="info">Yes</Badge> : 'No';
                  } else {
                    cellValue = formatValue(cellValue, header);
                  }
                  
                  return <td key={colIndex}>{cellValue}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Helper function to get badge color for order status
  const getStatusClass = (status) => {
    if (!status) return 'secondary';
    
    switch (status.toLowerCase()) {
      case 'processing': return 'primary';
      case 'in production': return 'info';
      case 'ready for shipping': return 'warning';
      case 'shipped': return 'success';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  // Handle print function
  const handlePrint = () => {
    window.print();
  };
  
  // Handle download function
  const handleDownload = () => {
    if (!reportData) return;
    
    // Create a downloadable JSON file
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(reportData, null, 2)], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = `${getReportTitle()}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Add function to check if a filter is being applied
  const isFilterApplied = () => {
    if (reportData && reportData.appliedFilters) {
      const filters = reportData.appliedFilters;
      return Object.keys(filters).some(key => 
        filters[key] !== '' && 
        filters[key] !== null && 
        (Array.isArray(filters[key]) ? filters[key].length > 0 : true)
      );
    }
    return appliedFilters && appliedFilters.length > 0;
  };

  // Check if graphs should be shown
  const shouldShowGraphs = () => {
    // First check for isEmptyResponse flag
    if (reportData?.isEmptyResponse === true) {
      return false;
    }

    if (reportData && reportData.appliedFilters) {
      return reportData.appliedFilters.includeGraphs !== false;
    }
    return true;
  };

  // Handle PDF export
  const handleExportPDF = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Prepare the export data
      const exportData = {
        reportData: reportData,
        reportType: reportType,
        dateRange: dateRange,
        filters: {
          ...(reportData.appliedFilters || {}),
          includeGraphs: true
        },
        artisanId: reportData.artisanId,
        pdfOptions: {
          paperSize: 'a4', 
          orientation: 'portrait',
          includeHeader: true,
          includeFooter: true,
          includeCharts: true,
          includeDataTable: true
        }
      };
      
      // Send to API for PDF generation
      const response = await axios.post(`${API_BASE_URL}/api/artisan/report/export/pdf`, exportData);
      
      if (response.data.success) {
        // Download the generated PDF
        const downloadUrl = `${API_BASE_URL}/api/artisan/report/download/${response.data.fileName}`;
        
        // Create a download link and trigger click
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${getReportTitle()}_${formatDate(new Date()).replace(/\//g, '-')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        showNotification('Report PDF exported successfully');
      } else {
        setError('Failed to generate PDF report');
        showNotification('Failed to export PDF report', 'danger');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setError(error.message || 'Failed to export PDF report');
      showNotification('Error exporting PDF report', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to show PDF options
  const [showPdfOptions, setShowPdfOptions] = useState(false);
  const [pdfOptions, setPdfOptions] = useState({
    paperSize: 'a4',
    orientation: 'portrait',
    includeCharts: true,
    includeDataTable: true,
    maxTableRows: 100
  });

  // PDF export options modal
  const renderPdfOptionsModal = () => {
    const reportColor = getReportColor();
    
    return (
      <Modal show={showPdfOptions} onHide={() => setShowPdfOptions(false)}>
        <Modal.Header closeButton style={{ backgroundColor: reportColor + '10' }}>
          <Modal.Title style={{ color: reportColor }}>PDF Export Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Paper Size</Form.Label>
              <Form.Select 
                value={pdfOptions.paperSize}
                onChange={(e) => setPdfOptions({...pdfOptions, paperSize: e.target.value})}
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
                <option value="legal">Legal</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Orientation</Form.Label>
              <Form.Select 
                value={pdfOptions.orientation}
                onChange={(e) => setPdfOptions({...pdfOptions, orientation: e.target.value})}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="include-charts"
                label="Include Charts"
                checked={pdfOptions.includeCharts}
                onChange={(e) => setPdfOptions({...pdfOptions, includeCharts: e.target.checked})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="include-data-table"
                label="Include Data Table"
                checked={pdfOptions.includeDataTable}
                onChange={(e) => setPdfOptions({...pdfOptions, includeDataTable: e.target.checked})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Max Table Rows</Form.Label>
              <Form.Control 
                type="number"
                min="10"
                max="500"
                value={pdfOptions.maxTableRows}
                onChange={(e) => setPdfOptions({
                  ...pdfOptions, 
                  maxTableRows: Math.max(10, Math.min(500, parseInt(e.target.value) || 100))
                })}
              />
              <Form.Text className="text-muted">
                Maximum number of rows to include in data table (10-500)
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPdfOptions(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              setShowPdfOptions(false);
              handleExportPDFWithOptions();
            }}
            style={{
              backgroundColor: reportColor,
              borderColor: reportColor
            }}
          >
            Export PDF
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  // Function to handle PDF export with configured options
  const handleExportPDFWithOptions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Prepare the export data with options
      const exportData = {
        reportData: reportData,
        reportType: reportType,
        dateRange: dateRange,
        filters: {
          ...(reportData.appliedFilters || {}),
          includeGraphs: true
        },
        artisanId: reportData.artisanId,
        pdfOptions: pdfOptions
      };
      
      // Send to API for PDF generation
      const response = await axios.post(`${API_BASE_URL}/api/artisan/report/export/pdf`, exportData);
      
      if (response.data.success) {
        // Download the generated PDF
        const downloadUrl = `${API_BASE_URL}/api/artisan/report/download/${response.data.fileName}`;
        
        // Create a download link and trigger click
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${getReportTitle()}_${formatDate(new Date()).replace(/\//g, '-')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        showNotification('PDF exported successfully');
      } else {
        setError('Failed to generate PDF report');
        showNotification('Failed to export PDF report', 'danger');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setError(error.message || 'Failed to export PDF');
      showNotification('Error exporting PDF report', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Simple notification function
  const showNotification = (message, type = 'success') => {
    // Create a bootstrap alert that auto-dismisses
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
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
  
  // Render alerts for specific report types
  const renderSpecialAlerts = () => {
    const reportColor = getReportColor();
    
    // Low stock alert for inventory report
    if (reportType === 'inventory' && reportData && reportData.summary) {
      const { lowStockProducts, outOfStockProducts } = reportData.summary;
      
      if (outOfStockProducts > 0) {
        return (
          <Alert variant="danger" className="mb-4">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <FontAwesomeIcon icon={faExclamationTriangle} size="lg" />
              </div>
              <div>
                <h5 className="alert-heading mb-1">Stock Alert</h5>
                <p className="mb-0">
                  <strong>{outOfStockProducts}</strong> customizable products are out of stock. 
                  {lowStockProducts > 0 && <span> Additionally, <strong>{lowStockProducts}</strong> products are running low.</span>}
                </p>
              </div>
            </div>
          </Alert>
        );
      } else if (lowStockProducts > 0) {
        return (
          <Alert variant="warning" className="mb-4">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <FontAwesomeIcon icon={faExclamation} size="lg" />
              </div>
              <div>
                <h5 className="alert-heading mb-1">Low Stock Warning</h5>
                <p className="mb-0"><strong>{lowStockProducts}</strong> customizable products are running low on stock.</p>
              </div>
            </div>
          </Alert>
        );
      }
    }
    
    // Urgent orders alert for assignments report
    if (reportType === 'assignments' && reportData && reportData.summary) {
      const { urgentOrders } = reportData.summary;
      
      if (urgentOrders > 0) {
        return (
          <Alert variant="warning" className="mb-4" style={{ borderLeft: `4px solid ${reportColor}` }}>
            <div className="d-flex align-items-center">
              <div className="me-3">
                <FontAwesomeIcon icon={faTruck} size="lg" style={{ color: reportColor }} />
              </div>
              <div>
                <h5 className="alert-heading mb-1" style={{ color: reportColor }}>Urgent Orders</h5>
                <p className="mb-0">You have <strong>{urgentOrders}</strong> orders due within the next 3 days.</p>
              </div>
            </div>
          </Alert>
        );
      }
    }
    
    return null;
  };

  const reportColor = getReportColor();
  
  return (
    <div className="artisan-report-view-form pb-4" style={{
      overflowY: 'auto',
      height: '100%'
    }}>
      {/* Report Header */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center bg-white py-3">
          <div className="d-flex align-items-center">
            <div className="report-icon me-3" style={{ 
              backgroundColor: reportColor + '20',
              color: reportColor 
            }}>
              <FontAwesomeIcon icon={getReportIcon()} />
            </div>
            <div>
              <h4 className="mb-0" style={{ color: reportColor }}>{getReportTitle()}</h4>
              <p className="text-muted mb-0 small">
                {formatDate(dateRange?.startDate)} - {formatDate(dateRange?.endDate)}
              </p>
            </div>
          </div>
          <div>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="me-2" 
              onClick={onBackClick}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Back
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="me-2" 
              onClick={handlePrint}
            >
              <FontAwesomeIcon icon={faPrint} className="me-1" /> Print
            </Button>
          </div>
        </Card.Header>
      </Card>
      
      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          {error}
        </Alert>
      )}
      
      {/* Report Navigation */}
      <div className="nav nav-tabs mb-4">
        <div className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            style={activeTab === 'dashboard' ? {
              borderBottom: `3px solid ${reportColor}`,
              color: reportColor
            } : {}}
          >
            <FontAwesomeIcon icon={faChartPie} className="me-2" />
            Dashboard
          </button>
        </div>
        <div className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'charts' ? 'active' : ''}`}
            onClick={() => setActiveTab('charts')}
            style={activeTab === 'charts' ? {
              borderBottom: `3px solid ${reportColor}`,
              color: reportColor
            } : {}}
          >
            <FontAwesomeIcon icon={faChartBar} className="me-2" />
            Charts
          </button>
        </div>
        <div className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
            style={activeTab === 'data' ? {
              borderBottom: `3px solid ${reportColor}`,
              color: reportColor
            } : {}}
          >
            <FontAwesomeIcon icon={faTable} className="me-2" />
            Data Table
          </button>
        </div>
      </div>
      
      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          <h5 className="mb-3" style={{ color: reportColor }}>Report Summary</h5>
          
          {/* Special alerts for specific report types */}
          {renderSpecialAlerts()}
          
          {/* Order Assignment Cards for orders report type */}
          {reportType === 'orders' && renderOrderAssignmentCards()}
          
          {/* Show message if empty response */}
          {reportData?.isEmptyResponse === true && (
            <Alert variant="info" className="mb-4">
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              <strong>No data available.</strong> {reportData.message || 'There is no data matching your criteria.'}
            </Alert>
          )}
          
          {/* Only show summary cards if not empty response */}
          {!reportData?.isEmptyResponse && chartConfig.showSummary && renderSummaryCards()}
          
          {shouldShowGraphs() && (
            <Row className="mb-4">
              {dashboardCharts.includes('barChart') && chartConfig.showBarChart && (
                <Col md={dashboardCharts.length > 1 ? 6 : 12}>
                  <Card className="h-100 shadow-sm">
                    <Card.Header className="bg-white" style={{ borderBottom: `2px solid ${reportColor}20` }}>
                      <h5 className="mb-0" style={{ color: reportColor }}>{chartConfig.barChartTitle || 'Analysis'}</h5>
                    </Card.Header>
                    <Card.Body>
                      {isLoading ? (
                        <div className="text-center py-5">
                          <Spinner animation="border" style={{ color: reportColor }} />
                        </div>
                      ) : (
                        <div style={{height: '300px'}}>
                          <canvas ref={barChartRef}></canvas>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              )}
              
              {dashboardCharts.includes('pieChart') && chartConfig.showPieChart && (
                <Col md={dashboardCharts.length > 1 ? 6 : 12}>
                  <Card className="h-100 shadow-sm">
                    <Card.Header className="bg-white" style={{ borderBottom: `2px solid ${reportColor}20` }}>
                      <h5 className="mb-0" style={{ color: reportColor }}>{chartConfig.pieChartTitle || 'Distribution'}</h5>
                    </Card.Header>
                    <Card.Body>
                      {isLoading ? (
                        <div className="text-center py-5">
                          <Spinner animation="border" style={{ color: reportColor }} />
                        </div>
                      ) : (
                        <div style={{height: '300px'}}>
                          <canvas ref={pieChartRef}></canvas>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              )}

              {dashboardCharts.includes('lineChart') && chartConfig.showLineChart && (
                <Col md={12} className="mt-4">
                  <Card className="h-100 shadow-sm">
                    <Card.Header className="bg-white" style={{ borderBottom: `2px solid ${reportColor}20` }}>
                      <h5 className="mb-0" style={{ color: reportColor }}>{chartConfig.lineChartTitle || 'Trend Analysis'}</h5>
                    </Card.Header>
                    <Card.Body>
                      {isLoading ? (
                        <div className="text-center py-5">
                          <Spinner animation="border" style={{ color: reportColor }} />
                        </div>
                      ) : (
                        <div style={{height: '300px'}}>
                          <canvas ref={lineChartRef}></canvas>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              )}

              {dashboardCharts.length === 0 && (
                <Col>
                  <Alert variant="info">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    No charts available for this report type.
                  </Alert>
                </Col>
              )}
            </Row>
          )}
          
          {!shouldShowGraphs() && (
            <Alert variant="info" className="mb-4">
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              Graphs are hidden based on your report settings. You can enable graphs in the Advanced Options.
            </Alert>
          )}
        </>
      )}
      
      {/* Charts Tab */}
      {activeTab === 'charts' && (
        <>
          {!shouldShowGraphs() ? (
            <Alert variant="info" className="mb-4">
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              Charts are hidden based on your report settings. You can enable graphs in the Advanced Options.
            </Alert>
          ) : (
            <>
              {chartConfig.showBarChart && (
                <Row className="mb-4">
                  <Col>
                    <Card className="shadow-sm">
                      <Card.Header className="bg-white" style={{ borderBottom: `2px solid ${reportColor}20` }}>
                        <h5 className="mb-0" style={{ color: reportColor }}>{chartConfig.barChartTitle || 'Analysis'}</h5>
                      </Card.Header>
                      <Card.Body>
                        {isLoading ? (
                          <div className="text-center py-5">
                            <Spinner animation="border" style={{ color: reportColor }} />
                          </div>
                        ) : (
                          <div style={{height: '400px'}}>
                            <canvas ref={barChartRef}></canvas>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}
              
              <Row className="mb-4">
                {chartConfig.showPieChart && (
                  <Col md={chartConfig.showLineChart ? 6 : 12}>
                    <Card className="h-100 shadow-sm">
                      <Card.Header className="bg-white" style={{ borderBottom: `2px solid ${reportColor}20` }}>
                        <h5 className="mb-0" style={{ color: reportColor }}>{chartConfig.pieChartTitle || 'Distribution'}</h5>
                      </Card.Header>
                      <Card.Body>
                        {isLoading ? (
                          <div className="text-center py-5">
                            <Spinner animation="border" style={{ color: reportColor }} />
                          </div>
                        ) : (
                          <div style={{height: '300px'}}>
                            <canvas ref={pieChartRef}></canvas>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                )}
                
                {chartConfig.showLineChart && (
                  <Col md={chartConfig.showPieChart ? 6 : 12}>
                    <Card className="h-100 shadow-sm">
                      <Card.Header className="bg-white" style={{ borderBottom: `2px solid ${reportColor}20` }}>
                        <h5 className="mb-0" style={{ color: reportColor }}>{chartConfig.lineChartTitle || 'Trend Analysis'}</h5>
                      </Card.Header>
                      <Card.Body>
                        {isLoading ? (
                          <div className="text-center py-5">
                            <Spinner animation="border" style={{ color: reportColor }} />
                          </div>
                        ) : (
                          <div style={{height: '300px'}}>
                            <canvas ref={lineChartRef}></canvas>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                )}
              </Row>
              
              {!chartConfig.showBarChart && !chartConfig.showPieChart && !chartConfig.showLineChart && (
                <Alert variant="info">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  No charts are available for this report type.
                </Alert>
              )}
            </>
          )}
        </>
      )}
      
      {/* Data Tab */}
      {activeTab === 'data' && (
        <>
          <h5 className="mb-3" style={{ color: reportColor }}>Report Data</h5>
          <Card className="shadow-sm">
            <Card.Header className="bg-white" style={{ borderBottom: `2px solid ${reportColor}20` }}>
              <h5 className="mb-0" style={{ color: reportColor }}>{getReportTitle()} - Detailed Data</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {isLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" style={{ color: reportColor }} />
                </div>
              ) : (
                renderDataTable()
              )}
            </Card.Body>
          </Card>
        </>
      )}
      
      {/* Footer Info */}
      <div className="text-muted small text-center mt-4">
        <p>Report generated on {formatDate(new Date(), true)}</p>
      </div>
      
      {/* PDF Options Modal */}
      {renderPdfOptionsModal()}
    </div>
  );
};

export default ArtisanReportViewForm;
