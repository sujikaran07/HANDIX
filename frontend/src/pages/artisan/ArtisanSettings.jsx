import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import ManageArtisanSettings from '../../components/artisan/ManageArtisanSettings';
import '../../styles/artisan/ArtisanSettings.css';
import axios from 'axios';

// Artisan settings page with role-based authentication
const ArtisanSettingsPage = () => {
  // State management for settings and authentication
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verify artisan authentication and role on page load
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('artisanToken');
        
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
            // Verify artisan role (role ID 2)
            if (response.data.data.roleId === 2) {
              setIsAuthenticated(true);
            } else {
              // Invalid role - clear token and redirect
              localStorage.removeItem('artisanToken');
              setIsAuthenticated(false);
              navigate('/login');
              return;
            }
          }
        } catch (error) {
          if (error.response && error.response.status === 401) {
            localStorage.removeItem('artisanToken');
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
          You must be logged in as an artisan to access this page. Please log in.
        </div>
      </div>
    );
  }

  return (
    <div className="artisan-settings-page">
      <ArtisanSidebar />
      <div className="artisan-main-content">
        <ArtisanTopBar />
        {/* Conditional rendering for settings view */}
        {selectedSetting ? (
          <div>
            <button className="btn btn-primary mb-3 mt-3 ms-3" onClick={handleBackToSettings}>
              <i className="fas fa-arrow-left me-2"></i> Back to Settings
            </button>
          </div>
        ) : (
          <ManageArtisanSettings onViewSetting={handleViewSetting} />
        )}
      </div>
    </div>
  );
};

export default ArtisanSettingsPage;
