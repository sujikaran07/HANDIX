import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import Pagination from '../Pagination';

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [newDiscount, setNewDiscount] = useState({
    name: '',
    code: '',
    discount_type: 'percentage',
    value: '',
    start_date: '',
    end_date: '',
    min_purchase: '',
    max_discount: '',
    status: 'active'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const itemsPerPage = 7;
  
  useEffect(() => {
    // Simulate fetching discounts
    setTimeout(() => {
      const mockDiscounts = [
        { id: 1, name: 'Summer Sale', code: 'SUMMER23', discount_type: 'percentage', value: 15, start_date: '2023-06-01', end_date: '2023-08-31', min_purchase: 1000, max_discount: 500, status: 'active' },
        { id: 2, name: 'New User', code: 'WELCOME', discount_type: 'percentage', value: 10, start_date: '2023-01-01', end_date: '2023-12-31', min_purchase: 0, max_discount: 300, status: 'active' },
        { id: 3, name: 'Holiday Special', code: 'HOLIDAY', discount_type: 'fixed', value: 250, start_date: '2023-12-01', end_date: '2023-12-25', min_purchase: 1500, max_discount: null, status: 'inactive' },
        { id: 4, name: 'Clearance', code: 'CLEAR50', discount_type: 'percentage', value: 50, start_date: '2023-10-15', end_date: '2023-10-31', min_purchase: 500, max_discount: null, status: 'active' },
      ];
      setDiscounts(mockDiscounts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDiscount({...newDiscount, [name]: value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Mock API call
      setTimeout(() => {
        if (isEditing) {
          setDiscounts(prev => prev.map(discount => 
            discount.id === editId ? { ...newDiscount, id: editId } : discount
          ));
          alert('Discount updated successfully');
        } else {
          const newId = Math.max(...discounts.map(d => d.id), 0) + 1;
          setDiscounts(prev => [...prev, { ...newDiscount, id: newId }]);
          alert('Discount created successfully');
        }
        resetForm();
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error submitting discount:', error);
      alert('An error occurred while saving the discount');
      setLoading(false);
    }
  };

  const handleEdit = (discount) => {
    setNewDiscount({
      name: discount.name,
      code: discount.code,
      discount_type: discount.discount_type,
      value: discount.value,
      start_date: formatDateForInput(discount.start_date),
      end_date: formatDateForInput(discount.end_date),
      min_purchase: discount.min_purchase,
      max_discount: discount.max_discount || '',
      status: discount.status
    });
    setIsEditing(true);
    setEditId(discount.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this discount?')) {
      setDiscounts(prev => prev.filter(discount => discount.id !== id));
      alert('Discount deleted successfully');
    }
  };

  const resetForm = () => {
    setNewDiscount({
      name: '',
      code: '',
      discount_type: 'percentage',
      value: '',
      start_date: '',
      end_date: '',
      min_purchase: '',
      max_discount: '',
      status: 'active'
    });
    setIsEditing(false);
    setEditId(null);
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Render dropdown actions for discounts
  const renderActionMenu = (discount) => {
    return (
      <div className="dropdown">
        <button 
          className="btn btn-sm btn-outline-secondary dropdown-toggle" 
          type="button" 
          id={`dropdownMenu-${discount.id}`} 
          data-bs-toggle="dropdown" 
          aria-expanded="false"
        >
          Actions
        </button>
        <ul className="dropdown-menu shadow" aria-labelledby={`dropdownMenu-${discount.id}`}>
          <li>
            <button className="dropdown-item" onClick={() => handleEdit(discount)}>
              <FontAwesomeIcon icon={faEdit} className="me-2" /> Edit
            </button>
          </li>
          <li>
            <button className="dropdown-item" onClick={() => handleDelete(discount.id)}>
              <FontAwesomeIcon icon={faTrash} className="me-2" /> Delete
            </button>
          </li>
        </ul>
      </div>
    );
  };

  // Filter discounts by search term
  const filteredDiscounts = discounts.filter(discount => 
    discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discount.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDiscounts = filteredDiscounts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDiscounts.length / itemsPerPage);

  return (
    <div className="pricing-form-container">
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
                placeholder="Search discounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ boxShadow: 'none' }}
              />
            </div>
          </div>
        </div>
        <div className="col-md-6 text-end">
          <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#discountFormModal">
            <FontAwesomeIcon icon={faPlus} /> Add New Discount
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
          <div style={{ height: 'calc(100% - 100px)' }}>
            <table className="table table-bordered table-striped inventory-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Value</th>
                  <th>Valid Period</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentDiscounts.length > 0 ? (
                  currentDiscounts.map((discount) => (
                    <tr key={discount.id}>
                      <td>{discount.id}</td>
                      <td>{discount.name}</td>
                      <td><span className="badge bg-secondary">{discount.code}</span></td>
                      <td>
                        {discount.discount_type === 'percentage' ? 
                          `${discount.value}%` : `Rs ${discount.value}`}
                      </td>
                      <td>
                        {new Date(discount.start_date).toLocaleDateString()} - {new Date(discount.end_date).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge ${discount.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                          {discount.status}
                        </span>
                      </td>
                      <td className="text-center">
                        {renderActionMenu(discount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">No discounts found</td>
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

      {/* Modal for Add/Edit Form */}
      <div className="modal fade" id="discountFormModal" tabIndex="-1" aria-labelledby="discountFormModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="discountFormModalLabel">{isEditing ? 'Edit Discount' : 'Add New Discount'}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} id="discountForm">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Discount Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={newDiscount.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {/* ...other form fields... */}
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="submit" form="discountForm" className="btn btn-primary">
                {isEditing ? 'Update Discount' : 'Add Discount'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountManagement;
