import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons';
import { FaBox, FaPlus } from 'react-icons/fa';
import Pagination from '../Pagination';
import '../../styles/artisan/ArtisanProducts.css';
import ProductViewForm from './ProductViewForm';
import EditProductForm from './EditProductForm';

// Component for managing artisan's product entries with CRUD operations
const ArtisanManageProducts = ({ onViewProduct, onEditProduct, onAddProductClick }) => {
  // State management for product entries and UI
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['Carry Goods', 'Accessories', 'Clothing', 'Crafts', 'Artistry']);
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('table'); 
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [productToDelete, setProductToDelete] = useState(null); 
  const [totalPages, setTotalPages] = useState(1); 
  const entriesPerPage = 7;

  useEffect(() => {
    fetchEntries();
  }, []);

  // Fetch all product entries for the artisan
  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('artisanToken');
      if (!token) {
        alert('You are not logged in. Please log in to view your entries.');
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:5000/api/products/entries', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries);
        setTotalPages(Math.ceil(data.entries.length / entriesPerPage)); 
      } else {
        alert('Unable to fetch product entries at the moment. Please try again later.');
      }
    } catch (error) {
      alert('An unexpected error occurred while fetching product entries. Please try again later.');
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(category)
        ? prevSelected.filter((cat) => cat !== category)
        : [...prevSelected, category]
    );
  };

  // Apply search and filter criteria to entries
  const filteredEntries = entries.filter(entry => {
    return (
      (selectedCategories.includes(entry.category?.category_name)) && 
      (filterStatus === 'All' || entry.status === filterStatus) && 
      (
        entry.product_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        entry.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        entry.category?.category_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  // Pagination calculations
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredEntries.slice(indexOfFirstEntry, indexOfLastEntry);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) {
      return;
    }
    setCurrentPage(pageNumber); 
  };

  // Handle product view with image fetching
  const handleViewProduct = async (product) => {
    try {
      const token = localStorage.getItem('artisanToken');
      if (!token) {
        return;
      }

      const response = await fetch(`http://localhost:5000/api/products/entry/${product.entry_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Fetch product images
        try {
          const imagesResponse = await fetch(`http://localhost:5000/api/products/${product.product_id}/images`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (imagesResponse.ok) {
            const imagesData = await imagesResponse.json();

            if (imagesData.images && imagesData.images.length > 0) {
              data.entryImages = imagesData.images;
            }
          }
        } catch (imageError) {
          // Continue without images
        }
        
        setSelectedProduct(data);
        setViewMode('view');
      } else {
        alert("Failed to load product details. Please try again.");
      }
    } catch (error) {
      alert("An error occurred while fetching product details.");
    }
  };

  // Handle product edit with approval status check
  const handleEditProduct = async (product) => {
    try {
      // Prevent editing of approved products
      if (product.status === 'Approved') {
        alert("Approved products cannot be edited.");
        return;
      }
      
      const token = localStorage.getItem('artisanToken');
      if (!token) {
        return;
      }

      const response = await fetch(`http://localhost:5000/api/products/entry/${product.entry_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Fetch product images for editing
        try {
          const imagesResponse = await fetch(`http://localhost:5000/api/products/${product.product_id}/images`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (imagesResponse.ok) {
            const imagesData = await imagesResponse.json();

            if (imagesData.images && imagesData.images.length > 0) {
              data.entryImages = imagesData.images;
            }
          }
        } catch (imageError) {
          // Continue without images
        }
        
        setSelectedProduct(data); 
        setViewMode('edit');
      } else {
        alert("Failed to load product details for editing. Please try again.");
      }
    } catch (error) {
      alert("An error occurred while fetching product details for editing.");
    }
  };

  // Handle product update submission
  const handleProductUpdate = async (updatedProduct) => {
    try {
      const token = localStorage.getItem('artisanToken');
      if (!token) {
        return;
      }
      
      // Prepare product data for API submission
      const productData = {
        product_name: updatedProduct.product_name,
        description: updatedProduct.description,
        category: updatedProduct.category,
        unit_price: updatedProduct.price || updatedProduct.unit_price, 
        quantity: updatedProduct.quantity,
        product_status: updatedProduct.product_status,
        customization_available: updatedProduct.customization_available === 'Yes',
        size: updatedProduct.size,
        additional_price: updatedProduct.additional_price,
        variation_id: updatedProduct.variation_id 
      };
      
      const response = await fetch(`http://localhost:5000/api/products/${updatedProduct.entry_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      
      if (response.ok) {
        const result = await response.json();
        
        alert("Product successfully updated!");
        
        // Refresh entries list
        await fetchEntries();

        setViewMode('table');
        setSelectedProduct(null);
      } else {
        const errorData = await response.json();
        alert(`Failed to update product: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      alert("An error occurred while updating the product.");
    }
  };

  const handleBackToTable = () => {
    setSelectedProduct(null);
    setViewMode('table');
  };

  // Confirm product deletion with approval status check
  const confirmDelete = (product) => {
    if (product.status === 'Approved') {
      alert("Approved products cannot be deleted.");
      return;
    }
    
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  // Handle product deletion
  const handleDelete = async () => {
    if (productToDelete) {
      if (productToDelete.status === 'Approved') {
        alert("Approved products cannot be deleted.");
        setShowDeleteModal(false);
        setProductToDelete(null);
        return;
      }
      
      try {
        const token = localStorage.getItem('artisanToken');
        if (!token) {
          return;
        }

        const response = await fetch(`http://localhost:5000/api/products/${productToDelete.entry_id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // Remove deleted product from local state
          setEntries((prevEntries) =>
            prevEntries.filter((entry) => entry.entry_id !== productToDelete.entry_id)
          );
          setShowDeleteModal(false);
          setProductToDelete(null);
        } else {
          alert('Failed to delete product. Please try again.');
        }
      } catch (error) {
        alert('An error occurred while trying to delete the product.');
      }
    }
  };

  return (
    <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        {/* Page header with title and action buttons */}
        <div className="manage-products-header d-flex justify-content-between align-items-center mb-3">
          <div className="title-section">
            <div className="icon-and-title">
              <FaBox className="product-icon" />
              <div className="text-section">
                <h2>Products</h2>
                <p>Manage your product entries</p>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <button className="export-btn" style={{ marginRight: '12px' }}>
              <FontAwesomeIcon icon={faCloudDownloadAlt} /> Export
            </button>
            <button className="btn btn-primary" onClick={onAddProductClick}>
              <FaPlus style={{ marginRight: '5px' }} /> Add Product
            </button>
          </div>
        </div>
        {/* Search and filter controls */}
        <div className="d-flex align-items-center mb-3 justify-content-end">
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
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product entries table view */}
        {viewMode === 'table' && (
          <>
            <div style={{ flex: '1 1 auto', overflowY: 'auto', marginTop: '20px' }}>
              <table className="table table-bordered table-striped product-table">
                <thead>
                  <tr>
                    <th>P-ID</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th>Uploaded Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.length > 0 ? (
                    currentEntries.map(entry => (
                      <tr key={entry.entry_id}> 
                        <td>{entry.product_id}</td>
                        <td>{entry.product_name}</td>
                        <td>{entry.category?.category_name}</td>
                        <td>{entry.unit_price}</td>
                        <td>{entry.quantity}</td>
                        <td>{new Date(entry.date_added).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td className={`status ${entry.status.toLowerCase()}`}>{entry.status}</td>
                        <td className="action-buttons">
                          {/* Action dropdown with conditional options */}
                          <div className="dropdown">
                            <button 
                              className="btn dropdown-toggle" 
                              type="button"
                              data-bs-toggle="dropdown" 
                              aria-expanded="false"
                              onClick={(e) => {
                                const dropdownEl = e.currentTarget.nextElementSibling;
                                if (window.bootstrap && window.bootstrap.Dropdown) {
                                  const dropdown = new window.bootstrap.Dropdown(e.currentTarget);
                                  dropdown.toggle();
                                }
                              }}
                            >
                              Actions
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <button 
                                  className="dropdown-item" 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewProduct(entry);
                                  }}
                                >
                                  View
                                </button>
                              </li>
                              {entry.status !== 'Approved' && (
                                <>
                                  <li>
                                    <button 
                                      className="dropdown-item" 
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditProduct(entry);
                                      }}
                                    >
                                      Edit
                                    </button>
                                  </li>
                                  <li>
                                    <button 
                                      className="dropdown-item" 
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        confirmDelete(entry);
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </li>
                                </>
                              )}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">No entries available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination className="product-pagination" currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}

        {/* Product view mode */}
        {viewMode === 'view' && selectedProduct && (
          <ProductViewForm product={selectedProduct} onBack={handleBackToTable} />
        )}

        {/* Product edit mode */}
        {viewMode === 'edit' && selectedProduct && (
          <EditProductForm 
            product={selectedProduct} 
            onSave={handleProductUpdate} 
            onCancel={handleBackToTable} 
          />
        )}
      </div>
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Are you sure you want to delete this product?</h5>
            <div className="modal-actions">
              <button className="btn btn-danger me-2" onClick={handleDelete}>Delete</button>
              <button className="btn btn-secondary" onClick={handleCancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtisanManageProducts;
