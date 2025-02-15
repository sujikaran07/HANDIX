import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons';
import { FaUserTie, FaPlus } from 'react-icons/fa';
import Pagination from './Pagination';
import AddEmployeeForm from './AddEmployeeForm';
import EditEmployeeForm from './EditEmployeeForm';

const ManageLeaveRequests = ({ onAddEmployeeClick }) => {
  const [requests, setRequests] = useState([
    { id: 'A001', name: 'Brooklyn Simmons', email: 'brooklyn@example.com', phone: '123-456-7890', role: 'Artisan' },
    { id: 'A002', name: 'Ralph Edwards', email: 'ralph@example.com', phone: '123-456-7891', role: 'Admin' },
    { id: 'A003', name: 'Leslie Alexander', email: 'leslie@example.com', phone: '123-456-7892', role: 'Artisan' },
    { id: 'A004', name: 'Cody Fisher', email: 'cody@example.com', phone: '123-456-7893', role: 'Admin' },
    { id: 'A005', name: 'Arlene McCoy', email: 'arlene@example.com', phone: '123-456-7894', role: 'Artisan' },
    { id: 'A006', name: 'John Doe', email: 'john@example.com', phone: '123-456-7895', role: 'Artisan' },
    { id: 'A007', name: 'Jane Smith', email: 'jane@example.com', phone: '123-456-7896', role: 'Admin' },
    { id: 'A008', name: 'Michael Johnson', email: 'michael@example.com', phone: '123-456-7897', role: 'Artisan' },
    { id: 'A009', name: 'Emily Davis', email: 'emily@example.com', phone: '123-456-7898', role: 'Admin' },
    { id: 'A010', name: 'David Wilson', email: 'david@example.com', phone: '123-456-7899', role: 'Artisan' },
    { id: 'A011', name: 'Sarah Brown', email: 'sarah@example.com', phone: '123-456-7800', role: 'Admin' },
    { id: 'A012', name: 'James White', email: 'james@example.com', phone: '123-456-7801', role: 'Artisan' },
    { id: 'A013', name: 'Patricia Green', email: 'patricia@example.com', phone: '123-456-7802', role: 'Admin' },
    { id: 'A014', name: 'Robert Black', email: 'robert@example.com', phone: '123-456-7803', role: 'Artisan' },
    { id: 'A015', name: 'Linda Blue', email: 'linda@example.com', phone: '123-456-7804', role: 'Admin' },
    { id: 'A016', name: 'Michael Red', email: 'michaelr@example.com', phone: '123-456-7805', role: 'Artisan' },
    { id: 'A017', name: 'Barbara Yellow', email: 'barbara@example.com', phone: '123-456-7806', role: 'Admin' },
    { id: 'A018', name: 'William Purple', email: 'william@example.com', phone: '123-456-7807', role: 'Artisan' },
    { id: 'A019', name: 'Elizabeth Orange', email: 'elizabeth@example.com', phone: '123-456-7808', role: 'Admin' },
    { id: 'A020', name: 'David Pink', email: 'davidp@example.com', phone: '123-456-7809', role: 'Artisan' },
    { id: 'A021', name: 'Jennifer Gray', email: 'jennifer@example.com', phone: '123-456-7810', role: 'Admin' },
    { id: 'A022', name: 'Charles Brown', email: 'charles@example.com', phone: '123-456-7811', role: 'Artisan' },
    { id: 'A023', name: 'Susan White', email: 'susan@example.com', phone: '123-456-7812', role: 'Admin' },
    { id: 'A024', name: 'Joseph Green', email: 'joseph@example.com', phone: '123-456-7813', role: 'Artisan' },
    { id: 'A025', name: 'Karen Black', email: 'karen@example.com', phone: '123-456-7814', role: 'Admin' },
    { id: 'A026', name: 'Thomas Blue', email: 'thomas@example.com', phone: '123-456-7815', role: 'Artisan' },
    { id: 'A027', name: 'Nancy Red', email: 'nancy@example.com', phone: '123-456-7816', role: 'Admin' },
    { id: 'A028', name: 'Christopher Yellow', email: 'christopher@example.com', phone: '123-456-7817', role: 'Artisan' },
    { id: 'A029', name: 'Jessica Purple', email: 'jessica@example.com', phone: '123-456-7818', role: 'Admin' },
    { id: 'A030', name: 'Daniel Orange', email: 'daniel@example.com', phone: '123-456-7819', role: 'Artisan' },
    { id: 'A031', name: 'Sarah Pink', email: 'sarahp@example.com', phone: '123-456-7820', role: 'Admin' },
    { id: 'A032', name: 'Matthew Gray', email: 'matthew@example.com', phone: '123-456-7821', role: 'Artisan' },
    { id: 'A033', name: 'Ashley Brown', email: 'ashley@example.com', phone: '123-456-7822', role: 'Admin' },
    { id: 'A034', name: 'Joshua White', email: 'joshua@example.com', phone: '123-456-7823', role: 'Artisan' },
    { id: 'A035', name: 'Amanda Green', email: 'amanda@example.com', phone: '123-456-7824', role: 'Admin' },
    { id: 'A036', name: 'Andrew Black', email: 'andrew@example.com', phone: '123-456-7825', role: 'Artisan' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [showEditEmployeeForm, setShowEditEmployeeForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const employeesPerPage = 4;

  const handleDelete = (id) => {
    setRequests(requests.filter(req => req.id !== id));
  };

  const handleEdit = (id) => {
    const employee = requests.find(req => req.id === id);
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

  const handleSave = (newEmployee) => {
    if (showEditEmployeeForm) {
      setRequests(requests.map(req => req.id === newEmployee.id ? newEmployee : req));
    } else {
      setRequests([...requests, newEmployee]);
    }
    setShowAddEmployeeForm(false);
    setShowEditEmployeeForm(false);
  };

  const filteredRequests = requests.filter(request => {
    return (
      (filterRole === 'All' || request.role === filterRole) &&
      (request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
       request.phone.includes(searchTerm) ||
       request.role.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredRequests.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredRequests.length / employeesPerPage);

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
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmployees.length > 0 ? (
                    currentEmployees.map(request => (
                      <tr key={request.id}>
                        <td>{request.id}</td>
                        <td>{request.name}</td>
                        <td>{request.email}</td>
                        <td>{request.phone}</td>
                        <td>{request.role}</td>
                        <td className="action-buttons">
                          <button className="edit-btn" onClick={() => handleEdit(request.id)}>Edit</button>
                          <button className="delete-btn" onClick={() => handleDelete(request.id)}>Delete</button>
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

export default ManageLeaveRequests;
