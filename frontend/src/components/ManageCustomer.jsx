import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCloudDownloadAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FaUsers } from 'react-icons/fa';
import Pagination from './Pagination';
import AddCustomerForm from './AddCustomerForm';
import EditCustomerForm from './EditCustomerForm';
import CustomerViewForm from './CustomerViewForm';
import axios from 'axios';

const ManageCustomer = ({
  customers,
  onViewCustomer,
  onAddCustomer,
  showAddCustomerForm,
  onCancelAddCustomer,
  onSaveCustomer,
  onSaveAndAddAnotherCustomer,
  onEditCustomer,
  selectedCustomer,
  onApproveCustomer, 
  onRejectCustomer, 
  onDeleteCustomer 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [customerToDelete, setCustomerToDelete] = useState(null); 
  const customersPerPage = 7;
  const [customerList, setCustomerList] = useState(customers);

  useEffect(() => { setCustomerList(customers); }, [customers]);

  console.log('Customers passed to ManageCustomer:', customers);

  const confirmDelete = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCustomerToDelete(null);
  };

  const handleDelete = async () => {
    if (customerToDelete) {
      onDeleteCustomer(customerToDelete.c_id);
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    }
  };

  const handleApprove = (id) => {
    onApproveCustomer(id); 
  };

  const handleReject = (id) => {
    onRejectCustomer(id); 
  };

  const handleEdit = (customer) => {
    onEditCustomer(customer); 
  };

  const handleCancelEdit = () => {
    setEditingCustomer(null);
  };

  const handleSaveEdit = (updatedCustomer) => {
    onEditCustomer(updatedCustomer);
    setEditingCustomer(null);
  };

  const handleViewCustomer = (customer) => {
    setViewingCustomer(customer.c_id); 
  };

  const handleBackToTable = () => {
    setViewingCustomer(null);
  };

  const handleToggleStatus = async (customer) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }
      const response = await axios.put(
        `http://localhost:5000/api/customers/${customer.c_id}/status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCustomerList(customerList.map(c => c.c_id === customer.c_id ? response.data : c));
    } catch (error) {
      alert('Failed to update customer status. Please try again.');
    }
  };

  const filteredCustomers = customerList.filter((customer) => {
    return (
      (filterStatus === 'All' || customer.accountStatus === filterStatus) &&
      (customer.c_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        {showAddCustomerForm ? (
          <AddCustomerForm onSave={onSaveCustomer} onSaveAndAddAnother={onSaveAndAddAnotherCustomer} onCancel={onCancelAddCustomer} selectedCustomer={selectedCustomer} />
        ) : editingCustomer ? (
          <EditCustomerForm customer={editingCustomer} onSave={handleSaveEdit} onCancel={handleCancelEdit} />
        ) : viewingCustomer ? (
          <CustomerViewForm c_id={viewingCustomer} onBack={handleBackToTable} />
        ) : (
          <>
            <div className="manage-customer-header d-flex justify-content-between align-items-center mb-3">
              <div className="title-section">
                <div className="icon-and-title">
                  <FaUsers className="customer-icon" />
                  <div className="text-section">
                    <h2>Customers</h2>
                    <p>Manage your customers</p>
                  </div>
                </div>
              </div>
              <div className="button-section">
                <button className="export-btn btn btn-light me-2">
                  <FontAwesomeIcon icon={faCloudDownloadAlt} /> Export
                </button>
                <button className="add-customer-btn btn btn-primary" onClick={onAddCustomer}>
                  <FontAwesomeIcon icon={faPlus} /> Add Customer
                </button>
              </div>
            </div>

            <div className="manage-request-header d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Manage Customers</h4>
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
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ flex: '1 1 auto', overflowY: 'auto' }}>
              <table className="table table-bordered table-striped customer-table">
                <thead>
                  <tr>
                    <th>C-ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Account Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCustomers.length > 0 ? (
                    currentCustomers.map((customer) => (
                      <tr key={customer.c_id}>
                        <td>{customer.c_id}</td>
                        <td>{`${customer.firstName} ${customer.lastName}`}</td>
                        <td>{customer.email}</td>
                        <td>{['Personal', 'personal', 'Retail', 'retail'].includes(customer.accountType) ? 'Personal' : 'Business'}</td>
                        <td>
                          <span style={{
                            color:
                              (['Personal', 'personal', 'Retail', 'retail'].includes(customer.accountType) && customer.accountStatus === 'Approved') ||
                                (['Business', 'business', 'Wholesale', 'wholesale'].includes(customer.accountType) && (customer.accountStatus === 'Active' || customer.accountStatus === 'Approved'))
                                ? 'green'
                                : ['Rejected', 'Deactivated', 'deactivated'].includes(customer.accountStatus)
                                ? 'red'
                                : 'inherit'
                          }}>
                            {['Personal', 'personal', 'Retail', 'retail'].includes(customer.accountType)
                              ? (customer.accountStatus === 'Approved' ? 'Active' : customer.accountStatus)
                              : ((customer.accountStatus === 'Active' || customer.accountStatus === 'Approved') ? 'Active'
                                : customer.accountStatus === 'Deactivated' ? 'Deactivated'
                                : customer.accountStatus === 'Pending' ? 'Pending'
                                : customer.accountStatus === 'Rejected' ? 'Rejected'
                                : (() => {console.log('Unknown status:', customer.accountStatus, customer); return customer.accountStatus;})())}
                          </span>
                        </td>
                        <td className="action-buttons">
                          <div className="dropdown">
                            <button className="btn dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                              Actions
                            </button>
                            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                              {(customer.accountStatus === 'Active' || customer.accountStatus === 'Approved') && (
                                <li>
                                  <button className="dropdown-item" onClick={() => handleToggleStatus(customer)}>
                                    Deactivate
                                  </button>
                                </li>
                              )}
                              {customer.accountStatus === 'Deactivated' && (
                                <li>
                                  <button className="dropdown-item" onClick={() => handleToggleStatus(customer)}>
                                    Activate
                                  </button>
                                </li>
                              )}
                              {(['Business', 'business', 'Wholesale', 'wholesale'].includes(customer.accountType)) && (customer.accountStatus === 'Pending' || customer.accountStatus === 'Rejected') && (
                                <li>
                                  <button className="dropdown-item" onClick={() => handleApprove(customer.c_id)}>
                                    Approve
                                  </button>
                                </li>
                              )}
                              {(['Business', 'business', 'Wholesale', 'wholesale'].includes(customer.accountType)) && customer.accountStatus === 'Pending' && (
                                <li>
                                  <button className="dropdown-item" onClick={() => handleReject(customer.c_id)}>
                                    Reject
                                  </button>
                                </li>
                              )}
                              <li>
                                <button className="dropdown-item" onClick={() => handleViewCustomer(customer)}>
                                  View
                                </button>
                              </li>
                              <li>
                                <button className="dropdown-item" onClick={() => handleEdit(customer)}>
                                  Edit
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">No customers available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination className="employee-pagination" currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </div>
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Are you sure you want to delete this customer?</h5>
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

export default ManageCustomer;
