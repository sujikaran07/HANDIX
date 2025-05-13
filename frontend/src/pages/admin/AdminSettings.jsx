import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageSettings from '../../components/ManageSettings';
import '../../styles/admin/AdminSettings.css';
import axios from 'axios';

const AdminSettingsPage = () => {
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          console.log('Admin token missing. Redirecting to login.');
          setIsAuthenticated(false);
          navigate('/login');
          return;
        }

        // Always clear axios headers before setting new ones
        delete axios.defaults.headers.common['Authorization'];
        // Set the Authorization header for subsequent requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          const response = await axios.get('/api/employees/settings/profile');
          if (response.data && response.data.success) {
            // IMPORTANT: Check if user is admin (role 1)
            if (response.data.data.roleId === 1) {
              console.log('Confirmed admin role. Staying on admin page.');
              setIsAuthenticated(true);
            } else {
              console.log('User is not an admin. Redirecting to login.');
              // Role mismatch - clear admin token and redirect to login
              localStorage.removeItem('adminToken');
              setIsAuthenticated(false);
              navigate('/login');
              return;
            }
          }
        } catch (error) {
          console.log('Error validating admin role:', error);
          if (error.response && error.response.status === 401) {
            localStorage.removeItem('adminToken');
            setIsAuthenticated(false);
            navigate('/login');
            return;
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleViewSetting = (setting) => {
    setSelectedSetting(setting);
  };

  const handleBackToSettings = () => {
    setSelectedSetting(null);
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Verifying your credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          You must be logged in as an admin to access this page. Please log in.
        </div>
      </div>
    );
  }

  return (
    <div className="admin-settings-page">
      <AdminSidebar />
      <div className="main-content">
        <AdminTopbar />
        {selectedSetting ? (
          <div> 
            <button className="btn btn-primary mb-3 mt-3 ms-3" onClick={handleBackToSettings}>
              <i className="fas fa-arrow-left me-2"></i> Back to Settings
            </button>
          </div>
        ) : (
          <ManageSettings onViewSetting={handleViewSetting} />
        )}
      </div>
    </div>
  );
};

export default AdminSettingsPage;
