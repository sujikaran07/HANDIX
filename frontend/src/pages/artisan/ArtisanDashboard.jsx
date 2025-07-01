import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import ArtisanDashboardCards from '../../components/artisan/ArtisanDashboardCards';
import ArtisanProductsBarChart from '../../components/artisan/ArtisanProductsBarChart';
import '../../styles/artisan/ArtisanDashboard.css';

// Main artisan dashboard with authentication and role verification
const ArtisanDashboard = () => {
  const navigate = useNavigate();
  // State management for authentication and artisan data
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(true);
  const [artisanId, setArtisanId] = useState(null);

  useEffect(() => {
    // Verify artisan token and extract user information
    const verifyToken = () => {
      try {
        const artisanToken = localStorage.getItem('artisanToken');
        
        if (!artisanToken) {
          setIsAuthenticated(false);
          navigate('/login');
          return false;
        }
        
        // Decode and validate JWT token
        const decoded = jwtDecode(artisanToken);
        
        // Check token expiration
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          localStorage.removeItem('artisanToken');
          setIsAuthenticated(false);
          navigate('/login');
          return false;
        }
        
        // Verify artisan role (role ID 2)
        if (decoded.role !== 2) {
          setIsAuthenticated(false);
          navigate('/login');
          return false;
        }
        
        // Store artisan ID for dashboard components
        setArtisanId(decoded.id);
        localStorage.setItem('artisanId', decoded.id);
        
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        setIsAuthenticated(false);
        navigate('/login');
        return false;
      }
    };
    
    const isValid = verifyToken();
    setLoading(!isValid);
  }, [navigate]);

  // Loading state while verifying authentication
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
    return null; 
  }

  return (
    <div className="artisan-dashboard-container">
      <ArtisanSidebar />
      <ArtisanTopBar artisanId={artisanId} />
      <div className="artisan-main-content">
        {/* Dashboard title section */}
        <div className="artisan-dashboard-title">
          <h2>Dashboard</h2>
        </div>
        {/* Summary cards displaying key metrics */}
        <div className="artisan-dashboard-cards">
          <ArtisanDashboardCards />
        </div>
        {/* Products performance chart */}
        <div className="artisan-graph-container">
          <ArtisanProductsBarChart />
        </div>
      </div>
    </div>
  );
};

export default ArtisanDashboard;
