import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCloudDownloadAlt, faHistory } from '@fortawesome/free-solid-svg-icons';
import { FaWarehouse } from 'react-icons/fa';
import Pagination from './Pagination';
import '../styles/admin/AdminInventory.css';

const ManageInventory = ({ onViewInventory }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['Carry Goods', 'Accessories', 'Clothing', 'Crafts', 'Artistry']);
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const inventoryPerPage = 4;

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        // Get the auth token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No token found in localStorage');
          setError('Authentication required. Please login again.');
          setLoading(false);
          return;
        }
        
        const response = await fetch('http://localhost:5000/api/admin/inventory', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched inventory data:', data);
          setInventory(data.inventory);
          setLoading(false);
        } else if (response.status === 401) {
          console.warn('Token expired. Attempting to refresh token...');
          const refreshResponse = await fetch('http://localhost:5000/api/login/refresh-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            console.log('Token refreshed:', refreshData.token);
            localStorage.setItem('token', refreshData.token);
            fetchInventory();
          } else {
            setError('Session expired. Please login again.');
            setLoading(false);
          }
        } else {
          setError(`Failed to fetch inventory: ${response.statusText}`);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setError('An error occurred while fetching inventory data.');
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(category)
        ? prevSelected.filter((cat) => cat !== category)
        : [...prevSelected, category]
    );
  };

  const filteredInventory = inventory.filter(item => {
    return (
      (selectedCategories.includes(item.category?.category_name)) &&
      (filterStatus === 'All' || item.product_status === filterStatus) &&
      (item.product_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.category?.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const indexOfLastInventory = currentPage * inventoryPerPage;
  const indexOfFirstInventory = indexOfLastInventory - inventoryPerPage;
  const currentInventory = filteredInventory.slice(indexOfFirstInventory, indexOfLastInventory);
  const totalPages = Math.ceil(filteredInventory.length / inventoryPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        <div className="manage-inventory-header d-flex justify-content-between align-items-center mb-3">
          <div className="title-section">
            <div className="icon-and-title">
              <FaWarehouse className="inventory-icon" />
              <div className="text-section">
                <h2>Inventory</h2>
                <p>Manage your inventory</p>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <div className="search-bar me-2">
              <div className="input-group">
                <span className="input-group-text bg-light border-0">
                  <FontAwesomeIcon icon={faSearch} />
                </span>
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ boxShadow: 'none' }}
                />
              </div>
            </div>
            <button className="export-btn btn btn-light" style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
              <FontAwesomeIcon icon={faCloudDownloadAlt} /> Export
            </button>
          </div>
        </div>

        <div className="filter-section mb-3 d-flex justify-content-between align-items-center">
          <div className="d-flex">
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                id="carryGoodsCheckbox"
                value="Carry Goods"
                checked={selectedCategories.includes('Carry Goods')}
                onChange={() => handleCategoryChange('Carry Goods')}
              />
              <label className="form-check-label" htmlFor="carryGoodsCheckbox">Carry Goods</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                id="accessoriesCheckbox"
                value="Accessories"
                checked={selectedCategories.includes('Accessories')}
                onChange={() => handleCategoryChange('Accessories')}
              />
              <label className="form-check-label" htmlFor="accessoriesCheckbox">Accessories</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                id="clothingCheckbox"
                value="Clothing"
                checked={selectedCategories.includes('Clothing')}
                onChange={() => handleCategoryChange('Clothing')}
              />
              <label className="form-check-label" htmlFor="clothingCheckbox">Clothing</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                id="craftsCheckbox"
                value="Crafts"
                checked={selectedCategories.includes('Crafts')}
                onChange={() => handleCategoryChange('Crafts')}
              />
              <label className="form-check-label" htmlFor="craftsCheckbox">Crafts</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                id="artistryCheckbox"
                value="Artistry"
                checked={selectedCategories.includes('Artistry')}
                onChange={() => handleCategoryChange('Artistry')}
              />
              <label className="form-check-label" htmlFor="artistryCheckbox">Artistry</label>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <button className="btn btn-secondary me-2">
              <FontAwesomeIcon icon={faHistory} />
            </button>
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
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: '1 1 auto', overflowY: 'auto', marginTop: '20px' }}>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading inventory data...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : (
            <table className="table table-bordered table-striped inventory-table">
              <thead>
                <tr>
                  <th>P-ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Stock Quantity</th>
                  <th>Last Updated</th>
                  <th>Stock Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentInventory.length > 0 ? (
                  currentInventory.map(item => (
                    <tr key={item.product_id}>
                      <td>{item.product_id}</td>
                      <td>{item.product_name}</td>
                      <td>{item.category?.category_name || 'N/A'}</td>
                      <td>{item.quantity}</td>
                      <td>{new Date(item.date_added).toLocaleString('en-US', { 
                        year: '2-digit', 
                        month: 'numeric', 
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}</td>
                      <td className={`stock-status ${(item.product_status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.product_status || 'Unknown'}
                      </td>
                      <td className="action-buttons">
                        <div className="dropdown">
                          <button className="btn dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                            Actions
                          </button>
                          <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <li>
                              <button className="dropdown-item">Update</button>
                            </li>
                            <li>
                              <button className="dropdown-item">Restock</button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">No inventory items available</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <Pagination className="inventory-pagination" currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default ManageInventory;
