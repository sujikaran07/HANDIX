import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageArtisans from '../../components/ManageEmployee';
import AddEmployeeForm from '../../components/AddEmployeeForm';
import '../../styles/admin/AdminEmployee.css';

const AdminManageArtisanPage = () => {
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);

  const handleAddEmployeeClick = () => {
    setShowAddEmployeeForm(true);
  };

  const handleCancel = () => {
    setShowAddEmployeeForm(false);
  };

  const handleSave = async (newEmployee) => {
    try {
      const response = await axios.post('http://localhost:5000/api/employees', newEmployee);
      // Optionally, update the state with the new employee data
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
          <ManageArtisans onAddEmployeeClick={handleAddEmployeeClick} />
        )}
      </div>
    </div>
  );
};

export default AdminManageArtisanPage;
