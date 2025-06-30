import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from './Pagination';

const AssignArtisanModal = ({ show, handleClose, orderId, onAssignSuccess }) => {
  // State management for artisan assignment
  const [artisans, setArtisans] = useState([]);
  const [selectedArtisan, setSelectedArtisan] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const artisansPerPage = 4;
  const [isCustomized, setIsCustomized] = useState(false);

  useEffect(() => {
    if (show) {
      fetchArtisans();
      fetchOrderDetails();
    }
  }, [show, orderId]);

  // Fetch available artisans from database
  const fetchArtisans = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/artisans');
      
      // Process response data regardless of structure
      const artisanData = Array.isArray(response.data) ? response.data : [];
      
      // Normalize artisan data structure
      const processedArtisans = artisanData.map(artisan => ({
        ...artisan,
        availability: artisan.availability || 'Available',
        ongoingOrders: artisan.ongoingOrders || '0 Orders'
      }));
      
      setArtisans(processedArtisans);
      setError(null);
    } catch (error) {
      setError("Could not load artisans. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Check if order is customized to update status accordingly
  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
      setIsCustomized(response.data.customized === 'Yes');
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    }
  };

  // Assign selected artisan to the order
  const handleAssign = async () => {
    if (!selectedArtisan) {
      setError("Please select an artisan");
      return;
    }

    try {
      setSubmitting(true);
      
      // Find the selected artisan object
      const artisan = artisans.find(a => a.id === selectedArtisan);
      
      if (!artisan) {
        throw new Error('Selected artisan not found');
      }
      
      // Prepare assignment payload
      const payload = {
        assignedArtisan: artisan.name,
        assignedArtisanId: artisan.id
      };
      
      // Set status to Review for customized orders
      if (isCustomized) {
        payload.orderStatus = 'Review';
      }
      
      // Make API call to assign artisan
      const response = await axios.put(`http://localhost:5000/api/orders/${orderId}`, payload);
      
      if (isCustomized) {
        alert(`Artisan "${artisan.name}" has been assigned. The order status has been updated to "Review".`);
      } else {
        alert(`Artisan "${artisan.name}" has been assigned successfully.`);
      }
      
      onAssignSuccess();
      handleClose();
    } catch (error) {
      setError("Failed to assign artisan. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Pagination calculations
  const indexOfLastArtisan = currentPage * artisansPerPage;
  const indexOfFirstArtisan = indexOfLastArtisan - artisansPerPage;
  const currentArtisans = artisans.slice(indexOfFirstArtisan, indexOfLastArtisan);
  const totalPages = Math.ceil(artisans.length / artisansPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (!show) return null;

  return (
    <div className="container mt-4" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <div className="card" style={{ 
        borderRadius: '16px', 
        overflow: 'hidden', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="card-body p-4 d-flex flex-column">
          {/* Header with back button */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <div 
                onClick={handleClose} 
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
              <h5 className="mb-0">Assign Artisan to Order #{orderId}</h5>
            </div>
          </div>

          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading available artisans...</p>
            </div>
          ) : (
            <div className="row">
              {error && !error.includes("Please select") && (
                <div className="col-12 mb-3">
                  <div className="alert alert-danger">{error}</div>
                </div>
              )}
              
              {/* Special notice for customized orders */}
              {isCustomized && (
                <div className="col-12 mb-3">
                  <div className="alert alert-info">
                    <small><strong>Note:</strong> This is a customized order. Assigning an artisan will automatically update the order status to "Review".</small>
                  </div>
                </div>
              )}
              
              {/* Artisans table section */}
              <div className="col-md-7">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0" style={{fontSize: "14px"}}>Artisans List</h6>
                    <span className="badge bg-primary">{artisans.length} Artisans</span>
                  </div>
                  <div className="card-body p-0 d-flex flex-column">
                    <div className="table-responsive" style={{ flex: '1 0 auto', minHeight: '200px' }}>
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Workload</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentArtisans.length > 0 ? (
                            currentArtisans.map(artisan => (
                              <tr 
                                key={artisan.id} 
                                className={selectedArtisan === artisan.id ? 'table-active' : ''}
                                style={{
                                  cursor: artisan.availability === 'Busy' ? 'default' : 'pointer',
                                  opacity: artisan.availability === 'Busy' ? 0.7 : 1
                                }}
                                onClick={() => {
                                  if (artisan.availability !== 'Busy') {
                                    setSelectedArtisan(artisan.id);
                                  }
                                }}
                              >
                                <td>{artisan.id}</td>
                                <td>{artisan.name}</td>
                                <td>{typeof artisan.ongoingOrders === 'string' ? artisan.ongoingOrders : `${artisan.ongoingOrders} Orders`}</td>
                                <td>
                                  <span className={`badge ${artisan.availability === 'Available' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                    {artisan.availability}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="text-center py-3">No artisans available</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination section */}
                    <div className="border-top mt-auto py-3 px-3 bg-light" style={{ position: 'sticky', bottom: 0, marginTop: '10px' }}>
                      {artisans.length > artisansPerPage ? (
                        <Pagination 
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={handlePageChange}
                          size="sm"
                        />
                      ) : (
                        <div style={{ height: '38px' }}></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Selection and information section */}
              <div className="col-md-5">
                {/* Artisan selection dropdown */}
                <div className="card border-0 shadow-sm mb-3">
                  <div className="card-header bg-light py-2">
                    <h6 className="mb-0" style={{fontSize: "14px"}}>Select Artisan</h6>
                  </div>
                  <div className="card-body p-2">
                    <label className="text-muted small mb-1">Choose an artisan to assign:</label>
                    <select 
                      className={`form-select form-select-sm ${error && error.includes("Please select") ? "is-invalid" : ""}`}
                      value={selectedArtisan}
                      onChange={(e) => setSelectedArtisan(e.target.value)}
                      disabled={submitting}
                    >
                      <option value=""> Select an Artisan </option>
                      {artisans.map(artisan => (
                        <option 
                          key={artisan.id} 
                          value={artisan.id}
                          disabled={artisan.availability === 'Busy'}
                        >
                          {artisan.name} - {typeof artisan.ongoingOrders === 'string' ? artisan.ongoingOrders : `${artisan.ongoingOrders} Orders`} ({artisan.availability})
                        </option>
                      ))}
                    </select>
                    {error && error.includes("Please select") && (
                      <div className="invalid-feedback">{error}</div>
                    )}
                  </div>
                </div>
                
                {/* Information and notes */}
                <div className="card border-0 shadow-sm mb-3">
                  <div className="card-header bg-light py-2">
                    <h6 className="mb-0" style={{fontSize: "14px"}}>Information</h6>
                  </div>
                  <div className="card-body p-2">
                    <ul className="list-unstyled mb-0 small">
                      <li className="mb-1">
                        <span className="badge bg-success me-1">Available</span>
                        <small>Artisan can accept new orders</small>
                      </li>
                      <li className="mb-1">
                        <span className="badge bg-warning text-dark me-1">Busy</span>
                        <small>Artisan has too many ongoing orders</small>
                      </li>
                      <li>
                        <p className="small text-muted mb-0" style={{fontSize: "0.8rem"}}>
                          <strong>Note:</strong> Assigning orders to busy artisans may delay completion.
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="d-flex justify-content-end mt-4 pt-3 border-top">
            <button 
              className="btn btn-secondary me-2" 
              onClick={handleClose}
              disabled={submitting}
            >
              Back
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleAssign}
              disabled={loading || submitting || !selectedArtisan}
              style={{ width: '120px' }}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Assigning...
                </>
              ) : "Assign Artisan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignArtisanModal;
