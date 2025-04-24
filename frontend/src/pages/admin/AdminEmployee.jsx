import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageEmployee from '../../components/ManageEmployee'; 
import AddEmployeeForm from '../../components/AddEmployeeForm';
import axios from 'axios'; 
import '../../styles/admin/AdminEmployee.css';

const AdminManageEmployeePage = () => {
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);

  const handleAddEmployeeClick = () => {
    setShowAddEmployeeForm(true);
  };

  const handleCancel = () => {
    setShowAddEmployeeForm(false);
  };

  const handleSave = async (newEmployee) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found in localStorage');
        alert('Authentication required. Please login again.');
        return;
      }
      
      newEmployee.fullName = `${newEmployee.firstName} ${newEmployee.lastName}`;
      const response = await axios.post('http://localhost:5000/api/employees', newEmployee, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      console.log('Employee saved:', response.data);
      setShowAddEmployeeForm(false);
      window.location.reload(); 
    } catch (error) {
      console.error('Error saving employee:', error);
      
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please login again.');
      } else {
        alert('Failed to save employee. Please try again.');
      }
    }
  };

  const handleUpdate = (updatedEmployee) => {
    console.log('handleUpdate called with:', updatedEmployee); 
    setShowEditEmployeeForm(false); 
    setRefreshKey((prevKey) => prevKey + 1); 
  };

  return (
    <div className="admin-employee-page">
      <AdminSidebar />
      <div className="main-content">
        <AdminTopbar />
        {showAddEmployeeForm ? (
          <AddEmployeeForm onSave={handleSave} onCancel={handleCancel} />
        ) : (
          <ManageEmployee onAddEmployeeClick={handleAddEmployeeClick} />
        )}
      </div>
    </div>
  );
};

export default AdminManageEmployeePage;
