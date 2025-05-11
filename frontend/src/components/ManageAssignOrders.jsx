import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCloudDownloadAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FaTasks, FaPlus } from 'react-icons/fa';
import Pagination from './Pagination';
import AssignOrderForm from './AssignOrderForm'; // Import AssignOrderForm component
import axios from 'axios';

const ManageAssignOrders = ({ onAddAssignOrderClick }) => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddAssignOrderForm, setShowAddAssignOrderForm] = useState(false);
  const [showEditAssignOrderForm, setShowEditAssignOrderForm] = useState(false);
  const [selectedArtisan, setSelectedArtisan] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [artisanWorkload, setArtisanWorkload] = useState(null);
  const artisansPerPage = 4;

  useEffect(() => {
    fetchArtisans();
  }, []);

  const fetchArtisans = async () => {
    try {
      setLoading(true);
      setError(null);
     
      const BACKEND_URL = 'http://localhost:5000'; 
      const response = await axios.get(`${BACKEND_URL}/api/artisans`);
      
      console.log("API Response:", response.data);
      
      if (Array.isArray(response.data)) {
        setArtisans(response.data);
      } else {
        console.error("API did not return an array:", response.data);
        setArtisans([]);
        setError("Invalid data format received from server");
      }
    } catch (err) {
      console.error('Error fetching artisans data:', err);
      setError('Failed to load artisans. Please try again later.');
      setArtisans([]); 
    } finally {
      setLoading(false);
    }
  };

  const fetchArtisanWorkload = async (id) => {
    try {
      setLoading(true);
      const BACKEND_URL = 'http://localhost:5000';
      const response = await axios.get(`${BACKEND_URL}/api/artisans/${id}/workload`);
      console.log("Workload data:", response.data);
      setArtisanWorkload(response.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error(`Error fetching workload for artisan ${id}:`, err);
      setError(`Failed to load details for artisan ${id}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'No orders completed') return dateString;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
    
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (err) {
      return dateString;
    }
  };

  const handleEdit = (id) => {
    const artisan = artisans.find(artisan => artisan.id === id);
    setSelectedArtisan(artisan);
    setShowEditAssignOrderForm(true);
    // Removed the reference to onAssignArtisan since it's not defined
  };

  const handleViewDetails = (id) => {
    const artisan = artisans.find(artisan => artisan.id === id);
    setSelectedArtisan(artisan);
    fetchArtisanWorkload(id);
  };

  const handleAddAssignOrderClick = () => {
    if (onAddAssignOrderClick) {
      onAddAssignOrderClick();
    }
    setShowAddAssignOrderForm(true);
  };

  const handleCancel = () => {
    setShowAddAssignOrderForm(false);
    setShowEditAssignOrderForm(false);
    setShowDetailModal(false);
    setSelectedArtisan(null);
    setArtisanWorkload(null);
  };

  const handleSave = (newOrder) => {
    if (showEditAssignOrderForm) {
      setArtisans(artisans.map(artisan => artisan.id === newOrder.id ? newOrder : artisan));
    } else {
      setArtisans([...artisans, newOrder]);
    }
    setShowAddAssignOrderForm(false);
    setShowEditAssignOrderForm(false);
  };

  const filteredArtisans = Array.isArray(artisans) 
    ? artisans.filter(artisan => {
        if (!artisan) return false;
        
        // Search term filter
        const matchesSearch = 
          (artisan.name && artisan.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (artisan.email && artisan.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (artisan.id && artisan.id.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Status filter
        const matchesStatus = 
          filterStatus === 'All' || 
          artisan.availability === filterStatus;
        
        return matchesSearch && matchesStatus;
      }) 
    : [];

  const indexOfLastArtisan = currentPage * artisansPerPage;
  const indexOfFirstArtisan = indexOfLastArtisan - artisansPerPage;
  const currentArtisans = filteredArtisans.slice(indexOfFirstArtisan, indexOfLastArtisan);
  const totalPages = Math.ceil(filteredArtisans.length / artisansPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Updated to properly display availability based on order thresholds
  const getAvailabilityColor = (availability) => {
    return availability === 'Available' ? '#28a745' : '#dc3545';
  };

  const getAvailabilityInfo = (artisan) => {
    if (!artisan) return '';
    
    // Extract numbers from ongoingOrders string (e.g., "3 Orders" -> 3)
    const orderCount = parseInt(artisan.ongoingOrders) || 0;
    
    if (artisan.availability === 'Busy') {
      return `${artisan.availability} (${artisan.ongoingOrders})`;
    } else {
      return `${artisan.availability} (${artisan.ongoingOrders})`;
    }
  };

  // Add the missing getBadgeClass function
  const getBadgeClass = (customized) => {
    return customized ? 'bg-warning text-dark' : 'bg-info text-white';
  };

  return (
    <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        {showAddAssignOrderForm ? (
          <div>Add AssignOrderForm placeholder - replace with your component</div>
        ) : showEditAssignOrderForm && selectedArtisan ? (
          <AssignOrderForm 
            onSave={handleSave} 
            onCancel={handleCancel}
            artisan={selectedArtisan}
          />
        ) : showDetailModal && selectedArtisan && artisanWorkload ? (
          <div className="artisan-detail-view">
            <div className="d-flex align-items-center mb-3">
              <div 
                onClick={handleCancel} 
                className="me-3 d-flex align-items-center justify-content-center"
                style={{
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#f8f9fa',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                title="Back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                </svg>
              </div>
              <h4 className="mb-0">Artisan Details</h4>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-light py-2">
                    <h6 className="mb-0">Basic Information</h6>
                  </div>
                  <div className="card-body p-2">
                    <div className="row g-2">
                      <div className="col-sm-4">
                        <small className="text-muted">ID:</small>
                        <p className="mb-2">{selectedArtisan.id}</p>
                      </div>
                      <div className="col-sm-4">
                        <small className="text-muted">Name:</small>
                        <p className="mb-2">{selectedArtisan.name}</p>
                      </div>
                      <div className="col-sm-4">
                        <small className="text-muted">Phone:</small>
                        <p className="mb-2">{selectedArtisan.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="row g-2">
                      <div className="col-sm-8">
                        <small className="text-muted">Email:</small>
                        <p className="mb-2">{selectedArtisan.email}</p>
                      </div>
                      <div className="col-sm-4">
                        <small className="text-muted">Availability:</small>
                        <p className="mb-0" style={{color: getAvailabilityColor(artisanWorkload.availability)}}>
                          {artisanWorkload.availability}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-light py-2">
                    <h6 className="mb-0">Order Summary</h6>
                  </div>
                  <div className="card-body p-2">
                    <div className="row g-2">
                      <div className="col-sm-6">
                        <small className="text-muted">Total Ongoing Orders:</small>
                        <p className="mb-2">{artisanWorkload.ongoingOrdersCount}</p>
                      </div>
                      <div className="col-sm-6">
                        <small className="text-muted">Last Completed:</small>
                        <p className="mb-2">{artisanWorkload.lastCompletedOrder ? formatDate(artisanWorkload.lastCompletedOrder.completedDate) : 'No completed orders'}</p>
                      </div>
                    </div>
                    <div className="row g-2">
                      <div className="col-sm-6">
                        <small className="text-muted">Customized Orders:</small>
                        <p className="mb-2">{artisanWorkload.customizedOrdersCount || 0}</p>
                      </div>
                      <div className="col-sm-6">
                        <small className="text-muted">Regular Orders:</small>
                        <p className="mb-0">{artisanWorkload.regularOrdersCount || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light py-2">
                <h6 className="mb-0">Ongoing Orders</h6>
              </div>
              <div className="card-body p-2">
                {artisanWorkload.ongoingOrders && artisanWorkload.ongoingOrders.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {artisanWorkload.ongoingOrders.map(order => (
                          <tr key={order.orderId}>
                            <td>{order.orderId}</td>
                            <td>{order.customerName}</td>
                            <td>{formatDate(order.orderDate)}</td>
                            <td>
                              <span className={`badge ${getBadgeClass(order.customized)}`}>
                                {order.customized ? 'Customized' : 'Regular'}
                              </span>
                            </td>
                            <td>{order.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center">No ongoing orders</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="manage-assign-order-header d-flex justify-content-between align-items-center mb-3">
              <div className="title-section">
                <div className="icon-and-title">
                  <FaTasks className="assign-order-icon" />
                  <div className="text-section">
                    <h2>Assign Orders</h2>
                    <p>Manage your assigned orders</p>
                  </div>
                </div>
              </div>
              <div className="button-section d-flex align-items-center">
                {/* Search bar moved to left of export button */}
                <div className="search-bar me-3">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">
                      <FontAwesomeIcon icon={faSearch} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-0"
                      placeholder="Search artisan"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: '180px' }}
                    />
                  </div>
                </div>
                <button className="export-btn btn btn-light">
                  <FontAwesomeIcon icon={faCloudDownloadAlt} /> Export
                </button>
              </div>
            </div>

            {/* Filter section - Updated to match ManageOrder.jsx style */}
            <div className="filter-section mb-4 d-flex justify-content-between align-items-center">
              <div className="d-flex">
                <span className="me-2">Filter by availability:</span>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="filterAll"
                    name="filterStatus"
                    value="All"
                    checked={filterStatus === 'All'}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="filterAll">All</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="filterAvailable"
                    name="filterStatus"
                    value="Available"
                    checked={filterStatus === 'Available'}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="filterAvailable">Available</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="filterBusy"
                    name="filterStatus"
                    value="Busy"
                    checked={filterStatus === 'Busy'}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="filterBusy">Busy</label>
                </div>
              </div>
              <div>
                <small className="text-muted">
                  Showing {filteredArtisans.length} artisans {filterStatus !== 'All' ? `(${filterStatus})` : ''}
                </small>
              </div>
            </div>

            <div style={{ flex: '1 1 auto', overflowY: 'auto' }}>
              {loading ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading artisans data...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              ) : (
                <table className="table table-bordered table-striped assign-order-table">
                  <thead>
                    <tr>
                      <th>E-ID</th>
                      <th>Artisan Name</th>
                      <th>Workload</th>
                      <th>Last Order Completed</th>
                      <th>Availability</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentArtisans.length > 0 ? (
                      currentArtisans.map(artisan => (
                        <tr key={artisan.id}>
                          <td>{artisan.id}</td>
                          <td>{artisan.name}</td>
                          <td>{artisan.ongoingOrders || '0 Orders'}</td>
                          <td>{formatDate(artisan.lastCompletedOrder) || 'No completed orders'}</td>
                          <td style={{ color: getAvailabilityColor(artisan.availability) }}>
                            {artisan.availability || 'Available'}
                          </td>
                          <td className="action-buttons">
                            <div className="dropdown">
                              <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                                Actions
                              </button>
                              <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <li>
                                  <button className="dropdown-item" onClick={() => handleViewDetails(artisan.id)}>
                                    View
                                  </button>
                                </li>

                                {(artisan.canAssign || artisan.availability === 'Available') && (
                                  <li>
                                    <button 
                                      className="dropdown-item" 
                                      onClick={() => handleEdit(artisan.id)}
                                    >
                                      Assign 
                                    </button>
                                  </li>
                                )}
                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">No artisans available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {!loading && !error && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManageAssignOrders;