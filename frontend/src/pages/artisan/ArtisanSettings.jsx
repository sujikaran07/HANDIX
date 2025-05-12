import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import ManageArtisanSettings from '../../components/artisan/ManageArtisanSettings';
import '../../styles/artisan/ArtisanSettings.css';
import axios from 'axios';

const ArtisanSettingsPage = () => {
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('Token missing. Redirecting to login.');
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
            // IMPORTANT: Check if user is artisan (role 2)
            if (response.data.data.roleId === 2) {
              console.log('Confirmed artisan role. Staying on artisan page.');
              setIsAuthenticated(true);
              
              // Store this token as artisanToken
              localStorage.setItem('artisanToken', token);
            } else {
              console.log('User is not an artisan. Redirecting to admin dashboard.');
              // User is admin, store as adminToken and redirect
              localStorage.setItem('adminToken', token);
              navigate('/admin/dashboard');
              return;
            }
          }
        } catch (error) {
          console.log('Error validating artisan role:', error);
          if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
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
