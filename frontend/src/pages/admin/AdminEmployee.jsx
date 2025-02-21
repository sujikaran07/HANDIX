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
      // Add full name to the new employee object
      newEmployee.fullName = `${newEmployee.firstName} ${newEmployee.lastName}`;
      // Post data to your backend
      const response = await axios.post('http://localhost:5000/api/employees', newEmployee);
      // Optionally handle response (like adding it to the list of employees in state)
      console.log('Employee saved:', response.data);
      setShowAddEmployeeForm(false);
    } catch (error) {
      console.error('Error saving employee:', error);
    }
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
