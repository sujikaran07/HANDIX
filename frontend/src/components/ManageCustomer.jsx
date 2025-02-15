import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCloudDownloadAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FaUsers } from 'react-icons/fa';
import Pagination from './Pagination';
import AddCustomerForm from './AddCustomerForm';
import EditCustomerForm from './EditCustomerForm';
import CustomerViewForm from './CustomerViewForm';

const ManageCustomer = ({ onViewCustomer, onAddCustomer, showAddCustomerForm, onCancelAddCustomer, onSaveCustomer, onSaveAndAddAnotherCustomer }) => {
  const [customers, setCustomers] = useState([
    { id: 'C001', name: 'John Doe', email: 'john@example.com', accountType: 'Retail', status: 'Active', country: 'USA' },
    { id: 'C002', name: 'Jane Smith', email: 'jane@example.com', accountType: 'Wholesale', status: 'Pending', country: 'Canada' },
    { id: 'C003', name: 'Alice Johnson', email: 'alice@example.com', accountType: 'Retail', status: 'Rejected', country: 'USA' },
    { id: 'C004', name: 'Bob Brown', email: 'bob@example.com', accountType: 'Wholesale', status: 'Active', country: 'Canada' },
    { id: 'C005', name: 'Charlie Davis', email: 'charlie@example.com', accountType: 'Retail', status: 'Pending', country: 'USA' },
    { id: 'C006', name: 'Diana Evans', email: 'diana@example.com', accountType: 'Wholesale', status: 'Rejected', country: 'Canada' },
    { id: 'C007', name: 'Eve Foster', email: 'eve@example.com', accountType: 'Retail', status: 'Active', country: 'USA' },
    { id: 'C008', name: 'Frank Green', email: 'frank@example.com', accountType: 'Wholesale', status: 'Pending', country: 'Canada' },
    { id: 'C009', name: 'Grace Harris', email: 'grace@example.com', accountType: 'Retail', status: 'Rejected', country: 'USA' },
    { id: 'C010', name: 'Hank Irving', email: 'hank@example.com', accountType: 'Wholesale', status: 'Active', country: 'Canada' },
    { id: 'C011', name: 'Ivy Jackson', email: 'ivy@example.com', accountType: 'Retail', status: 'Pending', country: 'USA' },
    { id: 'C012', name: 'Jack King', email: 'jack@example.com', accountType: 'Wholesale', status: 'Rejected', country: 'Canada' },
    { id: 'C013', name: 'Karen Lee', email: 'karen@example.com', accountType: 'Retail', status: 'Active', country: 'USA' },
    { id: 'C014', name: 'Leo Martin', email: 'leo@example.com', accountType: 'Wholesale', status: 'Pending', country: 'Canada' },
    { id: 'C015', name: 'Mona Nelson', email: 'mona@example.com', accountType: 'Retail', status: 'Rejected', country: 'USA' },
    { id: 'C016', name: 'Nina Owens', email: 'nina@example.com', accountType: 'Wholesale', status: 'Active', country: 'Canada' },
    { id: 'C017', name: 'Oscar Perez', email: 'oscar@example.com', accountType: 'Retail', status: 'Pending', country: 'USA' },
    { id: 'C018', name: 'Paul Quinn', email: 'paul@example.com', accountType: 'Wholesale', status: 'Rejected', country: 'Canada' },
    { id: 'C019', name: 'Quincy Roberts', email: 'quincy@example.com', accountType: 'Retail', status: 'Active', country: 'USA' },
    { id: 'C020', name: 'Rachel Scott', email: 'rachel@example.com', accountType: 'Wholesale', status: 'Pending', country: 'Canada' },
    { id: 'C021', name: 'Sam Taylor', email: 'sam@example.com', accountType: 'Retail', status: 'Rejected', country: 'USA' },
    { id: 'C022', name: 'Tina Underwood', email: 'tina@example.com', accountType: 'Wholesale', status: 'Active', country: 'Canada' },
    { id: 'C023', name: 'Uma Vincent', email: 'uma@example.com', accountType: 'Retail', status: 'Pending', country: 'USA' },
    { id: 'C024', name: 'Victor White', email: 'victor@example.com', accountType: 'Wholesale', status: 'Rejected', country: 'Canada' },
    { id: 'C025', name: 'Wendy Xander', email: 'wendy@example.com', accountType: 'Retail', status: 'Active', country: 'USA' },
    { id: 'C026', name: 'Xander Young', email: 'xander@example.com', accountType: 'Wholesale', status: 'Pending', country: 'Canada' },
    { id: 'C027', name: 'Yara Zane', email: 'yara@example.com', accountType: 'Retail', status: 'Rejected', country: 'USA' },
    { id: 'C028', name: 'Zack Allen', email: 'zack@example.com', accountType: 'Wholesale', status: 'Active', country: 'Canada' },
    { id: 'C029', name: 'Amy Baker', email: 'amy@example.com', accountType: 'Retail', status: 'Pending', country: 'USA' },
    { id: 'C030', name: 'Brian Clark', email: 'brian@example.com', accountType: 'Wholesale', status: 'Rejected', country: 'Canada' },
    { id: 'C031', name: 'Cathy Davis', email: 'cathy@example.com', accountType: 'Retail', status: 'Active', country: 'USA' },
    { id: 'C032', name: 'David Evans', email: 'david@example.com', accountType: 'Wholesale', status: 'Pending', country: 'Canada' },
    { id: 'C033', name: 'Ella Foster', email: 'ella@example.com', accountType: 'Retail', status: 'Rejected', country: 'USA' },
    { id: 'C034', name: 'Frank Green', email: 'frank@example.com', accountType: 'Wholesale', status: 'Active', country: 'Canada' },
    { id: 'C035', name: 'Grace Harris', email: 'grace@example.com', accountType: 'Retail', status: 'Pending', country: 'USA' },
    { id: 'C036', name: 'Hank Irving', email: 'hank@example.com', accountType: 'Wholesale', status: 'Rejected', country: 'Canada' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const customersPerPage = 4;

  const handleDelete = (id) => {
    setCustomers(customers.filter(customer => customer.id !== id));
  };

  const handleApprove = (id) => {
    setCustomers(customers.map(customer => customer.id === id ? { ...customer, status: 'Active' } : customer));
  };

  const handleReject = (id) => {
    setCustomers(customers.map(customer => customer.id === id ? { ...customer, status: 'Rejected' } : customer));
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
  };

  const handleCancelEdit = () => {
    setEditingCustomer(null);
  };

  const handleSaveEdit = (updatedCustomer) => {
    setCustomers(customers.map(customer => customer.id === updatedCustomer.id ? updatedCustomer : customer));
    setEditingCustomer(null);
  };

  const handleViewCustomer = (customer) => {
    setViewingCustomer(customer);
  };

  const handleBackToTable = () => {
    setViewingCustomer(null);
  };

  const filteredCustomers = customers.filter(customer => {
    return (
      (filterStatus === 'All' || customer.status === filterStatus) &&
      (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
       customer.accountType.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <AddCustomerForm onSave={onSaveCustomer} onSaveAndAddAnother={onSaveAndAddAnotherCustomer} onCancel={onCancelAddCustomer} />
        ) : editingCustomer ? (
          <EditCustomerForm customer={editingCustomer} onSave={handleSaveEdit} onCancel={handleCancelEdit} />
        ) : viewingCustomer ? (
          <CustomerViewForm customer={viewingCustomer} onBack={handleBackToTable} />
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
                      <option value="Active">Active</option>
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
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Account Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCustomers.length > 0 ? (
                    currentCustomers.map(customer => (
                      <tr key={customer.id}>
                        <td>{customer.id}</td>
                        <td>{customer.name}</td>
                        <td>{customer.email}</td>
                        <td>{customer.accountType}</td>
                        <td className={`status ${customer.status.toLowerCase()}`}>{customer.status}</td>
                        <td className="action-buttons">
                          <div className="dropdown">
                            <button className="btn dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                              Actions
                            </button>
                            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                              <li>
                                <button className="dropdown-item" onClick={() => handleApprove(customer.id)}>
                                  Approve
                                </button>
                              </li>
                              <li>
                                <button className="dropdown-item" onClick={() => handleReject(customer.id)}>
                                  Reject
                                </button>
                              </li>
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
                              <li>
                                <button className="dropdown-item" onClick={() => handleDelete(customer.id)}>
                                  Delete
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
    </div>
  );
};

export default ManageCustomer;
