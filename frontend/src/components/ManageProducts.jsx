import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons';
import { FaBox } from 'react-icons/fa';
import Pagination from './Pagination';
import '../styles/admin/AdminProducts.css';

const ManageProducts = ({ onViewProduct }) => {
  const [products, setProducts] = useState([]); 

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['Carry Goods', 'Accessories', 'Clothing', 'Crafts', 'Artistry']);
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        console.log('Admin token being sent:', token);

        if (!token) {
          console.error('No admin token found in localStorage');
          return;
        }

        const response = await fetch('http://localhost:5000/api/admin/products', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched Products:', data.products);
         
          const sortedProducts = data.products.sort((a, b) => {
            return new Date(b.date_added) - new Date(a.date_added);
          });
          
          setProducts(sortedProducts);
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
            localStorage.setItem('adminToken', refreshData.token); 
            fetchProducts();
          } else {
            console.error('Failed to refresh token:', refreshResponse.statusText);
          }
        } else {
          console.error('Failed to fetch products:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching products:', error.message);
      }
    };

    fetchProducts();
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(category)
        ? prevSelected.filter((cat) => cat !== category)
        : [...prevSelected, category]
    );
  };

  const filteredProducts = products.filter(product => {
    return (
      (selectedCategories.includes(product.category?.category_name)) && 
      (filterStatus === 'All' || product.status.toLowerCase() === filterStatus.toLowerCase()) && 
      (product.product_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
       product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       product.category?.category_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       (product.e_id && product.e_id.toLowerCase().includes(searchTerm.toLowerCase()))) 
    );
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleProductAction = async (productId, action) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('No admin token found in localStorage');
        return;
      }
      
      if (action === 'approve' || action === 'reject' || action === 'restore') {
        const newStatus = 
          action === 'approve' ? 'Approved' : 
          action === 'reject' ? 'Rejected' : 
          action === 'restore' ? 'Pending' : 'Unknown';
        
        const response = await fetch(`http://localhost:5000/api/admin/products/${productId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
          const updatedProduct = await response.json();
          console.log('Product status updated:', updatedProduct);
          
          // Update local state with new status
          setProducts(prevProducts => 
            prevProducts.map(product => 
              product.entry_id === productId 
                ? { ...product, status: newStatus } 
                : product
            )
          );
      
          alert(`Product ${action} successfully!`);
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
            localStorage.setItem('adminToken', refreshData.token);
            handleProductAction(productId, action); 
          } else {
            console.error('Failed to refresh token:', refreshResponse.statusText);
          }
        } else {
          console.error(`Failed to ${action} product:`, response.statusText);
          alert(`Failed to ${action} product. Please try again.`);
        }
      } else if (action === 'delete') {
        const response = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          console.log('Product deleted successfully');
          
          setProducts(prevProducts => 
            prevProducts.filter(product => product.entry_id !== productId)
          );
        } else if (response.status === 401) {
          
          console.warn('Token expired. Attempting to refresh token...');
         
        } else {
          console.error('Failed to delete product:', response.statusText);
        }
      }
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      alert(`An error occurred while trying to ${action} the product.`);
    }
  };

  return (
    <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        <div className="manage-products-header d-flex justify-content-between align-items-center mb-3">
          <div className="title-section">
            <div className="icon-and-title">
              <FaBox className="product-icon" />
              <div className="text-section">
                <h2>Products</h2>
                <p>Manage your products</p>
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
            <button className="export-btn">
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
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ flex: '1 1 auto', overflowY: 'auto', marginTop: '20px' }}>
          <table className="table table-bordered table-striped product-table">
            <thead>
              <tr>
                <th>P-ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>E-ID</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Uploaded Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map(product => (<tr key={product.entry_id}>
                    <td>{product.product_id}</td>
                    <td>{product.product_name}</td>
                    <td>{product.category?.category_name || 'N/A'}</td>
                    <td>{product.e_id || 'N/A'}</td>
                    <td>{product.unit_price}</td>
                    <td>{product.quantity}</td>
                    <td>{new Date(product.date_added).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td className={`status ${product.status.toLowerCase()}`}>{product.status}</td>
                    <td className="action-buttons">
                      <div className="dropdown">
                        <button className="btn dropdown-toggle" type="button" id={`dropdown-${product.entry_id}`} data-bs-toggle="dropdown" aria-expanded="false">
                          Actions
                        </button>
                        <ul className="dropdown-menu" aria-labelledby={`dropdown-${product.entry_id}`}>
                          <li>
                            <button className="dropdown-item" onClick={() => onViewProduct(product)}>View</button>
                          </li>
                          {product.status.toLowerCase() === 'pending' && (<>
                              <li>
                                <button className="dropdown-item" onClick={() => handleProductAction(product.entry_id, 'approve')}>Approve</button>
                              </li>
                              <li>
                                <button className="dropdown-item" onClick={() => handleProductAction(product.entry_id, 'reject')}>Reject</button>
                              </li>
                            </>)}
                          {product.status.toLowerCase() === 'rejected' && (
                            <li>
                              <button className="dropdown-item" onClick={() => handleProductAction(product.entry_id, 'restore')}>Restore</button>
                            </li>
                          )}
                        </ul>
                      </div>
                    </td>
                  </tr>))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center">No products available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination className="product-pagination" currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default ManageProducts;
