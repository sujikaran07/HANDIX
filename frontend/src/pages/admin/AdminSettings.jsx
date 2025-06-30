import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageSettings from '../../components/ManageSettings';
import '../../styles/admin/AdminSettings.css';
import axios from 'axios';

// Admin settings page with role-based authentication
const AdminSettingsPage = () => {
  // State management for settings and authentication
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verify admin authentication and role on page load
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          setIsAuthenticated(false);
          navigate('/login');
          return;
        }

        // Set authorization header for API requests
        delete axios.defaults.headers.common['Authorization'];
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          const response = await axios.get('/api/employees/settings/profile');
          if (response.data && response.data.success) {
            // Verify admin role (role ID 1)
            if (response.data.data.roleId === 1) {
              setIsAuthenticated(true);
            } else {
              // Invalid role - clear token and redirect
              localStorage.removeItem('adminToken');
              setIsAuthenticated(false);
              navigate('/login');
              return;
            }
          }
        } catch (error) {
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

  // Handle setting selection (if needed for future functionality)
  const handleViewSetting = (setting) => {
    setSelectedSetting(setting);
  };

  const handleBackToSettings = () => {
    setSelectedSetting(null);
  };

  // Loading state while verifying authentication
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

  // Unauthorized access display
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
        {/* Conditional rendering for settings view */}
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
