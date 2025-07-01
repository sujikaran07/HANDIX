import React, { useState, useEffect, useRef } from 'react';
import { Card, Container, Row, Col, Button, Alert, Spinner, Badge, Modal, Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, faChartPie, faChartBar, faTable, 
  faFileDownload, faPrint, faInfoCircle, faExclamationTriangle,
  faExclamation, faFilePdf, faFileCode
} from '@fortawesome/free-solid-svg-icons';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';
import Chart from 'chart.js/auto';
import { getChartConfig, prepareBarChartData, preparePieChartData, prepareLineChartData, getReportColors } from '../../utils/reportChartHelper';
import '../../styles/admin/ReportViewForm.css';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/environment';

const ReportViewForm = ({ reportData, reportType, dateRange, onBackClick, appliedFilters = [] }) => {
  // State management for UI controls and chart configuration
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
  
  // Chart references and instances for dynamic chart management
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const lineChartRef = useRef(null);
  
  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);
  const lineChartInstance = useRef(null);

  // References for PDF export functionality
  const pdfDashboardRef = useRef(null);
  const pdfChartsRef = useRef(null);
  const pdfTableRef = useRef(null);

  // Get report title based on type
  const getReportTitle = () => {
    switch (reportType) {
      case 'sales': return 'Sales Report';
      case 'products': return 'Product Report';
      case 'customers': return 'Customer Report';
      case 'artisans': return 'Artisan Report';
      default: return 'Report';
    }
  };
  
  // Get report icon based on type
  const getReportIcon = () => {
    switch (reportType) {
      case 'sales': return faChartLine;
      case 'products': return faChartBar;
      case 'customers': return faTable;
      case 'artisans': return faChartPie;
      default: return faChartLine;
    }
  };

  // Configure charts based on report type and available data
  useEffect(() => {
    const config = getChartConfig(reportType, reportData);
    setChartConfig(config);
    setDashboardCharts(config.dashboardCharts || []);
  }, [reportType, reportData]);

  // Initialize and manage chart lifecycle
  useEffect(() => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      // Don't try to initialize charts if there's no data
      return;
    }
    
    // Clean up existing chart instances
    if (barChartInstance.current) {
      barChartInstance.current.destroy();
    }
    if (pieChartInstance.current) {
      pieChartInstance.current.destroy();
    }
    if (lineChartInstance.current) {
      lineChartInstance.current.destroy();
    }
    
    // Initialize charts only with valid data
    const hasRealData = reportData.data && reportData.data.length > 0 && 
                        !reportData.isEmptyResponse;
    
    // Initialize charts if we have data and the canvas elements exist
    if (hasRealData && barChartRef.current && chartConfig.showBarChart) {
      initBarChart();
    }
    if (hasRealData && pieChartRef.current && chartConfig.showPieChart) {
      initPieChart();
    }
    if (hasRealData && lineChartRef.current && chartConfig.showLineChart) {
      initLineChart();
    }
    
    // Cleanup on unmount
    return () => {
      if (barChartInstance.current) barChartInstance.current.destroy();
      if (pieChartInstance.current) barChartInstance.current.destroy();
      if (lineChartInstance.current) lineChartInstance.current.destroy();
    };
  }, [reportData, activeTab, chartConfig]);

  // Color scheme configuration for report theming
  const reportColors = getReportColors(reportType);

  // Initialize bar chart with report-specific data
  const initBarChart = () => {
    const ctx = barChartRef.current.getContext('2d');
    const chartData = prepareBarChartData(reportType, reportData.data);
    
    barChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: chartConfig.barChartTitle || 'Values',
          data: chartData.values,
          backgroundColor: reportColors.palette,
          borderColor: reportColors.palette.map(color => color.replace('0.7', '1')),
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

  // Initialize pie chart with distribution data
  const initPieChart = () => {
    const ctx = pieChartRef.current.getContext('2d');
    const chartData = preparePieChartData(reportType, reportData.data);
    
    pieChartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: chartData.map(item => item.label),
        datasets: [{
          data: chartData.map(item => item.value),
          backgroundColor: reportColors.palette,
          borderColor: '#fff',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const item = chartData[context.dataIndex];
                const value = reportType === 'sales' || reportType === 'artisans' ? 
                  formatCurrency(item.value) : formatNumber(item.value);
                return `${item.label}: ${value} (${item.percentage.toFixed(1)}%)`;
              }
            }
          },
          title: {
            display: true,
            text: chartConfig.pieChartTitle || 'Distribution'
          }
        }
      }
    });
  };

  // Initialize line chart for time-series analysis
  const initLineChart = () => {
    const ctx = lineChartRef.current.getContext('2d');
    const chartData = prepareLineChartData(reportType, reportData);
    
    lineChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: chartData.title,
          data: chartData.values,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          tension: 0.1,
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
            text: chartConfig.lineChartTitle || chartData.title
          }
        }
      }
    });
  };

  // Helper function to determine if field should display as currency
  const shouldUseCurrency = (key) => {
    const fieldName = key.toLowerCase();
    
    // Explicitly check for totalSales field
    if (fieldName === 'totalsales') return true;
    
    // Check for currency-related field name patterns
    return fieldName.includes('sales') || 
           fieldName.includes('revenue') || 
           fieldName.includes('amount') ||
           fieldName.includes('price') || 
           fieldName.includes('value') ||
           fieldName.includes('spent');
  };

  // Format values based on data type and context
  const formatValue = (value, field) => {
    if (value === null || value === undefined) return '-';
    
    if (typeof value === 'number' || !isNaN(parseFloat(value))) {
      if (field && shouldUseCurrency(field, reportType)) {
        return formatCurrency(value);
      }
      return formatNumber(value);
    }
    
    return String(value);
  };

  // Process summary data to handle special cases and filters
  const processReportSummary = (summary, reportType) => {
    // Create a copy so we don't modify the original data
    const processedSummary = {...summary};
    
    // For products report, set productsLowStock from the calculated lowStockCount if available
    if (reportType === 'products' && reportData && 'lowStockCount' in reportData) {
      processedSummary.productsLowStock = reportData.lowStockCount;
    }
    
    // For artisan report, check if filtered data is correctly reflected
    if (reportType === 'artisans') {
      // Check if we have a mismatch between actual artisans in data and summary count
      if (reportData && reportData.data && reportData.data.length !== summary.totalArtisans) {
        // Update the totalArtisans count to match data length
        processedSummary.totalArtisans = reportData.data.length;
        
        // Recalculate activeArtisans based on data
        processedSummary.activeArtisans = reportData.data.filter(
          artisan => artisan.product_count > 0
        ).length;
      }
    }
    
    return processedSummary;
  };

  // Render summary cards with color-coded styling
  const renderSummaryCards = () => {
    if (!reportData || !reportData.summary) {
      return (
        <Alert variant="info">
          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
          No summary data available for this report.
        </Alert>
      );
    }
    
    // Process the summary data to include low stock count
    const summary = processReportSummary(reportData.summary, reportType);
    
    return (
      <Row className="g-3 mb-4">
        {Object.entries(summary).map(([key, summaryValue], index) => {
          // Skip internal fields that store filter state
          if (['filterApplied', 'filterType'].includes(key)) return null;
          
          // Format the display name
          const displayName = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/^./, str => str.toUpperCase());
          
          // Update the top performer label based on filter type if applicable
          let updatedDisplayName = displayName;
          if (key === 'topPerformer' && summary.filterApplied && reportType === 'artisans') {
            switch (summary.filterType) {
              case 'high':
                updatedDisplayName = 'Top High Performer';
                break;
              case 'medium':
                updatedDisplayName = 'Top Average Performer';
                break;
              case 'low':
                updatedDisplayName = 'Top Low Performer';
                break;
              default:
                updatedDisplayName = 'Top Performer';
            }
          }
          
          // Format the value based on the key name
          let formattedValue;
          if (typeof summaryValue === 'number') {
            if (key === 'totalSales' || shouldUseCurrency(key)) {
              formattedValue = formatCurrency(summaryValue);
            } else {
              formattedValue = formatNumber(summaryValue);
            }
          } else {
            formattedValue = summaryValue.toString();
          }
          
          // Apply gradient background to card headers based on report type
          const cardHeaderStyle = {
            borderLeft: `4px solid ${reportColors.primary}`,
            background: `linear-gradient(to right, ${reportColors.primary}15, transparent)`
          };

          return (
            <Col md={4} sm={6} key={index}>
              <Card className="h-100 shadow-sm" style={cardHeaderStyle}>
                <Card.Body className="p-3">
                  <div className="d-flex flex-column align-items-center text-center">
                    <h3 style={{ color: reportColors.primary }} className="mb-1">{formattedValue}</h3>
                    <p className="text-muted mb-0">{updatedDisplayName}</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  // Render data table with formatted values
  const renderDataTable = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      return (
        <Alert variant="info">
          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
          No data available for this report.
        </Alert>
      );
    }
    
    const data = reportData.data;
    // Get column headers excluding id field
    const headers = Object.keys(data[0]).filter(key => key !== 'id');
    
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
                  } else if (header.toLowerCase().includes('growth')) {
                    cellValue = <span className={parseFloat(cellValue) >= 0 ? 'text-success' : 'text-danger'}>
                                  {parseFloat(cellValue) >= 0 ? '+' : ''}{cellValue}%
                                </span>;
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

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };
  
  // Handle JSON data download
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

  // Alert component for low stock warnings
  const LowStockAlert = ({ count }) => {
    if (!count || count === 0) return null;
  
  };

  // Check if filters are currently applied
  const isFilterApplied = () => {
    // Check if reportData has appliedFilters information
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

  // Determine if graphs should be displayed based on settings
  const shouldShowGraphs = () => {
    // If report data has applied filters information
    if (reportData && reportData.appliedFilters) {
      // Default to true unless explicitly set to false
      return reportData.appliedFilters.includeGraphs !== false;
    }
    // Default behavior - show graphs unless specified otherwise
    return true;
  };

  // Handle PDF export with chart and table data
  const handleExportPDF = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Wait for DOM and charts to be ready
      await new Promise(resolve => setTimeout(resolve, 300));

      // Capture chart images
      const charts = [];
      if (barChartRef.current) charts.push(barChartRef.current.toDataURL());
      if (pieChartRef.current) charts.push(pieChartRef.current.toDataURL());
      if (lineChartRef.current) charts.push(lineChartRef.current.toDataURL());

      // Capture HTML sections for PDF generation
      const dashboardHTML = pdfDashboardRef.current ? pdfDashboardRef.current.innerHTML : '';
      const chartsHTML = pdfChartsRef.current ? pdfChartsRef.current.innerHTML : '';
      const tableHTML = pdfTableRef.current ? pdfTableRef.current.innerHTML : '';

      // Prepare export data package
      const exportData = {
        reportData: {
          ...reportData,
          dashboardHTML,
          chartsHTML,
          tableHTML,
          charts,
        },
        reportType: reportType,
        dateRange: dateRange,
        filters: {
          ...(reportData.appliedFilters || {}),
          includeGraphs: true // Always include graphs in PDF exports
        },
        pdfOptions: {
          paperSize: 'a4', // Default to A4
          orientation: 'portrait',
          includeHeader: true,
          includeFooter: true,
          includeCharts: true,
          includeDataTable: true
        }
      };
      
      // Send to API for PDF generation
      const response = await axios.post(`${API_BASE_URL}/api/reports/export/pdf`, exportData);
      
      if (response.data.success) {
        // Trigger PDF download
        const downloadUrl = `${API_BASE_URL}/api/reports/download/${response.data.fileName}`;
        
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

  // PDF export configuration state
  const [showPdfOptions, setShowPdfOptions] = useState(false);
  const [pdfOptions, setPdfOptions] = useState({
    paperSize: 'a4',
    orientation: 'portrait',
    includeCharts: true,
    includeDataTable: true,
    maxTableRows: 100
  });

  // PDF export options modal component
  const renderPdfOptionsModal = () => {
    return (
      <Modal show={showPdfOptions} onHide={() => setShowPdfOptions(false)}>
        <Modal.Header closeButton>
          <Modal.Title>PDF Export Options</Modal.Title>
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
              backgroundColor: reportColors.primary,
              borderColor: reportColors.primary
            }}
          >
            Export PDF
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  // Handle PDF export with custom options
  const handleExportPDFWithOptions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Prepare the export data with all necessary information and configured options
      const exportData = {
        reportData: reportData,
        reportType: reportType,
        dateRange: dateRange,
        filters: {
          ...(reportData.appliedFilters || {}),
          includeGraphs: true
        },
        pdfOptions: pdfOptions
      };
      
      // Send to API for PDF generation
      const response = await axios.post(`${API_BASE_URL}/api/reports/export/pdf`, exportData);
      
      if (response.data.success) {
        // Download the generated PDF
        const downloadUrl = `${API_BASE_URL}/api/reports/download/${response.data.fileName}`;
        
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

  // Simple notification system for user feedback
  const showNotification = (message, type = 'success') => {
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

  return (
    <>
      {/* Hidden container for PDF export content */}
      <div style={{ display: 'none' }}>
        <div id="pdf-dashboard-section" ref={pdfDashboardRef}>
          {chartConfig.showSummary && renderSummaryCards()}
          {reportType === 'products' && reportData && 'lowStockCount' in reportData && (
            <LowStockAlert count={reportData.lowStockCount} />
          )}
        </div>
        <div id="pdf-charts-section" ref={pdfChartsRef}>
          {shouldShowGraphs() && (
            <>
              {dashboardCharts.includes('lineChart') && chartConfig.showLineChart && lineChartRef.current && (
                <img src={lineChartRef.current.toDataURL()} alt="Line Chart" style={{ maxWidth: '100%', marginBottom: 16 }} />
              )}
              {dashboardCharts.includes('pieChart') && chartConfig.showPieChart && pieChartRef.current && (
                <img src={pieChartRef.current.toDataURL()} alt="Pie Chart" style={{ maxWidth: '100%', marginBottom: 16 }} />
              )}
              {dashboardCharts.includes('barChart') && chartConfig.showBarChart && barChartRef.current && (
                <img src={barChartRef.current.toDataURL()} alt="Bar Chart" style={{ maxWidth: '100%', marginBottom: 16 }} />
              )}
            </>
          )}
        </div>
        <div id="pdf-table-section" ref={pdfTableRef}>
          {renderDataTable()}
        </div>
      </div>
      <div className="report-view-form pb-4" style={{
        overflowY: 'auto',
        scrollbarWidth: 'none', /* Firefox */
        msOverflowStyle: 'none', /* IE and Edge */
        height: '100%'
      }}>
        {/* Hide scrollbar for Chrome, Safari and Opera */}
        <style jsx="true">{`
          .report-view-form::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {/* Report header with title and export options */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="d-flex justify-content-between align-items-center bg-white py-3">
            <div className="d-flex align-items-center">
              <div className="report-icon me-3" style={{ color: reportColors.primary }}>
                <FontAwesomeIcon icon={getReportIcon()} size="2x" />
              </div>
              <div>
                <h4 className="mb-0" style={{ color: reportColors.primary }}>{getReportTitle()}</h4>
                <p className="text-muted mb-0 small">
                  {formatDate(dateRange?.startDate)} - {formatDate(dateRange?.endDate)}
                </p>
              </div>
            </div>
            <div>
              <Button variant="outline-secondary" size="sm" className="me-2" onClick={onBackClick}>
                Back
              </Button>
              <Button variant="outline-primary" size="sm" className="me-2" onClick={handleExportPDF} disabled={isLoading}>
                <FontAwesomeIcon icon={faFilePdf} className="me-1" />
                {isLoading ? 'Exporting...' : 'Download as PDF'}
              </Button>
            </div>
          </Card.Header>
        </Card>
        
        {/* Error display */}
        {error && (
          <Alert variant="danger" className="mb-4">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            {error}
          </Alert>
        )}
        
        {/* Tab navigation for different report views */}
        <div className="nav nav-tabs mb-4">
          <div className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              style={activeTab === 'dashboard' ? {
                borderBottom: `3px solid ${reportColors.primary}`,
                color: reportColors.primary
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
                borderBottom: `3px solid ${reportColors.primary}`,
                color: reportColors.primary
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
                borderBottom: `3px solid ${reportColors.primary}`,
                color: reportColors.primary
              } : {}}
            >
              <FontAwesomeIcon icon={faTable} className="me-2" />
              Data Table
            </button>
          </div>
        </div>
        
        {/* Dashboard tab - overview with summary and key charts */}
        {activeTab === 'dashboard' && (
          <>
            <h5 className="mb-3" style={{ color: reportColors.primary }}>Report Summary</h5>
            
            {chartConfig.showSummary && renderSummaryCards()}
            
            {reportType === 'products' && reportData && 'lowStockCount' in reportData && (
              <LowStockAlert count={reportData.lowStockCount} />
            )}
            
            {shouldShowGraphs() && (
              <Row className="mb-4">
                {dashboardCharts.includes('lineChart') && chartConfig.showLineChart && (
                  <Col md={dashboardCharts.length > 1 ? 6 : 12}>
                    <Card className="h-100 shadow-sm">
                      <Card.Header className="bg-white" style={{ borderBottom: `2px solid ${reportColors.primary}20` }}>
                        <h5 className="mb-0" style={{ color: reportColors.primary }}>{chartConfig.lineChartTitle || 'Time Analysis'}</h5>
                      </Card.Header>
                      <Card.Body>
                        {isLoading ? (
                          <div className="text-center py-5">
                            <Spinner animation="border" style={{ color: reportColors.primary }} />
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
                
                {dashboardCharts.includes('pieChart') && chartConfig.showPieChart && (
                  <Col md={dashboardCharts.length > 1 ? 6 : 12}>
                    <Card className="h-100 shadow-sm">
                      <Card.Header className="bg-white" style={{ borderBottom: `2px solid ${reportColors.primary}20` }}>
                        <h5 className="mb-0" style={{ color: reportColors.primary }}>{chartConfig.pieChartTitle || 'Distribution Analysis'}</h5>
                      </Card.Header>
                      <Card.Body>
                        {isLoading ? (
                          <div className="text-center py-5">
                            <Spinner animation="border" style={{ color: reportColors.primary }} />
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

                {dashboardCharts.includes('barChart') && chartConfig.showBarChart && (
                  <Col md={dashboardCharts.length > 1 ? 6 : 12} className={dashboardCharts.length > 1 && dashboardCharts.indexOf('barChart') > 0 ? 'mt-4 mt-md-0' : ''}>
                    <Card className="h-100 shadow-sm">
                      <Card.Header className="bg-white" style={{ borderBottom: `2px solid ${reportColors.primary}20` }}>
                        <h5 className="mb-0" style={{ color: reportColors.primary }}>{chartConfig.barChartTitle || 'Top Items'}</h5>
                      </Card.Header>
                      <Card.Body>
                        {isLoading ? (
                          <div className="text-center py-5">
                            <Spinner animation="border" style={{ color: reportColors.primary }} />
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
        
        {/* Charts tab - detailed chart analysis */}
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
                        <Card.Header className="bg-white" style={{ borderBottom: `2px solid ${reportColors.primary}20` }}>
                          <h5 className="mb-0" style={{ color: reportColors.primary }}>{chartConfig.barChartTitle || 'Top Items'}</h5>
                        </Card.Header>
                        <Card.Body>
                          {isLoading ? (
                            <div className="text-center py-5">
                              <Spinner animation="border" style={{ color: reportColors.primary }} />
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
                  {chartConfig.showLineChart && (
                    <Col md={chartConfig.showPieChart ? 6 : 12}>
                      <Card className="h-100 shadow-sm">
                        <Card.Header className="bg-white" style={{ borderBottom: `2px solid ${reportColors.primary}20` }}>
                          <h5 className="mb-0" style={{ color: reportColors.primary }}>{chartConfig.lineChartTitle || 'Time Analysis'}</h5>
                        </Card.Header>
                        <Card.Body>
                          {isLoading ? (
                            <div className="text-center py-5">
                              <Spinner animation="border" style={{ color: reportColors.primary }} />
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
                  
                  {chartConfig.showPieChart && (
                    <Col md={chartConfig.showLineChart ? 6 : 12}>
                      <Card className="h-100 shadow-sm">
                        <Card.Header className="bg-white" style={{ borderBottom: `2px solid ${reportColors.primary}20` }}>
                          <h5 className="mb-0" style={{ color: reportColors.primary }}>{chartConfig.pieChartTitle || 'Distribution Analysis'}</h5>
                        </Card.Header>
                        <Card.Body>
                          {isLoading ? (
                            <div className="text-center py-5">
                              <Spinner animation="border" style={{ color: reportColors.primary }} />
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
                </Row>
                
                {!chartConfig.showBarChart && !chartConfig.showLineChart && !chartConfig.showPieChart && (
                  <Alert variant="info">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    No charts are configured for this report type.
                  </Alert>
                )}
              </>
            )}
          </>
        )}
        
        {/* Data table tab - raw data display */}
        {activeTab === 'data' && (
          <>
            <h5 className="mb-3" style={{ color: reportColors.primary }}>Report Data</h5>
            <Card className="shadow-sm">
              <Card.Header className="bg-white" style={{ borderBottom: `2px solid ${reportColors.primary}20` }}>
                <h5 className="mb-0" style={{ color: reportColors.primary }}>{getReportTitle()} - Detailed Data</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {isLoading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" style={{ color: reportColors.primary }} />
                  </div>
                ) : (
                  renderDataTable()
                )}
              </Card.Body>
            </Card>
          </>
        )}
        
        {/* Report footer information */}
        <div className="text-muted small text-center mt-4">
          <p>Report generated on {formatDate(new Date(), true)}</p>
        </div>
        
        {/* PDF export options modal */}
        {renderPdfOptionsModal()}
      </div>
    </>
  );
};

export default ReportViewForm;
