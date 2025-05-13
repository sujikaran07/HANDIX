import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons';
import { FaWarehouse } from 'react-icons/fa';
import Pagination from './Pagination';
import '../styles/admin/AdminInventory.css';

const ManageInventory = ({ onViewInventory, onRestockProduct, onManageCategories }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['Carry Goods', 'Accessories', 'Clothing', 'Crafts', 'Artistry']);
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const inventoryPerPage = 7;
  const [refreshKey, setRefreshKey] = useState(0); 

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        
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
  }, [refreshKey]); // Add refreshKey to dependencies

  const handleCategoryChange = (category) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(category)
        ? prevSelected.filter((cat) => cat !== category)
        : [...prevSelected, category]
    );
  };

  // Update function to handle product disabling/enabling
  const handleToggleProductStatus = async (item) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) {
        console.error('No token found in localStorage');
        setError('Authentication required. Please login again.');
        return;
      }

      const currentStatus = item.product_status;
      const action = currentStatus === 'Disabled' ? 'enable' : 'disable';
      
      console.log(`Attempting to ${action} product ${item.product_id}`);
      const endpoint = `http://localhost:5000/api/inventory/${item.product_id}/${action}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Product ${action} response:`, data);
        
        if (data.success) {
          // Create a copy of inventory and update the product status
          const updatedInventory = inventory.map(product => {
            if (product.product_id === item.product_id) {
              return { 
                ...product, 
                product_status: data.product_status || (action === 'disable' ? 'Disabled' : 'In Stock')
              };
            }
            return product;
          });
          
          setInventory(updatedInventory);
          alert(`Product ${action === 'disable' ? 'disabled' : 'enabled'} successfully.`);
          // Force refresh the inventory data to get updated statuses
          setRefreshKey(prev => prev + 1);
        } else {
          console.error(`Failed to ${action} product:`, data.message);
          alert(`Failed to ${action} product: ${data.message || 'Unknown error'}`);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Failed to ${action} product:`, response.statusText, errorData);
        alert(`Failed to ${action} product. Server returned: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error(`Error ${item.product_status === 'Disabled' ? 'enabling' : 'disabling'} product:`, error);
      alert('An error occurred while updating product status. Please try again.');
    }
  };

  // Utility function to determine stock status based on quantity and product_status
  const getStockStatus = (item) => {
    // If product is disabled, show as "Disabled" regardless of quantity
    if (item.product_status === 'Disabled') {
      return "Disabled";
    }
    
    // Otherwise, determine status based on quantity
    if (item.quantity === 0) return "Out of Stock";
    if (item.quantity < 10) return "Low Stock";
    return "In Stock";
  };

  // Function to get the effective quantity to display
  const getDisplayQuantity = (item) => {
    return item.product_status === 'Disabled' ? 0 : item.quantity;
  };

  const filteredInventory = inventory.filter(item => {
    // Calculate the actual status based on quantity and product_status
    const actualStatus = getStockStatus(item);
    
    return (
      (selectedCategories.includes(item.category?.category_name)) &&
      (filterStatus === 'All' || actualStatus === filterStatus) &&
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

  // Render dropdown actions based on stock status
  const renderActionMenu = (item) => {
    const stockStatus = getStockStatus(item);
    
    return (
      <div className="dropdown">
        <button className="btn dropdown-toggle" type="button" id={`dropdownMenu-${item.product_id}`} data-bs-toggle="dropdown" aria-expanded="false">
          Actions
        </button>
        <ul className="dropdown-menu" aria-labelledby={`dropdownMenu-${item.product_id}`}>
          <li>
            <button className="dropdown-item" onClick={() => onViewInventory(item)}>
              View
            </button>
          </li>
          
          {/* Toggle disable/enable based on current status */}
          <li>
            <button 
              className="dropdown-item" 
              onClick={() => handleToggleProductStatus(item)}
            >
              {item.product_status === 'Disabled' ? 'Enable' : 'Disable'}
            </button>
          </li>
          
          {/* Only show restock option if product is not disabled */}
          {item.product_status !== 'Disabled' && (stockStatus === "Low Stock" || stockStatus === "Out of Stock") && (
            <li>
              <button className="dropdown-item" onClick={() => onRestockProduct(item)}>
                Restock
              </button>
            </li>
          )}
        </ul>
      </div>
    );
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
            <button className="export-btn btn btn-light me-2" style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
              <FontAwesomeIcon icon={faCloudDownloadAlt} /> Export
            </button>
            <button 
              className="categories-btn btn btn-light" 
              style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
              onClick={onManageCategories}
            >
              Categories
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
                  currentInventory.map(item => {
                    // Determine stock status based on quantity and product_status
                    const stockStatus = getStockStatus(item);
                    const displayQuantity = getDisplayQuantity(item);
                    
                    return (
                      <tr key={item.product_id}>
                        <td>{item.product_id}</td>
                        <td>{item.product_name}</td>
                        <td>{item.category?.category_name || 'N/A'}</td>
                        <td>{displayQuantity}</td>
                        <td>{new Date(item.date_added).toLocaleString('en-US', { 
                          year: '2-digit', 
                          month: 'numeric', 
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}</td>
                        <td className={`stock-status ${stockStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                          {stockStatus}
                        </td>
                        <td className="action-buttons">
                          {renderActionMenu(item)}
                        </td>
                      </tr>
                    );
                  })
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
