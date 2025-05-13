import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faSearch, faCalendarAlt, faDownload, faFileExcel, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import '../../styles/admin/AdminReports.css';

const AdminReportsPage = () => {
  const [currentReport, setCurrentReport] = useState('sales');
  const [timeRange, setTimeRange] = useState('this-month');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Set default date range
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    setCustomDateRange({
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
    
    // Simulate loading report data
    setTimeout(() => {
      const mockData = generateMockReportData(currentReport);
      setReportData(mockData);
      setLoading(false);
    }, 1000);
  }, [currentReport]);

  const generateMockReportData = (reportType) => {
    // Generate some fake data based on report type
    switch(reportType) {
      case 'sales':
        return {
          title: 'Sales Report',
          summary: {
            totalSales: 45850,
            orderCount: 86,
            averageOrderValue: 533.14
          },
          data: [
            { id: 1, name: 'Hand-woven Basket', sales: 12500, quantity: 25, growth: 15 },
            { id: 2, name: 'Ceramic Pottery Set', sales: 9800, quantity: 14, growth: 5 },
            { id: 3, name: 'Handmade Wall Hanging', sales: 7600, quantity: 19, growth: 12 },
            { id: 4, name: 'Traditional Textile', sales: 6200, quantity: 8, growth: -3 },
            { id: 5, name: 'Wooden Sculptures', sales: 9750, quantity: 13, growth: 8 }
          ]
        };
      case 'products':
        return {
          title: 'Product Performance Report',
          summary: {
            totalProducts: 42,
            productsOutOfStock: 5,
            productsLowStock: 8
          },
          data: [
            { id: 1, name: 'Hand-woven Basket', views: 456, conversions: 25, conversionRate: 5.5 },
            { id: 2, name: 'Ceramic Pottery Set', views: 389, conversions: 14, conversionRate: 3.6 },
            { id: 3, name: 'Handmade Wall Hanging', views: 512, conversions: 19, conversionRate: 3.7 },
            { id: 4, name: 'Traditional Textile', views: 267, conversions: 8, conversionRate: 3.0 },
            { id: 5, name: 'Wooden Sculptures', views: 423, conversions: 13, conversionRate: 3.1 }
          ]
        };
      case 'customers':
        return {
          title: 'Customer Activity Report',
          summary: {
            totalCustomers: 152,
            newCustomers: 24,
            returningCustomers: 63
          },
          data: [
            { id: 1, name: 'John Smith', orders: 5, totalSpent: 2680, lastOrder: '2023-07-12' },
            { id: 2, name: 'Mary Johnson', orders: 3, totalSpent: 1250, lastOrder: '2023-07-20' },
            { id: 3, name: 'David Williams', orders: 7, totalSpent: 3540, lastOrder: '2023-07-23' },
            { id: 4, name: 'Sarah Brown', orders: 2, totalSpent: 950, lastOrder: '2023-07-18' },
            { id: 5, name: 'Michael Davis', orders: 4, totalSpent: 1870, lastOrder: '2023-07-25' }
          ]
        };
      case 'artisans':
        return {
          title: 'Artisan Performance Report',
          summary: {
            totalArtisans: 28,
            activeArtisans: 22,
            topPerformer: 'John Craftsman'
          },
          data: [
            { id: 1, name: 'John Craftsman', products: 12, sales: 15800, rating: 4.8 },
            { id: 2, name: 'Sarah Weaver', products: 8, sales: 11200, rating: 4.7 },
            { id: 3, name: 'Michael Potter', products: 10, sales: 9600, rating: 4.5 },
            { id: 4, name: 'Emma Textile', products: 6, sales: 7300, rating: 4.9 },
            { id: 5, name: 'Robert Woodwork', products: 9, sales: 12400, rating: 4.6 }
          ]
        };
      default:
        return { title: 'No Data', data: [] };
    }
  };

  const handleGenerateReport = () => {
    setLoading(true);
    setTimeout(() => {
      const mockData = generateMockReportData(currentReport);
      setReportData(mockData);
      setLoading(false);
      alert('Report generated successfully!');
    }, 1000);
  };

  const handleExport = (format) => {
    alert(`Exporting ${currentReport} report as ${format}`);
  };

  const renderSummaryCards = () => {
    if (!reportData || !reportData.summary) return null;
    
    const summary = reportData.summary;
    return (
      <div className="row mb-4">
        {Object.keys(summary).map((key, index) => (
          <div className="col-md-4" key={index}>
            <div className="card">
              <div className="card-body text-center">
                <h3 className="fs-4 fw-bold text-primary">
                  {typeof summary[key] === 'number' && summary[key] > 1000 
                    ? `Rs ${summary[key].toLocaleString()}` 
                    : summary[key].toString()}
                </h3>
                <p className="mb-0 text-muted">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderReportTable = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      return <p className="text-center">No data available for this report.</p>;
    }
    
    const data = reportData.data;
    const headers = Object.keys(data[0]).filter(key => key !== 'id');
    
    return (
      <div className="table-responsive">
        <table className="table table-bordered table-striped inventory-table">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                {headers.map((header, index) => (
                  <td key={index}>
                    {header === 'sales' || header === 'totalSpent' 
                      ? `Rs ${item[header].toLocaleString()}` 
                      : header === 'conversionRate' || header === 'rating'
                        ? `${item[header]}${header === 'conversionRate' ? '%' : ''}`
                        : header === 'growth'
                          ? <span className={item[header] >= 0 ? 'text-success' : 'text-danger'}>
                              {item[header] >= 0 ? '+' : ''}{item[header]}%
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

  return (
    <div className="admin-inventory-page reports-page">
      <AdminSidebar />
      <div className="main-content">
        <AdminTopbar />
        <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
          <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', height: '100%' }}>
            <div className="manage-inventory-header d-flex justify-content-between align-items-center mb-3">
              <div className="title-section">
                <div className="icon-and-title">
                  <FontAwesomeIcon icon={faChartBar} className="inventory-icon" />
                  <div className="text-section">
                    <h2>Reports & Analytics</h2>
                    <p>Generate and analyze business performance reports</p>
                  </div>
                </div>
              </div>
              <div className="dropdown">
                <button className="export-btn btn btn-light dropdown-toggle" type="button" id="exportDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  <FontAwesomeIcon icon={faDownload} className="me-2" /> Export
                </button>
                <ul className="dropdown-menu" aria-labelledby="exportDropdown">
                  <li><button className="dropdown-item" onClick={() => handleExport('pdf')}><FontAwesomeIcon icon={faFilePdf} className="me-2" /> Export as PDF</button></li>
                  <li><button className="dropdown-item" onClick={() => handleExport('excel')}><FontAwesomeIcon icon={faFileExcel} className="me-2" /> Export as Excel</button></li>
                </ul>
              </div>
            </div>
            
            <div className="row mb-4">
              <div className="col-md-8">
                <div className="segmented-control">
                  <div className="btn-group">
                    <button 
                      type="button" 
                      className={`btn ${currentReport === 'sales' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setCurrentReport('sales')}
                    >
                      Sales
                    </button>
                    <button 
                      type="button" 
                      className={`btn ${currentReport === 'products' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setCurrentReport('products')}
                    >
                      Products
                    </button>
                    <button 
                      type="button" 
                      className={`btn ${currentReport === 'customers' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setCurrentReport('customers')}
                    >
                      Customers
                    </button>
                    <button 
                      type="button" 
                      className={`btn ${currentReport === 'artisans' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setCurrentReport('artisans')}
                    >
                      Artisans
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="search-bar">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">
                      <FontAwesomeIcon icon={faSearch} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-0"
                      placeholder="Search in report..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ boxShadow: 'none' }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card mb-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-8 d-flex align-items-center">
                    <div className="btn-group btn-group-sm me-3">
                      <button 
                        type="button" 
                        className={`btn ${timeRange === 'today' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setTimeRange('today')}
                      >
                        Today
                      </button>
                      <button 
                        type="button" 
                        className={`btn ${timeRange === 'this-week' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setTimeRange('this-week')}
                      >
                        This Week
                      </button>
                      <button 
                        type="button" 
                        className={`btn ${timeRange === 'this-month' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setTimeRange('this-month')}
                      >
                        This Month
                      </button>
                      <button 
                        type="button" 
                        className={`btn ${timeRange === 'custom' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setTimeRange('custom')}
                      >
                        Custom
                      </button>
                    </div>
                  </div>
                  <div className="col-md-4">
                    {timeRange === 'custom' && (
                      <div className="d-flex">
                        <div className="input-group input-group-sm me-2">
                          <span className="input-group-text bg-light">
                            <FontAwesomeIcon icon={faCalendarAlt} />
                          </span>
                          <input
                            type="date"
                            className="form-control"
                            value={customDateRange.startDate}
                            onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
                          />
                        </div>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-light">
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
                    )}
                  </div>
                </div>
                <div className="d-flex justify-content-end mt-3">
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={handleGenerateReport}
                    disabled={loading}
                  >
                    {loading ? 'Generating...' : 'Generate Report'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="report-content">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Generating report...</p>
                </div>
              ) : reportData ? (
                <div>
                  <h4 className="mb-4">{reportData.title}</h4>
                  {renderSummaryCards()}
                  {renderReportTable()}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p>Select a report type and date range, then click "Generate Report"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
