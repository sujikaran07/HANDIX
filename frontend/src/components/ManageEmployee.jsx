import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons';
import { FaUserTie, FaPlus } from 'react-icons/fa';
import Pagination from './Pagination';
import AddEmployeeForm from './AddEmployeeForm';
import EditEmployeeForm from './EditEmployeeForm';
import ConfirmationModal from './ui/ConfirmationModal';
import axios from 'axios';

// Employee management table with search, filter, add, edit, and status toggle
const ManageEmployee = ({ onAddEmployeeClick }) => {
  // State variables for employees, search/filter, pagination, forms, and status modals
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [showEditEmployeeForm, setShowEditEmployeeForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState(null);
  const [selectedEmployeeForStatus, setSelectedEmployeeForStatus] = useState(null);
  const employeesPerPage = 7;

  useEffect(() => {
    // Fetch employees from backend API
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          setError('Authentication required. Please login again.');
          setLoading(false);
          return;
        }
        const response = await axios.get('http://localhost:5000/api/employees', {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        setEmployees(response.data);
        setLoading(false);
      } catch (error) {
        // Handle token expiration and other errors
        if (error.response && error.response.status === 401) {
          try {
            const token = localStorage.getItem('adminToken');
            const refreshResponse = await axios.post('http://localhost:5000/api/login/refresh-token', 
              { token },
              { headers: { 'Content-Type': 'application/json' } }
            );
            if (refreshResponse.status === 200) {
              localStorage.setItem('adminToken', refreshResponse.data.token);
              fetchEmployees();
            } else {
              setError('Session expired. Please login again.');
              setLoading(false);
            }
          } catch (refreshError) {
            setError('Authentication failed. Please login again.');
            setLoading(false);
          }
        } else {
          setError('Failed to load employees. Please try again.');
          setLoading(false);
        }
      }
    };
    fetchEmployees();
  }, []);

  // Handle status (activate/deactivate) modal
  const handleToggleStatus = (employee) => {
    const action = employee.status === 'Active' ? 'deactivate' : 'activate';
    setStatusAction(action);
    setSelectedEmployeeForStatus(employee);
    setShowStatusModal(true);
  };

  // Confirm status change
  const handleConfirmStatusChange = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }
      const employee = selectedEmployeeForStatus;
      const action = statusAction;
      const response = await axios.put(
        `http://localhost:5000/api/employees/${employee.eId}/status`,
        {
          action,
          email: employee.email,
          name: `${employee.firstName} ${employee.lastName}`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmployees(employees.map(emp => emp.eId === employee.eId ? response.data.data || response.data : emp));
      setShowStatusModal(false);
      setSelectedEmployeeForStatus(null);
      setStatusAction(null);
    } catch (error) {
      alert('Failed to update employee status. Please try again.');
    }
  };

  // Cancel status change modal
  const handleCancelStatusChange = () => {
    setShowStatusModal(false);
    setSelectedEmployeeForStatus(null);
    setStatusAction(null);
  };

  // Edit employee
  const handleEdit = (eId) => {
    const employee = employees.find(emp => emp.eId === eId);
    setSelectedEmployee(employee);
    setShowEditEmployeeForm(true);
  };

  // Show add employee form
  const handleAddEmployeeClick = () => {
    setShowAddEmployeeForm(true);
  };

  // Cancel add/edit employee form
  const handleCancel = () => {
    setShowAddEmployeeForm(false);
    setShowEditEmployeeForm(false);
  };

  // Save new or edited employee
  const handleSave = async (updatedEmployee) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }
      if (showEditEmployeeForm) {
        const response = await axios.put(
          `http://localhost:5000/api/employees/${updatedEmployee.eId}`, 
          updatedEmployee,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployees(employees.map(emp => 
          emp.eId === updatedEmployee.eId ? response.data : emp
        ));
      } else {
        const response = await axios.post(
          'http://localhost:5000/api/employees', 
          updatedEmployee,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployees([...employees, response.data]);
      }
      setShowAddEmployeeForm(false);
      setShowEditEmployeeForm(false);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please login again.');
      } else {
        alert('Failed to save employee. Please try again.');
      }
    }
  };

  // Filter employees by search and role
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

  // Pagination logic
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
            {/* Header with title and add/export buttons */}
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
                <button className="export-btn">
                  <FontAwesomeIcon icon={faCloudDownloadAlt} /> Export
                </button>
                <button className="add-employee-btn btn btn-primary" onClick={handleAddEmployeeClick}>
                  <FaPlus /> Add Employee
                </button>
              </div>
            </div>

            {/* Search and filter controls */}
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

            {/* Employee table */}
            <div style={{ flex: '1 1 auto', overflowY: 'auto' }}>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading employees...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              ) : (
                <table className="table table-bordered table-striped artisan-table">
                  <thead>
                    <tr>
                      <th>E-ID</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Phone Number</th>
                      <th>Role</th>
                      <th>Status</th>
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
                          <td>
                            <span style={{ color: employee.status === 'active' ? 'green' : 'red' }}>
                              {employee.status === 'active' ? 'Active' : 'Deactivated'}
                            </span>
                          </td>
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
                                  <button className="dropdown-item" onClick={() => handleToggleStatus(employee)}>
                                    {employee.status === 'active' ? 'Deactivate' : 'Activate'}
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">No users available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination controls */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </div>
      {/* Status confirmation modal */}
      {showStatusModal && (
        <ConfirmationModal
          isOpen={showStatusModal}
          title={`Confirm ${statusAction === 'activate' ? 'Activation' : 'Deactivation'}`}
          message={`Are you sure you want to ${statusAction} this employee's account?`}
          onConfirm={handleConfirmStatusChange}
          onCancel={handleCancelStatusChange}
        />
      )}
    </div>
  );
};

export default ManageEmployee;