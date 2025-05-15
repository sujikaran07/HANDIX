import React, { useState, useEffect, useCallback } from 'react';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import { 
  FaFileAlt, FaCloudDownloadAlt, FaCalendarAlt, FaFilter, 
  FaChartLine, FaShoppingBag, FaBoxOpen, FaTrophy, FaChartBar,
  FaSpinner, FaInfoCircle, FaExclamationTriangle, FaTimes
} from 'react-icons/fa';
import { Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import '../../styles/artisan/ArtisanReports.css';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';
import axios from 'axios';
import ArtisanReportViewForm from "../../components/artisan/ArtisanReportViewForm";
import { API_BASE_URL } from "../../utils/environment";

// Report type definitions
const reportTypes = [
  {
    id: 'orders',
    title: 'Orders Report',
    description: 'Track your order history, sales performance, and revenue analytics',
    icon: FaShoppingBag,
    color: 'primary'
  },
  {
    id: 'products',
    title: 'Products Report',
    description: 'View detailed insights on your crafted products and their performance',
    icon: FaBoxOpen,
    color: 'success'
  },
  {
    id: 'performance',
    title: 'Performance Report',
    description: 'Analyze your productivity, efficiency, and customer satisfaction metrics',
    icon: FaTrophy,
    color: 'warning'
  }
];

const ArtisanReports = () => {
  // State variables
  const [activeReportType, setActiveReportType] = useState('orders');
  const [dateRange, setDateRange] = useState({
    preset: 'this-month',
    startDate: getDefaultStartDate(),
    endDate: formatDateForInput(new Date())
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  // Removed filter related states
  
  // Get artisan ID from localStorage
  const artisanId = localStorage.getItem('artisanId');

  // Initialize with default dates
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    setDateRange({
      preset: 'this-month',
      startDate: formatDateForInput(firstDayOfMonth),
      endDate: formatDateForInput(today)
    });
  }, []);
  
  // Helper function to format date for input fields
  function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
  }

  // Get default start date (first day of current month)
  function getDefaultStartDate() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return formatDateForInput(firstDayOfMonth);
  }
  
  // Handle preset date range changes
  const handlePresetChange = (preset) => {
    const today = new Date();
    let startDate, endDate = formatDateForInput(today);
    
    switch(preset) {
      case 'today':
        startDate = formatDateForInput(today);
        break;
      case 'this-week': {
        const firstDayOfWeek = new Date(today);
        const day = today.getDay() || 7; // Convert Sunday (0) to 7
        if (day !== 1) firstDayOfWeek.setDate(today.getDate() - day + 1); // Monday as first day
        startDate = formatDateForInput(firstDayOfWeek);
        break;
      }
      case 'this-month':
        startDate = formatDateForInput(new Date(today.getFullYear(), today.getMonth(), 1));
        break;
      case 'last-month': {
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        startDate = formatDateForInput(firstDayLastMonth);
        endDate = formatDateForInput(lastDayLastMonth);
        break;
      }
      // Removed last-3-months case
      case 'custom':
        // Keep current custom dates
        return setDateRange({
          ...dateRange,
          preset
        });
      default:
        startDate = getDefaultStartDate();
    }
    
    setDateRange({
      preset,
      startDate,
      endDate
    });
  };
  
  // Handle custom date changes
  const handleDateChange = (field, value) => {
    setDateRange({
      ...dateRange,
      [field]: value,
      preset: 'custom' // Switch to custom when dates are manually changed
    });
  };
  
  // Generate report
  const handleGenerateReport = async () => {
    if (!artisanId) {
      setError('Artisan ID not found. Please log in again.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/artisan/reports/${activeReportType}`, {
        params: {
          artisanId,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          // Removed filters
          includeCharts: true // Always include charts
        }
      });
      
      if (response.data.success) {
        setReportData(response.data);
      } else {
        setError('Failed to generate report: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle back button click from report view
  const handleBackToReportConfig = () => {
    setReportData(null);
  };
  
  // Get current report type details
  const currentReportType = reportTypes.find(type => type.id === activeReportType) || reportTypes[0];
  const reportColor = `var(--bs-${currentReportType.color})`;
  
  // Get report type colors similar to AdminReports
  const getReportColors = (reportColor) => {
    const colorMap = {
      'primary': { primary: '#0d6efd', gradient: 'linear-gradient(135deg, #0d6efd, #0a58ca)' },
      'success': { primary: '#198754', gradient: 'linear-gradient(135deg, #198754, #146c43)' },
      'warning': { primary: '#ff9800', gradient: 'linear-gradient(135deg, #ff9800, #e68a00)' }
    };
    
    return colorMap[reportColor] || colorMap.primary;
  };
  
  // Get current colors
  const colors = getReportColors(currentReportType.color);

  return (
    <div className="artisan-reports-page">
      <ArtisanSidebar />
      <div className="art-main-content">
        <ArtisanTopBar />
        
        <div className="art-fixed-height-container">
          <Card className="art-fixed-height-card">
            {!reportData ? (
              <>
                {/* Report Configuration */}
                <Card.Header className="art-card-header">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div className="art-header-icon" style={{backgroundColor: `${reportColor}20`, color: reportColor}}>
                        <FaChartBar />
                      </div>
                      <div>
                        <h5 className="mb-0 art-header-title">Artisan Reports</h5>
                        <p className="text-muted small mb-0">Generate reports to track your business performance</p>
                      </div>
                    </div>
                    
                    {activeReportType && (
                      <div className="header-report-type">
                        <span className="report-type-label">Currently viewing:</span>
                        <span className="report-type-value" style={{color: colors.primary}}>
                          {currentReportType.title}
                        </span>
                      </div>
                    )}
                  </div>
                </Card.Header>
                
                <Card.Body className="p-0 art-fixed-body">
                  {/* Error Alert */}
                  {error && (
                    <div className="alert alert-danger m-3 art-alert">
                      <div className="error-content">
                        <FaExclamationTriangle className="me-2 error-icon" />
                        <div className="error-message">{error}</div>
                      </div>
                      <Button 
                        variant="link" 
                        className="p-0 ms-auto art-close-alert" 
                        onClick={() => setError(null)}
                      >
                        <FaTimes />
                      </Button>
                    </div>
                  )}
                
                  {/* Report Configuration UI */}
                  <div className="report-config-container">
                    {/* Left Side: Report Types */}
                    <div className="report-type-container">
                      <h6 className="section-title">Report Type</h6>
                      
                      <div className="report-type-selector">
                        {reportTypes.map(reportType => {
                          const isSelected = activeReportType === reportType.id;
                          // Get colors for this specific report type
                          const reportTypeColors = getReportColors(reportType.color);
                          
                          return (
                            <div 
                              key={reportType.id}
                              className={`report-type-card ${isSelected ? 'selected' : ''}`}
                              onClick={() => setActiveReportType(reportType.id)}
                              style={isSelected ? {
                                borderColor: reportTypeColors.primary,
                                backgroundColor: `${reportTypeColors.primary}08`,
                                boxShadow: `0 5px 15px rgba(0,0,0,0.08), 0 0 0 2px ${reportTypeColors.primary}30`
                              } : {}}
                            >
                              <div 
                                className="report-type-icon" 
                                style={{
                                  background: isSelected ? reportTypeColors.gradient : '#f8f9fa',
                                  color: isSelected ? '#fff' : reportTypeColors.primary
                                }}
                              >
                                <reportType.icon />
                              </div>
                              <div className="report-type-info">
                                <h5 style={isSelected ? {color: reportTypeColors.primary} : {}}>{reportType.title}</h5>
                                <p>{reportType.description}</p>
                              </div>
                              {isSelected && (
                                <div className="report-type-check">
                                  <span className="checkmark-circle" style={{backgroundColor: reportTypeColors.primary}}>
                                    <reportType.icon className="text-white" style={{fontSize: '12px'}} />
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Right Side: Date Range & Options */}
                    <div className="report-options-container">
                      <div className="date-range-selector">
                        <h6 className="section-title">Select Date Range</h6>
                        
                        <div className="date-preset-buttons">
                          {[
                            { id: 'today', label: 'Today' },
                            { id: 'this-week', label: 'This Week' },
                            { id: 'this-month', label: 'This Month' },
                            { id: 'last-month', label: 'Last Month' },
                            { id: 'custom', label: 'Custom Range' }
                            // Removed last-3-months
                          ].map(preset => (
                            <button 
                              key={preset.id}
                              type="button"
                              className={`date-preset-btn ${dateRange.preset === preset.id ? 'active pulse' : ''}`}
                              onClick={() => handlePresetChange(preset.id)}
                              style={dateRange.preset === preset.id ? {
                                borderColor: colors.primary,
                                backgroundColor: `${colors.primary}10`,
                                boxShadow: `0 3px 10px ${colors.primary}20`
                              } : {}}
                            >
                              <span 
                                className="preset-icon"
                                style={{
                                  backgroundColor: dateRange.preset === preset.id ? colors.primary : `${colors.primary}20`,
                                  color: dateRange.preset === preset.id ? 'white' : colors.primary
                                }}
                              >
                                <FaCalendarAlt />
                              </span>
                              <span 
                                className="preset-label"
                                style={{
                                  color: dateRange.preset === preset.id ? colors.primary : ''
                                }}
                              >
                                {preset.label}
                              </span>
                              {dateRange.preset === preset.id && (
                                <span className="preset-selected">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                        
                        {/* Custom Date Range */}
                        {dateRange.preset === 'custom' && (
                          <div className="custom-date-inputs" style={{borderTopColor: colors.primary}}>
                            <div className="date-range-header">
                              <FaCalendarAlt className="date-range-icon" style={{color: colors.primary}} />
                              <span>Enter Custom Date Range</span>
                            </div>
                            
                            <div className="date-inputs-container">
                              <div className="date-input-group">
                                <label style={{color: colors.primary}}>Start Date</label>
                                <div className="date-input-wrapper">
                                  <FaCalendarAlt className="date-input-icon" />
                                  <input
                                    type="date"
                                    className="form-control"
                                    value={dateRange.startDate}
                                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                                    style={{borderColor: colors.primary}}
                                  />
                                </div>
                              </div>
                              
                              <div className="date-range-separator">
                                <span>to</span>
                              </div>
                              
                              <div className="date-input-group">
                                <label style={{color: colors.primary}}>End Date</label>
                                <div className="date-input-wrapper">
                                  <FaCalendarAlt className="date-input-icon" />
                                  <input
                                    type="date"
                                    className="form-control"
                                    value={dateRange.endDate}
                                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                                    style={{borderColor: colors.primary}}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Selected Date Range Summary */}
                        {dateRange.preset !== 'custom' && (
                          <div className="date-range-summary" style={{borderLeftColor: colors.primary}}>
                            <FaCalendarAlt className="summary-icon" style={{color: colors.primary}} />
                            <div className="date-range-info">
                              <div className="date-range-period">Selected Period</div>
                              <div className="date-range-dates">
                                <strong>{formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}</strong>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Generate Report Button */}
                        <div className="generate-report-container">
                          <button
                            type="button"
                            className="btn-generate-report"
                            onClick={handleGenerateReport}
                            disabled={loading}
                            style={{
                              background: colors.gradient,
                              boxShadow: `0 4px 15px ${colors.primary}40`
                            }}
                          >
                            <div className="generate-icon">
                              {loading ? (
                                <div className="spinner"></div>
                              ) : (
                                <FaChartLine />
                              )}
                            </div>
                            <span>{loading ? 'Generating...' : 'Generate Report'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </>
            ) : (
              // Report View Component
              <ArtisanReportViewForm
                reportData={reportData}
                reportType={activeReportType}
                dateRange={dateRange}
                onBackClick={handleBackToReportConfig}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArtisanReports;
