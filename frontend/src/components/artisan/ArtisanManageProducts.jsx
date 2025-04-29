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

const ArtisanManageProducts = ({ onViewProduct, onEditProduct, onAddProductClick }) => {
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
  const entriesPerPage = 4;

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('artisanToken');
      if (!token) {
        console.error('No token found for artisan');
        alert('You are not logged in. Please log in to view your entries.');
        window.location.href = '/login';
        return;
      }

      console.log('Fetching all entries');

      const response = await fetch('http://localhost:5000/api/products/entries', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Total entries fetched: ${data.entries.length}`);
        setEntries(data.entries);
        setTotalPages(Math.ceil(data.entries.length / entriesPerPage)); 
      } else {
        console.error(`Failed to fetch product entries. Status: ${response.status}, Message: ${response.statusText}`);
        alert('Unable to fetch product entries at the moment. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching product entries:', error.message);
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

  console.log(`Filtered entries: ${filteredEntries.length}`); 

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredEntries.slice(indexOfFirstEntry, indexOfLastEntry);

  console.log(`Current entries: ${currentEntries.length}, Page: ${currentPage}`); 

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) {
      console.warn(`Invalid page number: ${pageNumber}. Total pages: ${totalPages}`);
      return;
    }
    console.log(`Navigating to page: ${pageNumber}`);
    setCurrentPage(pageNumber); 
  };

  const handleViewProduct = async (product) => {
    try {
      console.log("Viewing product:", product);
      const token = localStorage.getItem('artisanToken');
      if (!token) {
        console.error('No token found for artisan');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/products/${product.product_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Product data fetched:", data);
        
        try {
          const imagesResponse = await fetch(`http://localhost:5000/api/products/${product.product_id}/images`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (imagesResponse.ok) {
            const imagesData = await imagesResponse.json();
            console.log("Images data fetched:", imagesData);

            if (imagesData.images && imagesData.images.length > 0) {
              data.entryImages = imagesData.images;
            }
          } else {
            console.error("Failed to fetch images:", imagesResponse.statusText);
          }
        } catch (imageError) {
          console.error("Error fetching images:", imageError);
        }
        
        setSelectedProduct(data);
        setViewMode('view');
      } else {
        console.error('Failed to fetch product details:', response.statusText);
        alert("Failed to load product details. Please try again.");
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      alert("An error occurred while fetching product details.");
    }
  };

  const handleEditProduct = async (product) => {
    try {
      // Check if the product is approved
      if (product.status === 'Approved') {
        alert("Approved products cannot be edited.");
        return;
      }
      
      console.log("Editing product entry:", product.entry_id);
      const token = localStorage.getItem('artisanToken');
      if (!token) {
        console.error('No token found for artisan');
        return;
      }

      // Use the new endpoint to fetch by entry_id
      const response = await fetch(`http://localhost:5000/api/products/entry/${product.entry_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Product data fetched for editing:", data);
        
        try {
          // Also fetch images for this product
          const imagesResponse = await fetch(`http://localhost:5000/api/products/${product.product_id}/images`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (imagesResponse.ok) {
            const imagesData = await imagesResponse.json();
            console.log("Images data fetched for editing:", imagesData);

            if (imagesData.images && imagesData.images.length > 0) {
              data.entryImages = imagesData.images;
            }
          } else {
            console.error("Failed to fetch images:", imagesResponse.statusText);
          }
        } catch (imageError) {
          console.error("Error fetching images:", imageError);
        }
        
        setSelectedProduct(data); 
        setViewMode('edit');
      } else {
        console.error('Failed to fetch product details:', response.statusText);
        alert("Failed to load product details for editing. Please try again.");
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      alert("An error occurred while fetching product details for editing.");
    }
  };

  const handleProductUpdate = async (updatedProduct) => {
    try {
      const token = localStorage.getItem('artisanToken');
      if (!token) {
        console.error('No token found for artisan');
        return;
      }
      
      console.log("Sending update for product:", updatedProduct);
      
      // Format data for API
      const productData = {
        product_name: updatedProduct.product_name,
        description: updatedProduct.description,
        category: updatedProduct.category,
        unit_price: updatedProduct.unit_price,
        quantity: updatedProduct.quantity,
        product_status: updatedProduct.product_status,
        customization_available: updatedProduct.customization_available,
        size: updatedProduct.size,
        additional_price: updatedProduct.additional_price
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
        console.log("Product updated successfully:", result);
        
        alert("Product successfully updated!");
        
        // Refresh the entries list to show updated data
        await fetchEntries();
        
        // Return to table view
        setViewMode('table');
        setSelectedProduct(null);
      } else {
        const errorData = await response.json();
        console.error('Failed to update product:', errorData);
        alert(`Failed to update product: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert("An error occurred while updating the product.");
    }
  };

  const handleBackToTable = () => {
    setSelectedProduct(null);
    setViewMode('table');
  };

  const confirmDelete = (product) => {
    // Check if the product is approved
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

  const handleDelete = async () => {
    if (productToDelete) {
      // Check if the product is approved
      if (productToDelete.status === 'Approved') {
        alert("Approved products cannot be deleted.");
        setShowDeleteModal(false);
        setProductToDelete(null);
        return;
      }
      
      try {
        const token = localStorage.getItem('artisanToken');
        if (!token) {
          console.error('No token found'); 
          return;
        }

        console.log('Sending delete request for entry ID:', productToDelete.entry_id); 

        const response = await fetch(`http://localhost:5000/api/products/${productToDelete.entry_id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          console.log('Product deleted successfully');
          setEntries((prevEntries) =>
            prevEntries.filter((entry) => entry.entry_id !== productToDelete.entry_id)
          );
          setShowDeleteModal(false);
          setProductToDelete(null);
        } else {
          console.error('Failed to delete product:', response.statusText);
          alert('Failed to delete product. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('An error occurred while trying to delete the product.');
      }
    }
  };

  return (
    <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        {viewMode === 'table' && (
          <>
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
                <button className="export-btn btn btn-light" style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                  <FontAwesomeIcon icon={faCloudDownloadAlt} /> Export
                </button>
                <button className="btn btn-primary ms-2" onClick={onAddProductClick}>
                  <FaPlus style={{ marginRight: '5px' }} /> Add Product
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
                <div className="filter-dropdown me-2">
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
                <div className="search-bar" style={{ width: '200px' }}>
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
              </div>
            </div>

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

        {viewMode === 'view' && selectedProduct && (
          <ProductViewForm product={selectedProduct} onBack={handleBackToTable} />
        )}

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
