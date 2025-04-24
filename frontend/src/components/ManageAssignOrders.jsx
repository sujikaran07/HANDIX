import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons';
import { FaTasks, FaPlus } from 'react-icons/fa';
import Pagination from './Pagination';
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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const artisansPerPage = 4;

  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        setLoading(true);
        
        // Update API URL to point to the correct backend server
        // Replace this URL with your actual backend URL
        const BACKEND_URL = 'http://localhost:5000'; // or whichever port your backend uses
        const response = await axios.get(`${BACKEND_URL}/api/orders/artisans-info`);
        
        console.log("API Response:", response.data);
        
        // Ensure we're setting an array to the state
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

    fetchArtisans();
  }, []);

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

  const handleDelete = (id) => {
    setArtisans(artisans.filter(artisan => artisan.id !== id));
  };

  const handleEdit = (id) => {
    const artisan = artisans.find(artisan => artisan.id === id);
    setSelectedOrder(artisan);
    setShowEditAssignOrderForm(true);
  };

  const handleAddAssignOrderClick = () => {
    setShowAddAssignOrderForm(true);
  };

  const handleCancel = () => {
    setShowAddAssignOrderForm(false);
    setShowEditAssignOrderForm(false);
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
        
        return (
          (filterStatus === 'All' || 
           (artisan.availability && artisan.availability.includes(filterStatus))) &&
          ((artisan.name && artisan.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (artisan.lastCompletedOrder && 
            artisan.lastCompletedOrder.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
           (artisan.ongoingOrders && 
            artisan.ongoingOrders.toLowerCase().includes(searchTerm.toLowerCase())))
        );
      }) 
    : [];

  const indexOfLastArtisan = currentPage * artisansPerPage;
  const indexOfFirstArtisan = indexOfLastArtisan - artisansPerPage;
  const currentArtisans = filteredArtisans.slice(indexOfFirstArtisan, indexOfLastArtisan);
  const totalPages = Math.ceil(filteredArtisans.length / artisansPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getAvailabilityColor = (availability) => {
    return availability === 'Available' ? '#28a745' : '#dc3545';
  };

  return (
    <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        {showAddAssignOrderForm ? (
          <AddAssignOrderForm onSave={handleSave} onCancel={handleCancel} />
        ) : showEditAssignOrderForm ? (
          <EditAssignOrderForm order={selectedOrder} onSave={handleSave} onCancel={handleCancel} />
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
              <div className="button-section">
                <button className="export-btn btn btn-light me-2">
                  <FontAwesomeIcon icon={faCloudDownloadAlt} /> Export
                </button>
                <button className="add-assign-order-btn btn btn-primary" onClick={handleAddAssignOrderClick}>
                  <FaPlus /> Assign Artisan
                </button>
              </div>
            </div>

            <div className="manage-request-header d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Manage Orders</h4>
              <div className="d-flex align-items-center">
                <div className="search-bar me-2">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">
                      <FontAwesomeIcon icon={faSearch} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-0"
                      placeholder="Search keyword"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="filter-dropdown">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">
                      <FontAwesomeIcon icon={faFilter} />
                    </span>
                    <select
                      className="form-select border-0"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="Available">Available</option>
                      <option value="Busy">Busy</option>
                    </select>
                  </div>
                </div>
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
                      <th>Ongoing Orders</th>
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
                          <td>{artisan.ongoingOrders}</td>
                          <td>{formatDate(artisan.lastCompletedOrder)}</td>
                          <td style={{ color: getAvailabilityColor(artisan.availability) }}>{artisan.availability}</td>
                          <td className="action-buttons">
                            <div className="dropdown">
                              <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                                Actions
                              </button>
                              <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                {artisan.canAssign && <li><button className="dropdown-item" onClick={() => handleEdit(artisan.id)}>Assign</button></li>}
                                <li><button className="dropdown-item">View</button></li>
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