import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageEmployee from '../../components/ManageEmployee'; 
import AddEmployeeForm from '../../components/AddEmployeeForm';
import axios from 'axios'; 
import '../../styles/admin/AdminEmployee.css';

// Admin employee management page
const AdminManageEmployeePage = () => {
  const navigate = useNavigate();
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(true);
  const [setRefreshKey] = useState(0);
  const [showEditEmployeeForm, setShowEditEmployeeForm] = useState(false);

  useEffect(() => {
    // Check admin authentication token
    const adminToken = localStorage.getItem('adminToken');
    console.log('AdminEmployee - adminToken check:', adminToken ? 'Token exists' : 'No token found');
    
    if (!adminToken) {
      // Redirect if not authenticated
      setIsAuthenticated(false);
      navigate('/login');
      return;
    }
    setIsAuthenticated(true);
    setLoading(false);
  }, [navigate]);

  // Show add employee form
  const handleAddEmployeeClick = () => {
    setShowAddEmployeeForm(true);
  };

  // Cancel add employee form
  const handleCancel = () => {
    setShowAddEmployeeForm(false);
  };

  // Save new employee to backend
  const handleSave = async (newEmployee) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        alert('Authentication required. Please login again.');
        navigate('/login');
        return;
      }
      
      newEmployee.fullName = `${newEmployee.firstName} ${newEmployee.lastName}`;
      const response = await axios.post('http://localhost:5000/api/employees', newEmployee, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      setShowAddEmployeeForm(false);
      window.location.reload(); 
    } catch (error) {
      console.error('Error saving employee:', error);
      
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please login again.');
        navigate('/login');
      } else {
        alert('Failed to save employee. Please try again.');
      }
    }
  };

  // Handle employee update (refresh list)
  const handleUpdate = (updatedEmployee) => {
    setShowEditEmployeeForm(false); 
    setRefreshKey((prevKey) => prevKey + 1); 
  };

  if (loading) {
    // Show loading spinner
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Verifying credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If not authenticated, render nothing (redirect handled above)
    return null;
  }

  // Main layout
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
