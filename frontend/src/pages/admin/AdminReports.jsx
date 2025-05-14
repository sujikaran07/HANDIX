import React, { useState, useEffect, useCallback, useRef } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartBar, faCalendarAlt, faFilter, faChartLine, faBoxOpen, 
  faUsers, faPaintBrush, faChartPie, faTable, faPrint, faFileDownload 
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/admin/AdminReports.css';
import axios from 'axios';

// Simple formatter function instead of importing
const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'Rs 0.00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return 'Rs 0.00';
  return `Rs ${numValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Simple notification function instead of using react-toastify
const showNotification = (message, type = 'info') => {
  alert(message);
};

// Define API base URL directly instead of using process.env
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
    categories: [],
    regions: []
  });
  const [filters, setFilters] = useState({
    categories: [],
    region: '',
    stockStatus: '',
    customerType: '',
    compareWithPrevious: false,
    includeGraphs: true,
    showTotalsOnly: false,
    dataPointsLimit: 10,
    groupBy: 'day'
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  
  // Refs
  const chartRef = useRef(null);

  // Initialize component on mount
  useEffect(() => {
    fetchMetadata();
    setDefaultDateRange();
  }, []);

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
          categories: response.data.categories || [],
          regions: response.data.regions || []
        });
      }
    } catch (error) {
      console.error('Error fetching report metadata:', error);
      showNotification('Failed to load report options. Using default filters.', 'error');
      setMetadata({
        categories: [],
        regions: []
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
      case 'this-week':
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - today.getDay());
        startDate = firstDayOfWeek.toISOString().split('T')[0];
        break;
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

  // Generate report
  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const dateRange = getDateRangeFromPreset();
      
      const requestData = {
        ...dateRange,
        ...filters
      };
      
      const response = await axios.post(
        `${API_BASE_URL}/api/reports/${currentReport}`,
        requestData
      );
      
      if (response.data.success) {
        setReportData(response.data);
        
        // Check if we got mock data and notify the user
        if (response.data.isMockData) {
          showNotification(`Generated ${currentReport} report with mock data. Some database tables are missing.`, 'warning');
        } else {
          showNotification(`${currentReport.charAt(0).toUpperCase() + currentReport.slice(1)} report generated successfully`, 'success');
        }
      } else {
        showNotification('Failed to generate report', 'error');
      }
    } catch (error) {
      console.error(`Error generating ${currentReport} report:`, error);
      showNotification(`Error: ${error.response?.data?.message || 'Failed to generate report'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };
  
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

  // Render summary cards
  const renderSummaryCards = () => {
    if (!reportData || !reportData.summary) return null;
    
    const summary = reportData.summary;
    return (
      <div className="row mb-3 g-2">
        {Object.keys(summary).map((key, index) => (
          <div className="col-md-4 col-sm-6" key={index}>
            <div className="card h-100 summary-card">
              <div className="card-body p-3 text-center">
                <h5 className="fw-bold text-primary mb-1">
                  {typeof summary[key] === 'number' && 
                   (key.toLowerCase().includes('total') || 
                    key.toLowerCase().includes('sales') || 
                    key.toLowerCase().includes('value') || 
                    key.toLowerCase().includes('spent'))
                    ? formatCurrency(summary[key])
                    : summary[key].toString()}
                </h5>
                <p className="mb-0 small text-muted">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render bar chart - using a placeholder until Chart.js is implemented
  const renderBarChart = () => {
    return (
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Sales Overview</h5>
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
            <small>Note: Install Chart.js for interactive charts</small>
          </div>
        </div>
      </div>
    );
  };

  // Render pie chart - using a placeholder until Chart.js is implemented
  const renderPieChart = () => {
    return (
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Sales Distribution</h5>
        </div>
        <div className="card-body chart-container">
          <div className="pie-chart-placeholder">
            <div className="pie-segment segment-1"></div>
            <div className="pie-segment segment-2"></div>
            <div className="pie-segment segment-3"></div>
            <div className="pie-segment segment-4"></div>
          </div>
          <div className="pie-chart-legend">
            <div className="legend-item"><span className="legend-color legend-1"></span> Handicrafts (35%)</div>
            <div className="legend-item"><span className="legend-color legend-2"></span> Pottery (25%)</div>
            <div className="legend-item"><span className="legend-color legend-3"></span> Textiles (20%)</div>
            <div className="legend-item"><span className="legend-color legend-4"></span> Other (20%)</div>
          </div>
        </div>
      </div>
    );
  };

  // Render line chart - using a placeholder until Chart.js is implemented
  const renderLineChart = () => {
    return (
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Order Trends</h5>
        </div>
        <div className="card-body chart-container">
          <div className="line-chart-placeholder">
            <svg width="100%" height="200" viewBox="0 0 100 60">
              <polyline
                fill="none"
                stroke="#0d6efd"
                strokeWidth="2"
                points="0,50 20,35 40,40 60,20 80,30 100,10"
              />
              <polyline
                fill="none"
                stroke="#20c997"
                strokeWidth="2"
                strokeDasharray="5,5"
                points="0,30 20,45 40,50 60,30 80,20 100,25"
              />
            </svg>
            <div className="line-chart-x-labels">
              <div>Jan</div>
              <div>Feb</div>
              <div>Mar</div>
              <div>Apr</div>
              <div>May</div>
              <div>Jun</div>
            </div>
          </div>
          <div className="line-chart-legend">
            <div className="legend-item"><span className="legend-line line-1"></span> This Year</div>
            <div className="legend-item"><span className="legend-line line-2"></span> Last Year</div>
          </div>
        </div>
      </div>
    );
  };

  // Render report table
  const renderReportTable = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      return <p className="text-center">No data available for this report.</p>;
    }
    
    // Show warning for mock data
    if (reportData.isMockData) {
      return (
        <>
          <div className="alert alert-warning mb-3">
            <strong>Note:</strong> You are viewing mock data because some required database tables are missing. 
            This is sample data for demonstration purposes only.
          </div>
          {renderActualReportTable()}
        </>
      );
    }
    
    return renderActualReportTable();
  };

  // Render actual report table with data
  const renderActualReportTable = () => {
    const filteredData = reportData.data;
    
    if (filteredData.length === 0) {
      return <p className="text-center">No data available for this report.</p>;
    }
    
    const headers = Object.keys(filteredData[0]).filter(key => key !== 'id');
    
    return (
      <div className="table-responsive">
        <table className="table table-hover table-bordered inventory-table">
          <thead className="table-light">
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, rowIndex) => (
              <tr key={rowIndex} className="hover-row">
                {headers.map((header, index) => (
                  <td key={index}>
                    {header.toLowerCase().includes('date') && item[header]
                      ? new Date(item[header]).toLocaleDateString()
                      : header.toLowerCase().includes('amount') || 
                        header.toLowerCase().includes('sales') || 
                        header.toLowerCase().includes('revenue') || 
                        header.toLowerCase().includes('spent')
                        ? formatCurrency(item[header])
                        : header.toLowerCase().includes('growth')
                          ? <span className={parseFloat(item[header]) >= 0 ? 'text-success' : 'text-danger'}>
                              {parseFloat(item[header]) >= 0 ? '+' : ''}{item[header]}%
                            </span>
                          : item[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render filter modal with dynamic options based on report type
  const renderFilterModal = () => {
    return (
      <div className={`modal fade ${showFilterModal ? 'show' : ''}`} 
           id="filterModal" 
           tabIndex="-1" 
           role="dialog"
           style={{ display: showFilterModal ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}
           onClick={(e) => {
             if (e.target === e.currentTarget) setShowFilterModal(false);
           }}
      >
        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content filter-modal-content">
            <div className="modal-header filter-modal-header">
              <h5 className="modal-title">
                Advanced Options for {reportTypeInfo[currentReport]?.title || 'Report'}
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                aria-label="Close"
                onClick={() => setShowFilterModal(false)}
              ></button>
            </div>
            <div className="modal-body filter-modal-body">
              
              {/* Common Filters for all Reports */}
              <div className="filter-section">
                <h6>Categories</h6>
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
                        />
                        <label className="form-check-label" htmlFor={`category-${category.id}`}>
                          {category.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Region Filter - Common for all reports */}
              <div className="filter-section">
                <h6>Region</h6>
                <select 
                  className="form-select"
                  value={filters.region}
                  onChange={(e) => setFilters({...filters, region: e.target.value})}
                >
                  <option value="">All Regions</option>
                  {metadata.regions.map((region, index) => (
                    <option key={index} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              
              {/* Sales Report Specific Filters */}
              {currentReport === 'sales' && (
                <div className="filter-section">
                  <h6>Sales Options</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label className="form-label">Minimum Order Value</label>
                        <input 
                          type="number" 
                          className="form-control"
                          placeholder="Min value"
                          value={filters.minOrderValue || ''}
                          onChange={(e) => setFilters({...filters, minOrderValue: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label className="form-label">Payment Method</label>
                        <select 
                          className="form-select"
                          value={filters.paymentMethod || ''}
                          onChange={(e) => setFilters({...filters, paymentMethod: e.target.value})}
                        >
                          <option value="">All Methods</option>
                          <option value="Credit Card">Credit Card</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Cash on Delivery">Cash on Delivery</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="excludeCancelled"
                      checked={filters.excludeCancelled || false}
                      onChange={(e) => setFilters({...filters, excludeCancelled: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="excludeCancelled">
                      Exclude cancelled orders
                    </label>
                  </div>
                </div>
              )}
              
              {/* Product Report Specific Filters */}
              {currentReport === 'products' && (
                <div className="filter-section">
                  <h6>Product Filters</h6>
                  <div className="form-group mb-3">
                    <label className="form-label">Stock Status</label>
                    <select 
                      className="form-select"
                      value={filters.stockStatus}
                      onChange={(e) => setFilters({...filters, stockStatus: e.target.value})}
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
                    />
                    <label className="form-check-label" htmlFor="customizableOnly">
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
                    />
                    <label className="form-check-label" htmlFor="bestSellers">
                      Show best sellers only
                    </label>
                  </div>
                </div>
              )}
              
              {/* Customer Report Specific Filters */}
              {currentReport === 'customers' && (
                <div className="filter-section">
                  <h6>Customer Filters</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label className="form-label">Customer Type</label>
                        <select 
                          className="form-select"
                          value={filters.customerType}
                          onChange={(e) => setFilters({...filters, customerType: e.target.value})}
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
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="newCustomersOnly"
                      checked={filters.newCustomersOnly || false}
                      onChange={(e) => setFilters({...filters, newCustomersOnly: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="newCustomersOnly">
                      New customers only
                    </label>
                  </div>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="repeatedPurchases"
                      checked={filters.repeatedPurchases || false}
                      onChange={(e) => setFilters({...filters, repeatedPurchases: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="repeatedPurchases">
                      Customers with repeated purchases
                    </label>
                  </div>
                </div>
              )}
              
              {/* Artisan Report Specific Filters */}
              {currentReport === 'artisans' && (
                <div className="filter-section">
                  <h6>Artisan Filters</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label className="form-label">Productivity Level</label>
                        <select 
                          className="form-select"
                          value={filters.productivityLevel || ''}
                          onChange={(e) => setFilters({...filters, productivityLevel: e.target.value})}
                        >
                          <option value="">All Levels</option>
                          <option value="high">High Performers</option>
                          <option value="medium">Average Performers</option>
                          <option value="low">Low Performers</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label className="form-label">Product Type Specialty</label>
                        <select 
                          className="form-select"
                          value={filters.artisanSpecialty || ''}
                          onChange={(e) => setFilters({...filters, artisanSpecialty: e.target.value})}
                        >
                          <option value="">All Specialties</option>
                          <option value="handicrafts">Handicrafts</option>
                          <option value="textiles">Textiles</option>
                          <option value="pottery">Pottery</option>
                          <option value="wood">Woodwork</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="activeArtisansOnly"
                      checked={filters.activeArtisansOnly || false}
                      onChange={(e) => setFilters({...filters, activeArtisansOnly: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="activeArtisansOnly">
                      Show active artisans only
                    </label>
                  </div>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="customizationCapable"
                      checked={filters.customizationCapable || false}
                      onChange={(e) => setFilters({...filters, customizationCapable: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="customizationCapable">
                      Artisans capable of customization
                    </label>
                  </div>
                </div>
              )}
              
              {/* Common Display Options and Data Grouping for all report types */}
              <div className="filter-section">
                <h6>Display Options</h6>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="compareWithPrevious"
                    checked={filters.compareWithPrevious}
                    onChange={(e) => setFilters({...filters, compareWithPrevious: e.target.checked})}
                  />
                  <label className="form-check-label" htmlFor="compareWithPrevious">
                    Compare with previous period
                  </label>
                </div>
                
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="includeGraphs"
                    checked={filters.includeGraphs}
                    onChange={(e) => setFilters({...filters, includeGraphs: e.target.checked})}
                  />
                  <label className="form-check-label" htmlFor="includeGraphs">
                    Include graphs in report
                  </label>
                </div>
                
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showTotalsOnly"
                    checked={filters.showTotalsOnly}
                    onChange={(e) => setFilters({...filters, showTotalsOnly: e.target.checked})}
                  />
                  <label className="form-check-label" htmlFor="showTotalsOnly">
                    Show totals only
                  </label>
                </div>
              </div>
              
              <div className="filter-section">
                <h6>Data Grouping</h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Group By</label>
                      <select 
                        className="form-select"
                        value={filters.groupBy}
                        onChange={(e) => setFilters({...filters, groupBy: e.target.value})}
                      >
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                        <option value="quarter">Quarter</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Data Points Limit</label>
                      <select 
                        className="form-select"
                        value={filters.dataPointsLimit}
                        onChange={(e) => setFilters({...filters, dataPointsLimit: parseInt(e.target.value)})}
                      >
                        <option value="5">Top 5</option>
                        <option value="10">Top 10</option>
                        <option value="20">Top 20</option>
                        <option value="50">Top 50</option>
                        <option value="100">Top 100</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Filter Actions */}
              <div className="filter-actions">
                <button 
                  className="btn btn-link"
                  onClick={() => {
                    // Reset to default filters
                    setFilters({
                      categories: [],
                      region: '',
                      stockStatus: '',
                      customerType: '',
                      compareWithPrevious: false,
                      includeGraphs: true,
                      showTotalsOnly: false,
                      dataPointsLimit: 10,
                      groupBy: 'day'
                    });
                  }}
                >
                  Reset Filters
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowFilterModal(false)}
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

  // Render compact report type cards - redesigned with larger cards
  const renderReportTypeCards = () => {
    return (
      <div className="row mb-4">
        {Object.entries(reportTypeInfo).map(([key, info]) => (
          <div className="col-md-3 mb-3" key={key}>
            <div 
              className={`card report-card h-100 ${currentReport === key ? 'selected' : ''}`} 
              onClick={() => setCurrentReport(key)}
            >
              <div className="card-body d-flex flex-column align-items-center p-4">
                <div className={`icon-circle-lg bg-${info.color}-subtle mb-3`}>
                  <FontAwesomeIcon icon={info.icon} className={`text-${info.color}`} size="lg" />
                </div>
                <h5 className="card-title mb-2">{info.title}</h5>
                <p className="text-center text-muted mb-0">{info.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render date range selector - expanded with more options
  const renderDateSelector = () => {
    return (
      <div className="date-selector py-2">
        <h6 className="mb-3">Select Date Range</h6>
        <div className="row">
          <div className="col-md-8">
            <div className="date-range-buttons mb-3">
              <div className="btn-group btn-group-sm d-flex">
                <button className={`btn ${timeRange === 'today' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTimeRange('today')}>Today</button>
                <button className={`btn ${timeRange === 'this-week' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTimeRange('this-week')}>This Week</button>
                <button className={`btn ${timeRange === 'this-month' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTimeRange('this-month')}>This Month</button>
                <button className={`btn ${timeRange === 'last-month' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTimeRange('last-month')}>Last Month</button>
                <button className={`btn ${timeRange === 'custom' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTimeRange('custom')}>Custom</button>
              </div>
            </div>
          </div>
          <div className="col-md-4 text-end">
            <button 
              className="btn btn-outline-secondary d-flex align-items-center ms-auto"
              onClick={() => setShowFilterModal(true)}
            >
              <FontAwesomeIcon icon={faFilter} className="me-2" />
              Advanced Options
            </button>
          </div>
        </div>
        
        {timeRange === 'custom' && (
          <div className="row g-3 mt-2">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                </span>
                <input
                  type="date"
                  className="form-control"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
                />
              </div>
            </div>
            <div className="col-md-2 text-center d-flex align-items-center justify-content-center">
              <span className="text-muted">to</span>
            </div>
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                </span>
                <input
                  type="date"
                  className="form-control"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange({...customDateRange, endDate: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-inventory-page reports-page">
      <AdminSidebar />
      <div className="main-content">
        <AdminTopbar />
        
        <div className="container-fluid fixed-height-container">
          <div className="card fixed-height-card">
            {!reportData ? (
              <>
                {/* Report configuration section */}
                <div className="card-header bg-white">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faChartBar} className="me-2 text-primary" />
                    <div>
                      <h2 className="h5 mb-0">Reports & Analytics</h2>
                      <p className="text-muted small mb-0">Generate business reports</p>
                    </div>
                  </div>
                </div>
                
                <div className="card-body p-3 fixed-body">
                  <div className="mb-3">
                    <h6 className="mb-2">Report Type</h6>
                    {renderReportTypeCards()}
                  </div>
                  
                  <div className="card mb-3">
                    <div className="card-body p-2">
                      <h6 className="mb-2">Date Range</h6>
                      {renderDateSelector()}
                    </div>
                  </div>
                  
                  {/* Generate button */}
                  <div className="fixed-footer">
                    <div className="d-grid">
                      <button 
                        className="btn btn-primary" 
                        onClick={handleGenerateReport}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Generating...
                          </>
                        ) : 'Generate Report'}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Report results section */}
                <div className="card-header bg-white p-3 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={reportTypeInfo[currentReport].icon} className={`text-${reportTypeInfo[currentReport].color} me-2`} />
                    <div>
                      <h2 className="h5 mb-0">{getReportTitle()}</h2>
                      <p className="text-muted small mb-0">
                        {new Date(getDateRangeFromPreset().startDate).toLocaleDateString()} - 
                        {new Date(getDateRangeFromPreset().endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="btn-group">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => setReportData(null)}>
                      New Report
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={handlePrint}>
                      <FontAwesomeIcon icon={faPrint} className="me-1" />
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={handleDownload}>
                      <FontAwesomeIcon icon={faFileDownload} className="me-1" />
                    </button>
                  </div>
                </div>
                
                <div className="card-body p-0 no-scroll fixed-report-body">
                  {/* Warning for mock data */}
                  {reportData.isMockData && (
                    <div className="alert alert-warning py-1 px-2 m-2">
                      <small><strong>Note:</strong> Viewing mock data</small>
                    </div>
                  )}
                  
                  {/* Report tabs */}
                  <ul className="nav nav-tabs nav-fill px-2 pt-2">
                    <li className="nav-item">
                      <a 
                        className={`nav-link ${activeTab === 'summary' ? 'active' : ''}`}
                        onClick={(e) => {e.preventDefault(); setActiveTab('summary');}}
                        href="#"
                      >
                        <FontAwesomeIcon icon={faChartPie} className="me-1" /> Dashboard
                      </a>
                    </li>
                    <li className="nav-item">
                      <a 
                        className={`nav-link ${activeTab === 'data' ? 'active' : ''}`}
                        onClick={(e) => {e.preventDefault(); setActiveTab('data');}}
                        href="#"
                      >
                        <FontAwesomeIcon icon={faTable} className="me-1" /> Data
                      </a>
                    </li>
                  </ul>
                  
                  {/* Report content */}
                  <div className="fixed-content">
                    {activeTab === 'summary' ? (
                      <div className="report-dashboard p-2">
                        {renderSummaryCards()}
                        
                        <div className="row g-2">
                          <div className="col-md-6">
                            {renderBarChart()}
                          </div>
                          <div className="col-md-6">
                            {renderPieChart()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="report-data p-2">
                        {renderReportTable()}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Filter modal */}
      {renderFilterModal()}
    </div>
  );
};

export default AdminReportsPage;
