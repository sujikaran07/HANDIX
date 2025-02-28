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
      
      newEmployee.fullName = `${newEmployee.firstName} ${newEmployee.lastName}`;
      const response = await axios.post('http://localhost:5000/api/employees', newEmployee);
      console.log('Employee saved:', response.data);
      setShowAddEmployeeForm(false);
      window.location.reload(); 
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
