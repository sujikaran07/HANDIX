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

  const handleDelete = async (eId) => {
    try {
      await axios.delete(`http://localhost:5000/api/employees/${eId}`);
      setEmployees(employees.filter(emp => emp.eId !== eId)); 
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
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

  const handleSave = async (newEmployee) => {
    try {
      if (showEditEmployeeForm) {
        const response = await axios.put(`http://localhost:5000/api/employees/${newEmployee.eId}`, newEmployee);
        setEmployees(employees.map(emp => emp.eId === newEmployee.eId ? response.data : emp));
      } else {
        const response = await axios.post('http://localhost:5000/api/employees', newEmployee);
        setEmployees([...employees, response.data]);
      }
      setShowAddEmployeeForm(false);
      setShowEditEmployeeForm(false);
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    return (
      (filterRole === 'All' || employee.role.toLowerCase() === filterRole.toLowerCase()) && // Ensure case-insensitive comparison
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
                        <td>{employee.role}</td>
                        <td className="action-buttons">
                          <button className="edit-btn" onClick={() => handleEdit(employee.eId)}>Edit</button>
                          <button className="delete-btn" onClick={() => handleDelete(employee.eId)}>Delete</button>
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
    </div>
  );
};

export default ManageEmployee;