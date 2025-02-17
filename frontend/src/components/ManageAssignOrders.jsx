import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons';
import { FaTasks, FaPlus } from 'react-icons/fa';
import Pagination from './Pagination';

const ManageAssignOrders = ({ onAddAssignOrderClick }) => {
  const [artisans, setArtisans] = useState([
    { id: 'A001', name: 'Emily Carter', availability: 'Available', lastCompletedOrder: 'Jan 15, 2025', ongoingOrders: '1 Order', expertise: 'Handloom', canAssign: true },
    { id: 'A002', name: 'Michael Brown', availability: 'Busy', lastCompletedOrder: 'Feb 5, 2025', ongoingOrders: '3 Orders', expertise: 'Pottery', canAssign: false },
    { id: 'A003', name: 'Sarah Johnson', availability: 'Available', lastCompletedOrder: 'Jan 28, 2025', ongoingOrders: '0 Orders', expertise: 'Wood Carving', canAssign: true },
    { id: 'A004', name: 'John Doe', availability: 'Available', lastCompletedOrder: 'Mar 10, 2025', ongoingOrders: '2 Orders', expertise: 'Metal Work', canAssign: true },
    { id: 'A005', name: 'Jane Smith', availability: 'Busy', lastCompletedOrder: 'Apr 1, 2025', ongoingOrders: '4 Orders', expertise: 'Textiles', canAssign: false },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddAssignOrderForm, setShowAddAssignOrderForm] = useState(false);
  const [showEditAssignOrderForm, setShowEditAssignOrderForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const artisansPerPage = 4;

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

  const filteredArtisans = artisans.filter(artisan => {
    return (
      (filterStatus === 'All' || artisan.availability.includes(filterStatus)) &&
      (artisan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       artisan.lastCompletedOrder.toLowerCase().includes(searchTerm.toLowerCase()) ||
       artisan.ongoingOrders.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

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
              <table className="table table-bordered table-striped assign-order-table">
                <thead>
                  <tr>
                    <th>Artisan ID</th>
                    <th>Artisan Name</th>
                    <th>Availability</th>
                    <th>Last Completed Order</th>
                    <th>Ongoing Orders</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentArtisans.length > 0 ? (
                    currentArtisans.map(artisan => (
                      <tr key={artisan.id}>
                        <td>{artisan.id}</td>
                        <td>{artisan.name}</td>
                        <td style={{ color: getAvailabilityColor(artisan.availability) }}>{artisan.availability}</td>
                        <td>{artisan.lastCompletedOrder}</td>
                        <td>{artisan.ongoingOrders}</td>
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
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </div>
    </div>
  );
};

export default ManageAssignOrders;