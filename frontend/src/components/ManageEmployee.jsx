import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons';
import { FaUserTie, FaPlus } from 'react-icons/fa';
import Pagination from './Pagination';
import AddEmployeeForm from './AddEmployeeForm';
import EditEmployeeForm from './EditEmployeeForm';
import axios from 'axios';

const ManageEmployee = ({ onAddEmployeeClick }) => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [showEditEmployeeForm, setShowEditEmployeeForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [employeeToDelete, setEmployeeToDelete] = useState(null); 
  const employeesPerPage = 4;

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/employees');
        console.log('Fetched employees:', response.data); 
        setEmployees(response.data); 
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/employees/${employeeToDelete.eId}`);
      setEmployees(employees.filter(emp => emp.eId !== employeeToDelete.eId)); 
      console.log(`Employee with E-ID ${employeeToDelete.eId} deleted successfully.`);
      setShowDeleteModal(false); 
      setEmployeeToDelete(null); 
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee. Please try again.');
    }
  };

  const confirmDelete = (employee) => {
    setEmployeeToDelete(employee); 
    setShowDeleteModal(true); 
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false); 
    setEmployeeToDelete(null); 
  };

  const handleEdit = (eId) => {
    const employee = employees.find(emp => emp.eId === eId);
    setSelectedEmployee(employee);
    setShowEditEmployeeForm(true);
  };

  const handleAddEmployeeClick = () => {
    setShowAddEmployeeForm(true);
  };

  const handleCancel = () => {
    setShowAddEmployeeForm(false);
    setShowEditEmployeeForm(false);
  };

  const handleSave = async (updatedEmployee) => {
    try {
      if (showEditEmployeeForm) {
        setEmployees(employees.map(emp => emp.eId === updatedEmployee.eId ? updatedEmployee : emp)); 
      } else {
        const response = await axios.post('http://localhost:5000/api/employees', updatedEmployee);
        setEmployees([...employees, response.data]); 
      }
      setShowAddEmployeeForm(false);
      setShowEditEmployeeForm(false);
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const roleName = employee.roleId === 1 ? 'Admin' : employee.roleId === 2 ? 'Artisan' : 'Other';
    return (
      (filterRole === 'All' || roleName.toLowerCase() === filterRole.toLowerCase()) &&
      (`${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
       employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (employee.phone && employee.phone.includes(searchTerm)) ||
       employee.eId.toString().includes(searchTerm))
    );
  });

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        {showAddEmployeeForm ? (
          <AddEmployeeForm onSave={handleSave} onCancel={handleCancel} />
        ) : showEditEmployeeForm ? (
          <EditEmployeeForm employee={selectedEmployee} onSave={handleSave} onCancel={handleCancel} />
        ) : (
          <>
            <div className="manage-artisan-header d-flex justify-content-between align-items-center mb-3">
              <div className="title-section">
                <div className="icon-and-title">
                  <FaUserTie className="employee-icon" />
                  <div className="text-section">
                    <h2>Employee</h2>
                    <p>Manage your employee</p>
                  </div>
                </div>
              </div>
              <div className="button-section">
                <button className="export-btn btn btn-light me-2">
                  <FontAwesomeIcon icon={faCloudDownloadAlt} /> Export
                </button>
                <button className="add-employee-btn btn btn-primary" onClick={handleAddEmployeeClick}>
                  <FaPlus /> Add Employee
                </button>
              </div>
            </div>

            <div className="manage-request-header d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Manage Employees</h4>
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
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="Admin">Admin</option>
                      <option value="Artisan">Artisan</option> 
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ flex: '1 1 auto', overflowY: 'auto' }}>
              <table className="table table-bordered table-striped artisan-table">
                <thead>
                  <tr>
                    <th>E-ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmployees.length > 0 ? (
                    currentEmployees.map(employee => (
                      <tr key={employee.eId}>
                        <td>{employee.eId}</td>
                        <td>{`${employee.firstName} ${employee.lastName}`}</td>
                        <td>{employee.email}</td>
                        <td>{employee.phone || 'N/A'}</td>
                        <td>{employee.roleId === 1 ? 'Admin' : employee.roleId === 2 ? 'Artisan' : 'Other'}</td>
                        <td className="action-buttons">
                          <div className="dropdown">
                            <button className="btn dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                              Actions
                            </button>
                            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                              <li>
                                <button className="dropdown-item" onClick={() => handleEdit(employee.eId)}>
                                  Edit
                                </button>
                              </li>
                              <li>
                                <button className="dropdown-item" onClick={() => confirmDelete(employee)}>
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
                      <td colSpan="6" className="text-center">No users available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </div>

      
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Are you sure you want to delete this employee?</h5>
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

export default ManageEmployee;