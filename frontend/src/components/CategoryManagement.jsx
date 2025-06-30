import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCloudUploadAlt, faImage, faEdit, faEye, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Pagination from './Pagination';
import '../styles/admin/AdminInventory.css';

const CategoryManagement = ({ onBackToInventory }) => {
  // State management for categories and form handling
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategory, setNewCategory] = useState({ category_name: '', description: '' });
  const [categoryImage, setCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 7;
  
  // State for managing right panel modes (add/edit/view)
  const [rightPanelMode, setRightPanelMode] = useState('add'); 
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        
        if (!token) {
          setError('Authentication required. Please login again.');
          setLoading(false);
          return;
        }
        
        const response = await fetch('http://localhost:5000/api/admin/categories', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Sort categories by ID and include product count
          const sortedCategories = (data.data || []).sort((a, b) => a.category_id - b.category_id);
          
          setCategories(sortedCategories);
          setLoading(false);
        } else if (response.status === 401) {
          setError('Session expired. Please login again.');
          setLoading(false);
        } else {
          setError(`Failed to fetch categories: ${response.statusText}`);
          setLoading(false);
        }
      } catch (error) {
        setError('An error occurred while fetching categories data.');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (rightPanelMode === 'add') {
      setNewCategory(prev => ({ ...prev, [name]: value }));
    } else if (rightPanelMode === 'edit') {
      setSelectedCategory(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryImage(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission for creating/updating categories
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setImageUploading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      if (!token) {
        setError('Authentication required. Please login again.');
        setImageUploading(false);
        return;
      }

      if (rightPanelMode === 'add') {
        // Create new category
        const formData = new FormData();
        formData.append('category_name', newCategory.category_name);
        formData.append('description', newCategory.description);
        
        if (categoryImage) {
          formData.append('category_image', categoryImage);
        }

        const response = await fetch('http://localhost:5000/api/admin/categories', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          
          // Update categories list with new category
          setCategories(prev => {
            const newList = [...prev, data.category].sort((a, b) => a.category_id - b.category_id);
            return newList;
          });
          
          setNewCategory({ category_name: '', description: '' });
          setCategoryImage(null);
          setImagePreview(null);
          alert('Category added successfully!');
        } else {
          const errorData = await response.json();
          alert(`Failed to add category: ${errorData.message || response.statusText}`);
        }
      } else if (rightPanelMode === 'edit') {
        // Update existing category
        const formData = new FormData();
        formData.append('category_name', selectedCategory.category_name);
        formData.append('description', selectedCategory.description);
        
        if (categoryImage) {
          formData.append('category_image', categoryImage);
        }

        const response = await fetch(`http://localhost:5000/api/admin/categories/${selectedCategory.category_id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          
          // Update category in state
          setCategories(prev => 
            prev.map(cat => cat.category_id === selectedCategory.category_id ? data.category : cat)
          );
          
          resetForm();
          alert('Category updated successfully!');
        } else {
          const errorData = await response.json();
          alert(`Failed to update category: ${errorData.message || response.statusText}`);
        }
      }
      
      setImageUploading(false);
    } catch (error) {
      alert('An error occurred while processing the category. Please try again.');
      setImageUploading(false);
    }
  };

  const resetForm = () => {
    setRightPanelMode('add');
    setSelectedCategory(null);
    setNewCategory({ category_name: '', description: '' });
    setCategoryImage(null);
    setImagePreview(null);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Set category for editing mode
  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    
    if (category.category_image_url) {
      setImagePreview(category.category_image_url);
    } else {
      setImagePreview(null);
    }
    
    setRightPanelMode('edit');
  };

  // Set category for view mode
  const handleViewCategory = async (category) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      setSelectedCategory(category);
      
      if (category.category_image_url) {
        setImagePreview(category.category_image_url);
      } else {
        setImagePreview(null);
      }
      
      setRightPanelMode('view');
    } catch (error) {
      alert('Failed to fetch category details. Please try again.');
    }
  };

  // Handle category deletion with confirmation
  const handleDeleteCategory = async (category) => {
    if (window.confirm(`Are you sure you want to delete category: ${category.category_name}?`)) {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        
        if (!token) {
          setError('Authentication required. Please login again.');
          return;
        }

        const response = await fetch(`http://localhost:5000/api/admin/categories/${category.category_id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          setCategories(prev => prev.filter(cat => cat.category_id !== category.category_id));
          alert(`Category ${category.category_name} deleted successfully`);
        } else {
          const errorData = await response.json();
          alert(`Failed to delete category: ${errorData.message || response.statusText}`);
        }
      } catch (error) {
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  // Render action dropdown menu for each category
  const renderActionMenu = (category) => {
    const hasProducts = category.product_count > 0;
    
    return (
      <div className="dropdown">
        <button className="btn dropdown-toggle" type="button" id={`dropdownMenu-${category.category_id}`} data-bs-toggle="dropdown" aria-expanded="false">
          Actions
        </button>
        <ul className="dropdown-menu" aria-labelledby={`dropdownMenu-${category.category_id}`}>
          <li>
            <button className="dropdown-item" onClick={() => handleViewCategory(category)}>
              View
            </button>
          </li>
          <li>
            <button className="dropdown-item" onClick={() => handleEditCategory(category)}>
              Edit
            </button>
          </li>
          {/* Only allow deletion if category has no products */}
          {!hasProducts && (
            <li>
              <button className="dropdown-item" onClick={() => handleDeleteCategory(category)}>
                Delete
              </button>
            </li>
          )}
        </ul>
      </div>
    );
  };

  // Pagination calculations
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);
  const totalPages = Math.ceil(categories.length / categoriesPerPage);

  // Render right panel based on current mode
  const renderRightPanel = () => {
    const panelTitle = 
      rightPanelMode === 'add' ? 'Add New Category' :
      rightPanelMode === 'view' ? 'View Category' : 'Edit Category';
    
    const isViewMode = rightPanelMode === 'view';
    
    // View mode layout
    if (isViewMode) {
      return (
        <div className="col-md-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>{panelTitle}</h3>
            <button 
              type="button" 
              className="btn btn-sm btn-outline-secondary"
              onClick={resetForm}
            >
              Back to Add
            </button>
          </div>
          <div className="card p-3">
            <div className="row">
              {/* Left side: Image */}
              <div className="col-5">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Category preview" 
                    className="img-fluid"
                    style={{ 
                      width: '100%', 
                      height: 'auto', 
                      borderRadius: '4px',
                      objectFit: 'cover'
                    }} 
                  />
                ) : (
                  <div className="d-flex justify-content-center align-items-center" 
                    style={{ 
                      height: '100%', 
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                      padding: '20px'
                    }}>
                    <FontAwesomeIcon 
                      icon={faImage} 
                      size="3x" 
                      style={{ color: '#d3d3d3' }} 
                    />
                  </div>
                )}
              </div>
              
              {/* Right side: ID, Name, Stock Level */}
              <div className="col-7">
                <div className="mb-2">
                  <label className="form-label small fw-bold">ID</label>
                  <p className="mb-1">{selectedCategory?.category_id || 'N/A'}</p>
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-bold">Name</label>
                  <p className="mb-1">{selectedCategory?.category_name || 'N/A'}</p>
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-bold">Stock Level</label>
                  <p className="mb-1">{selectedCategory?.stock_level || '0'}</p>
                </div>
              </div>
            </div>
            
            {/* Description below the image */}
            <div className="mt-3">
              <label className="form-label small fw-bold">Description</label>
              <div 
                className="p-2 bg-light rounded" 
                style={{ 
                  minHeight: '60px',
                  fontSize: '0.9rem'
                }}
              >
                {selectedCategory?.description || 'No description available'}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Add/Edit mode layout
    return (
      <div className="col-md-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>{panelTitle}</h3>
          {rightPanelMode !== 'add' && (
            <button 
              type="button" 
              className="btn btn-sm btn-outline-secondary"
              onClick={resetForm}
            >
              Back to Add
            </button>
          )}
        </div>
        <div className="card p-3">
          {renderAddEditForm()}
        </div>
      </div>
    );
  };

  // Form layout for add/edit modes
  const renderAddEditForm = () => {
    const isEditMode = rightPanelMode === 'edit';
    const hasProducts = isEditMode && selectedCategory && selectedCategory.product_count > 0;
    
    return (
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label htmlFor="category_name" className="form-label small">
            Category Name
            {hasProducts && <span className="text-muted ms-1">(Cannot be changed)</span>}
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="category_name"
            name="category_name"
            value={rightPanelMode === 'add' ? newCategory.category_name : selectedCategory?.category_name || ''}
            onChange={handleInputChange}
            required
            disabled={hasProducts}
          />
        </div>
        
        <div className="mb-2">
          <label htmlFor="description" className="form-label small">Description</label>
          <textarea
            className="form-control form-control-sm"
            id="description"
            name="description"
            value={rightPanelMode === 'add' ? newCategory.description : selectedCategory?.description || ''}
            onChange={handleInputChange}
            rows="2"
          ></textarea>
        </div>
        
        {/* Category Image */}
        <div className="mb-2">
          <label className="form-label small">Category Image</label>
          <div 
            className="image-upload-container position-relative cursor-pointer"
            style={{
              border: '1px dashed #ccc',
              borderRadius: '6px',
              padding: '8px',
              textAlign: 'center',
              backgroundColor: '#f8f9fa',
              transition: 'all 0.3s ease'
            }}
            onClick={() => document.getElementById('category_image').click()}
          >
            {imagePreview ? (
              <>
                <img 
                  src={imagePreview} 
                  alt="Category preview" 
                  style={{ 
                    height: '35px', 
                    maxWidth: '100%',
                    borderRadius: '4px',
                    marginBottom: '5px'
                  }} 
                />
                <div className="text-center">
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary py-0 px-2"
                    style={{ fontSize: '0.7rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCategoryImage(null);
                      setImagePreview(null);
                      document.getElementById('category_image').value = '';
                    }}
                  >
                    Change
                  </button>
                </div>
              </>
            ) : (
              <div style={{ fontSize: '0.85rem' }}>
                <FontAwesomeIcon 
                  icon={faCloudUploadAlt} 
                  size="lg" 
                  style={{ color: '#6c757d', marginBottom: '5px' }} 
                />
                <p className="mb-0" style={{ fontSize: '0.85rem' }}>
                  Click to upload image
                </p>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>JPG, PNG, WEBP</small>
              </div>
            )}
            
            <input
              type="file"
              className="d-none"
              id="category_image"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-success btn-sm w-100 mt-2"
          disabled={imageUploading}
        >
          {imageUploading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Uploading...
            </>
          ) : rightPanelMode === 'add' ? 'Add Category' : 'Update Category'}
        </button>
      </form>
    );
  };

  return (
    <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        {/* Header with back button */}
        <div className="d-flex align-items-center mb-4">
          <button 
            className="btn p-0 me-3" 
            onClick={onBackToInventory}
            style={{ border: 'none', background: 'none' }}
          >
            <FontAwesomeIcon icon={faArrowLeft} size="lg" />
          </button>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '500', marginBottom: '0.2rem' }}>Category Management</h2>
            <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>Manage your product categories</p>
          </div>
        </div>

        <div className="row">
          {/* Categories table section */}
          <div className="col-md-8">
            <h5 className="mb-3">Available Categories</h5>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading categories data...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="table-responsive" style={{ flex: '1 1 auto' }}>
                  <table className="table table-bordered table-striped inventory-table">
                    <thead>
                      <tr>
                        <th>Category ID</th>
                        <th>Name</th>
                        <th>Stock Level</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCategories.length > 0 ? (
                        currentCategories.map(category => (
                          <tr key={category.category_id}>
                            <td>{category.category_id}</td>
                            <td>{category.category_name}</td>
                            <td>{category.stock_level || 0}</td>
                            <td className="action-buttons">
                              {renderActionMenu(category)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center">No categories available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination in a fixed position below the table */}
                <div style={{ marginTop: '15px', marginBottom: '10px' }}>
                  {categories.length > 0 && (
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      className="inventory-pagination"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
          {renderRightPanel()}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
