import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import Pagination from '../Pagination';

const ShippingManagement = () => {
  // State management for shipping rates 
  const [shippingRates, setShippingRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 7;
  
  useEffect(() => {
    // Load initial shipping rates data 
    setTimeout(() => {
      const mockRates = [
        { id: 1, location: 'Colombo', district: 'Western Province', base_rate: 250, additional_rate: 50, free_shipping_threshold: 5000, status: 'active' },
        { id: 2, location: 'Kandy', district: 'Central Province', base_rate: 350, additional_rate: 75, free_shipping_threshold: 5000, status: 'active' },
        { id: 3, location: 'Galle', district: 'Southern Province', base_rate: 400, additional_rate: 100, free_shipping_threshold: 6000, status: 'active' },
        { id: 4, location: 'Jaffna', district: 'Northern Province', base_rate: 500, additional_rate: 120, free_shipping_threshold: 7500, status: 'inactive' },
        { id: 5, location: 'Batticaloa', district: 'Eastern Province', base_rate: 450, additional_rate: 100, free_shipping_threshold: 7000, status: 'active' },
        { id: 6, location: 'Anuradhapura', district: 'North Central Province', base_rate: 400, additional_rate: 90, free_shipping_threshold: 6500, status: 'active' },
      ];
      setShippingRates(mockRates);
      setLoading(false);
    }, 1000);
  }, []);

  // Render action dropdown menu for each shipping rate
  const renderActionMenu = (rate) => {
    return (
      <div className="dropdown">
        <button 
          className="btn btn-sm btn-outline-secondary dropdown-toggle" 
          type="button" 
          id={`dropdownMenu-${rate.id}`} 
          data-bs-toggle="dropdown" 
          aria-expanded="false"
        >
          Actions
        </button>
        <ul className="dropdown-menu shadow" aria-labelledby={`dropdownMenu-${rate.id}`}>
          <li>
            <button className="dropdown-item" onClick={() => handleEdit(rate)}>
              <FontAwesomeIcon icon={faEdit} className="me-2" /> Edit
            </button>
          </li>
          <li>
            <button className="dropdown-item" onClick={() => handleDelete(rate.id)}>
              <FontAwesomeIcon icon={faTrash} className="me-2" /> Delete
            </button>
          </li>
        </ul>
      </div>
    );
  };

  // Handle editing shipping rate
  const handleEdit = (rate) => {
    alert(`Editing shipping rate for ${rate.location}`);
  };

  // Handle shipping rate deletion with confirmation
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this shipping rate?')) {
      setShippingRates(prev => prev.filter(rate => rate.id !== id));
      alert('Shipping rate deleted successfully');
    }
  };

  // Filter shipping rates based on search criteria
  const filteredRates = shippingRates.filter(rate => 
    rate.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rate.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRates = filteredRates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRates.length / itemsPerPage);

  return (
    <div>
      {/* Search and add new shipping rate section */}
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="search-bar">
            <div className="input-group">
              <span className="input-group-text bg-light border-0">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input
                type="text"
                className="form-control border-0"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ boxShadow: 'none' }}
              />
            </div>
          </div>
        </div>
        <div className="col-md-6 text-end">
          <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#shippingRateModal">
            <FontAwesomeIcon icon={faPlus} /> Add Shipping Rate
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Shipping rates table */}
          <div className="table-responsive">
            <table className="table table-bordered table-striped inventory-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Location</th>
                  <th>District/Province</th>
                  <th>Base Rate</th>
                  <th>Additional Rate</th>
                  <th>Free Shipping</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRates.length > 0 ? (
                  currentRates.map((rate) => (
                    <tr key={rate.id}>
                      <td>{rate.id}</td>
                      <td>{rate.location}</td>
                      <td>{rate.district}</td>
                      <td>Rs {rate.base_rate}</td>
                      <td>Rs {rate.additional_rate}/kg</td>
                      <td>
                        {rate.free_shipping_threshold ? 
                          `Over Rs ${rate.free_shipping_threshold}` : 
                          'Not applicable'}
                      </td>
                      <td>
                        <span className={`badge ${rate.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                          {rate.status}
                        </span>
                      </td>
                      <td className="text-center">
                        {renderActionMenu(rate)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">No shipping rates found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="inventory-pagination"
          />
        </>
      )}

      {/* Modal for Add/Edit Form would go here */}
    </div>
  );
};

export default ShippingManagement;
