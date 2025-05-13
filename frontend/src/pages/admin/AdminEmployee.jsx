import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageEmployee from '../../components/ManageEmployee'; 
import AddEmployeeForm from '../../components/AddEmployeeForm';
import axios from 'axios'; 
import '../../styles/admin/AdminEmployee.css';

const AdminManageEmployeePage = () => {
  const navigate = useNavigate();
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(true);
  const [setRefreshKey] = useState(0);
  const [showEditEmployeeForm, setShowEditEmployeeForm] = useState(false);

  useEffect(() => {
    // Check if admin token exists
    const adminToken = localStorage.getItem('adminToken');
    console.log('AdminEmployee - adminToken check:', adminToken ? 'Token exists' : 'No token found');
    
    if (!adminToken) {
      console.warn('No admin token found, redirecting to login');
      setIsAuthenticated(false);
      navigate('/login');
      return;
    }
    
    setIsAuthenticated(true);
    setLoading(false);
  }, [navigate]);

  const handleAddEmployeeClick = () => {
    setShowAddEmployeeForm(true);
  };

  const handleCancel = () => {
    setShowAddEmployeeForm(false);
  };

  const handleSave = async (newEmployee) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('No token found in localStorage');
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
      
      console.log('Employee saved:', response.data);
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

  const handleUpdate = (updatedEmployee) => {
    console.log('handleUpdate called with:', updatedEmployee); 
    setShowEditEmployeeForm(false); 
    setRefreshKey((prevKey) => prevKey + 1); 
  };

  if (loading) {
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
    return null; // Will redirect via useEffect
  }

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
