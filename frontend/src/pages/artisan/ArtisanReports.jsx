import React, { useState, useEffect } from 'react';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import { FaFileAlt, FaDownload, FaPrint, FaCalendarAlt, FaFilter } from 'react-icons/fa';
import { Form, Button, Card, Row, Col, Table } from 'react-bootstrap';
import '../../styles/artisan/ArtisanReports.css';

const ArtisanReports = () => {
  const [reportType, setReportType] = useState('orders');
  const [dateRange, setDateRange] = useState('last30');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [productId, setProductId] = useState('');

  // Sample report data - would be fetched from API
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        // In a real app, you'd fetch from API based on parameters
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (reportType === 'orders') {
          setReportData([
            { id: 'O123', date: '2023-09-15', customer: 'John Smith', status: 'Completed', total: 'Rs. 4,500' },
            { id: 'O124', date: '2023-09-17', customer: 'Emily Brown', status: 'In Production', total: 'Rs. 2,800' },
            { id: 'O125', date: '2023-09-20', customer: 'Sarah Wilson', status: 'Completed', total: 'Rs. 3,200' },
            { id: 'O126', date: '2023-09-22', customer: 'Mark Johnson', status: 'In Production', total: 'Rs. 1,950' },
            { id: 'O127', date: '2023-09-25', customer: 'Lisa Williams', status: 'Completed', total: 'Rs. 5,300' }
          ]);
        } else if (reportType === 'products') {
          setReportData([
            { id: 'P101', name: 'Handwoven Basket', quantity: 15, status: 'Available', sales: 28 },
            { id: 'P102', name: 'Artisan Vase', quantity: 8, status: 'Low Stock', sales: 42 },
            { id: 'P103', name: 'Handmade Rug', quantity: 5, status: 'Low Stock', sales: 12 },
            { id: 'P104', name: 'Carved Wooden Bowl', quantity: 20, status: 'Available', sales: 35 },
            { id: 'P105', name: 'Embroidered Cushion', quantity: 0, status: 'Out of Stock', sales: 18 }
          ]);
        } else if (reportType === 'performance') {
          setReportData([
            { month: 'January', completed: 12, ratings: 4.7, onTime: '95%', revisions: 2 },
            { month: 'February', completed: 9, ratings: 4.8, onTime: '100%', revisions: 0 },
            { month: 'March', completed: 15, ratings: 4.5, onTime: '93%', revisions: 3 },
            { month: 'April', completed: 10, ratings: 4.9, onTime: '100%', revisions: 1 },
            { month: 'May', completed: 14, ratings: 4.6, onTime: '95%', revisions: 2 }
          ]);
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [reportType, dateRange, startDate, endDate]);
  
  const handleGenerateReport = (e) => {
    e.preventDefault();
    // Implementation would trigger API call with parameters
    console.log('Generating report with:', { reportType, dateRange, startDate, endDate, customerId, productId });
  };
  
  const handleExportPDF = () => {
    console.log('Exporting as PDF');
    // PDF export implementation
  };
  
  const handleExportCSV = () => {
    console.log('Exporting as CSV');
    // CSV export implementation
  };
  
  const handlePrint = () => {
    console.log('Printing report');
    window.print();
  };
  
  // Get current date in YYYY-MM-DD format for max date in date pickers
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className="artisan-reports-page">
      <ArtisanSidebar />
      <div className="artisan-main-content">
        <ArtisanTopBar />
        
        <div className="container mt-4 reports-container">
          <div className="card p-4 reports-card">
            <div className="reports-header manage-orders-header d-flex justify-content-between align-items-center mb-3">
              <div className="title-section">
                <div className="icon-and-title">
                  <FaFileAlt className="reports-icon" />
                  <div className="text-section">
                    <h2>Reports</h2>
                    <p>Generate and analyze your performance reports</p>
                  </div>
                </div>
              </div>
              <div className="d-flex">
                <Button variant="outline-secondary" className="me-2" onClick={handleExportPDF}>
                  <FaDownload /> PDF
                </Button>
                <Button variant="outline-secondary" className="me-2" onClick={handleExportCSV}>
                  <FaDownload /> CSV
                </Button>
                <Button variant="outline-secondary" onClick={handlePrint}>
                  <FaPrint /> Print
                </Button>
              </div>
            </div>
            
            <div className="reports-content">
              <Row>
                <Col lg={3} md={4}>
                  <Card className="report-sidebar mb-3">
                    <Card.Header>Report Options</Card.Header>
                    <Card.Body>
                      <Form onSubmit={handleGenerateReport}>
                        <Form.Group className="mb-3">
                          <Form.Label>Report Type</Form.Label>
                          <Form.Select 
                            value={reportType} 
                            onChange={(e) => setReportType(e.target.value)}
                          >
                            <option value="orders">Order Reports</option>
                            <option value="products">Product Reports</option>
                            <option value="performance">Performance Reports</option>
                          </Form.Select>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Date Range</Form.Label>
                          <Form.Select 
                            value={dateRange} 
                            onChange={(e) => setDateRange(e.target.value)}
                          >
                            <option value="last7">Last 7 Days</option>
                            <option value="last30">Last 30 Days</option>
                            <option value="last90">Last 90 Days</option>
                            <option value="custom">Custom Range</option>
                          </Form.Select>
                        </Form.Group>
                        
                        {dateRange === 'custom' && (
                          <>
                            <Form.Group className="mb-3">
                              <Form.Label>Start Date</Form.Label>
                              <Form.Control 
                                type="date" 
                                max={today}
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)} 
                              />
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                              <Form.Label>End Date</Form.Label>
                              <Form.Control 
                                type="date" 
                                max={today}
                                value={endDate} 
                                onChange={(e) => setEndDate(e.target.value)} 
                              />
                            </Form.Group>
                          </>
                        )}
                        
                        {reportType === 'orders' && (
                          <Form.Group className="mb-3">
                            <Form.Label>Customer ID (Optional)</Form.Label>
                            <Form.Control 
                              type="text" 
                              value={customerId} 
                              onChange={(e) => setCustomerId(e.target.value)} 
                              placeholder="Enter customer ID"
                            />
                          </Form.Group>
                        )}
                        
                        {reportType === 'products' && (
                          <Form.Group className="mb-3">
                            <Form.Label>Product ID (Optional)</Form.Label>
                            <Form.Control 
                              type="text" 
                              value={productId} 
                              onChange={(e) => setProductId(e.target.value)} 
                              placeholder="Enter product ID"
                            />
                          </Form.Group>
                        )}
                        
                        <Button 
                          variant="primary" 
                          type="submit" 
                          className="w-100"
                        >
                          <FaFilter className="me-2" />
                          Generate Report
                        </Button>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={9} md={8}>
                  <Card className="report-content">
                    <Card.Header>
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                          {reportType === 'orders' && 'Order Report'}
                          {reportType === 'products' && 'Product Report'}
                          {reportType === 'performance' && 'Performance Report'}
                        </h5>
                        <div className="report-date">
                          <FaCalendarAlt className="me-2" />
                          {dateRange === 'custom' ? `${startDate || 'Start'} to ${endDate || 'End'}` : 
                           dateRange === 'last7' ? 'Last 7 Days' : 
                           dateRange === 'last30' ? 'Last 30 Days' : 'Last 90 Days'}
                        </div>
                      </div>
                    </Card.Header>
                    
                    <Card.Body className="report-table-container">
                      {loading ? (
                        <div className="text-center my-5">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2">Loading report data...</p>
                        </div>
                      ) : reportData.length > 0 ? (
                        <div className="table-responsive">
                          {reportType === 'orders' && (
                            <Table striped bordered hover>
                              <thead>
                                <tr>
                                  <th>Order ID</th>
                                  <th>Date</th>
                                  <th>Customer</th>
                                  <th>Status</th>
                                  <th>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {reportData.map((order, index) => (
                                  <tr key={index}>
                                    <td>{order.id}</td>
                                    <td>{order.date}</td>
                                    <td>{order.customer}</td>
                                    <td>{order.status}</td>
                                    <td>{order.total}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          )}
                          
                          {reportType === 'products' && (
                            <Table striped bordered hover>
                              <thead>
                                <tr>
                                  <th>Product ID</th>
                                  <th>Name</th>
                                  <th>Quantity</th>
                                  <th>Status</th>
                                  <th>Total Sales</th>
                                </tr>
                              </thead>
                              <tbody>
                                {reportData.map((product, index) => (
                                  <tr key={index}>
                                    <td>{product.id}</td>
                                    <td>{product.name}</td>
                                    <td>{product.quantity}</td>
                                    <td>{product.status}</td>
                                    <td>{product.sales}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          )}
                          
                          {reportType === 'performance' && (
                            <Table striped bordered hover>
                              <thead>
                                <tr>
                                  <th>Period</th>
                                  <th>Completed Orders</th>
                                  <th>Avg. Rating</th>
                                  <th>On-Time Rate</th>
                                  <th>Revisions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {reportData.map((perf, index) => (
                                  <tr key={index}>
                                    <td>{perf.month}</td>
                                    <td>{perf.completed}</td>
                                    <td>{perf.ratings}</td>
                                    <td>{perf.onTime}</td>
                                    <td>{perf.revisions}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          )}
                        </div>
                      ) : (
                        <div className="text-center my-5">
                          <p className="text-muted">No report data available for the selected criteria</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisanReports;
