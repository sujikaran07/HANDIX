import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import ArtisanDashboardCards from '../../components/artisan/ArtisanDashboardCards';
import ArtisanProductsBarChart from '../../components/artisan/ArtisanProductsBarChart';
import '../../styles/artisan/ArtisanDashboard.css';

const ArtisanDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(true);
  const [artisanId, setArtisanId] = useState(null);

  useEffect(() => {
    // Check if artisan token exists and is valid
    const verifyToken = () => {
      try {
        const artisanToken = localStorage.getItem('artisanToken');
        console.log('ArtisanDashboard - artisanToken check:', artisanToken ? 'Token exists' : 'No token found');
        
        if (!artisanToken) {
          console.warn('No artisan token found, redirecting to login');
          setIsAuthenticated(false);
          navigate('/login');
          return false;
        }
        
        // Verify token by decoding it
        const decoded = jwtDecode(artisanToken);
        console.log('Decoded token in dashboard:', decoded);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          console.warn('Token expired, redirecting to login');
          localStorage.removeItem('artisanToken');
          setIsAuthenticated(false);
          navigate('/login');
          return false;
        }
        
        // Check if user has artisan role (role ID 2)
        if (decoded.role !== 2) {
          console.warn('User is not an artisan, redirecting to login');
          setIsAuthenticated(false);
          navigate('/login');
          return false;
        }
        
        // Save artisan ID
        setArtisanId(decoded.id);
        localStorage.setItem('artisanId', decoded.id);
        
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        console.error('Error verifying token:', error);
        setIsAuthenticated(false);
        navigate('/login');
        return false;
      }
    };
    
    const isValid = verifyToken();
    setLoading(!isValid);
  }, [navigate]);

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
    <div className="artisan-dashboard-container">
      <ArtisanSidebar />
      <ArtisanTopBar artisanId={artisanId} />
      <div className="artisan-main-content">
        <div className="artisan-dashboard-title">
          <h2>Dashboard</h2>
        </div>
        <div className="artisan-dashboard-cards">
          <ArtisanDashboardCards />
        </div>
        <div className="artisan-graph-container">
          <ArtisanProductsBarChart />
        </div>
      </div>
    </div>
  );
};

export default ArtisanDashboard;
