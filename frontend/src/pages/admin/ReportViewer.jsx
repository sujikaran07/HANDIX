import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Table, Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPrint, faFileDownload, faArrowLeft, 
  faChartLine, faBoxOpen, faUsers, faPaintBrush
} from '@fortawesome/free-solid-svg-icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../../styles/admin/ReportViewer.css';
import logo from '../../assets/handix_logo.png'; // Make sure this path is correct

// Format currency helper
const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'Rs 0.00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return 'Rs 0.00';
  return `Rs ${numValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const ReportViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [reportType, setReportType] = useState('');

  useEffect(() => {
    // Get report data from location state
    if (location.state?.reportData) {
      setReportData(location.state.reportData);
      setDateRange(location.state.dateRange);
      setReportType(location.state.reportType || 'sales');
    } else {
      // If no data passed, redirect back to reports page
      navigate('/admin/reports');
    }
  }, [location, navigate]);

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  // Handle PDF export
  const handleExportPDF = async () => {
    if (!reportRef.current) return;

    try {
      // Show a loading message
      const loadingMessage = document.createElement('div');
      loadingMessage.innerHTML = 'Generating PDF...';
      loadingMessage.style.position = 'fixed';
      loadingMessage.style.top = '50%';
      loadingMessage.style.left = '50%';
      loadingMessage.style.transform = 'translate(-50%, -50%)';
      loadingMessage.style.padding = '20px';
      loadingMessage.style.background = 'white';
      loadingMessage.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
      loadingMessage.style.borderRadius = '5px';
      loadingMessage.style.zIndex = '9999';
      document.body.appendChild(loadingMessage);

      const reportElement = reportRef.current;
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`HANDIX-${getReportTitle()}-${new Date().toLocaleDateString()}.pdf`);

      // Remove loading message
      document.body.removeChild(loadingMessage);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

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
      case 'products': return faBoxOpen;
      case 'customers': return faUsers;
      case 'artisans': return faPaintBrush;
      default: return faChartLine;
    }
  };

  if (!reportData) {
    return <div className="text-center p-5">Loading report data...</div>;
  }

  return (
    <div className="report-viewer-page">
      <Container fluid className="report-viewer-container">
        {/* Action buttons - will be hidden on print */}
        <div className="action-buttons d-print-none mb-3">
          <Button variant="outline-secondary" onClick={() => navigate('/admin/reports')}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back to Reports
          </Button>
          <div>
            <Button variant="outline-primary" onClick={handlePrint} className="me-2">
              <FontAwesomeIcon icon={faPrint} className="me-2" />
              Print
            </Button>
            <Button variant="primary" onClick={handleExportPDF}>
              <FontAwesomeIcon icon={faFileDownload} className="me-2" />
              Export PDF
            </Button>
          </div>
        </div>
        
        {/* Printable report content */}
        <div className="report-document" ref={reportRef}>
          {/* Report Header */}
          <div className="report-header">
            <div className="company-info">
              <img src={logo} alt="HANDIX Logo" className="company-logo" />
              <div>
                <h1>HANDIX</h1>
                <p>Authentic Sri Lankan Handicrafts</p>
              </div>
            </div>
            <div className="report-info">
              <h2>{getReportTitle()}</h2>
              <p className="report-period">
                <strong>Period:</strong> {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
              </p>
              <p className="report-date">
                <strong>Generated on:</strong> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Summary Section */}
          <div className="report-section">
            <h3>Summary</h3>
            <div className="summary-grid">
              {reportData.summary && Object.keys(reportData.summary).map((key, index) => (
                <div className="summary-card" key={index}>
                  <h4>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                  <p className="summary-value">
                    {typeof reportData.summary[key] === 'number' && 
                     (key.toLowerCase().includes('total') || 
                      key.toLowerCase().includes('sales') || 
                      key.toLowerCase().includes('value') || 
                      key.toLowerCase().includes('spent')) 
                      ? formatCurrency(reportData.summary[key])
                      : reportData.summary[key].toString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Visualization Section */}
          <div className="report-section">
            <h3>Visualizations</h3>
            <Row>
              <Col md={6} className="chart-col">
                <div className="report-chart">
                  <h4>Key Metrics</h4>
                  <div className="bar-chart-placeholder">
                    <div className="chart-bar" style={{height: '60%'}}><div className="chart-label">Jan</div></div>
                    <div className="chart-bar" style={{height: '75%'}}><div className="chart-label">Feb</div></div>
                    <div className="chart-bar" style={{height: '45%'}}><div className="chart-label">Mar</div></div>
                    <div className="chart-bar" style={{height: '90%'}}><div className="chart-label">Apr</div></div>
                    <div className="chart-bar" style={{height: '65%'}}><div className="chart-label">May</div></div>
                    <div className="chart-bar" style={{height: '80%'}}><div className="chart-label">Jun</div></div>
                  </div>
                </div>
              </Col>
              <Col md={6} className="chart-col">
                <div className="report-chart">
                  <h4>Distribution</h4>
                  <div className="pie-chart-container">
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
              </Col>
            </Row>
          </div>

          {/* Data Section */}
          <div className="report-section">
            <h3>Detailed Data</h3>
            <div className="table-responsive">
              {reportData.data && reportData.data.length > 0 ? (
                <Table striped bordered className="report-table">
                  <thead>
                    <tr>
                      {Object.keys(reportData.data[0]).filter(key => key !== 'id').map((key, index) => (
                        <th key={index}>{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, str => str.toUpperCase())}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.data.map((item, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.keys(item).filter(key => key !== 'id').map((key, colIndex) => (
                          <td key={colIndex}>
                            {key.toLowerCase().includes('date') && item[key]
                              ? new Date(item[key]).toLocaleDateString()
                              : key.toLowerCase().includes('amount') || 
                                key.toLowerCase().includes('sales') || 
                                key.toLowerCase().includes('revenue') || 
                                key.toLowerCase().includes('spent')
                                ? formatCurrency(item[key])
                                : key.toLowerCase().includes('growth')
                                  ? <span className={parseFloat(item[key]) >= 0 ? 'text-success' : 'text-danger'}>
                                      {parseFloat(item[key]) >= 0 ? '+' : ''}{item[key]}%
                                    </span>
                                  : item[key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="no-data">No data available for this report.</div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="report-footer">
            <p className="footer-text">HANDIX © {new Date().getFullYear()} | Authentic Sri Lankan Handicrafts</p>
            <p className="footer-note">This is an auto-generated report. For any queries, please contact admin@handix.com</p>
            <div className="page-number">Page 1 of 1</div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ReportViewer;
