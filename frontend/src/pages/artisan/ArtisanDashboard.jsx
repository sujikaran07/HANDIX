import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import ArtisanDashboardCards from '../../components/artisan/ArtisanDashboardCards';
import ArtisanSalesTrendGraph from '../../components/artisan/ArtisanSalesTrendGraph';
import ArtisanProductSalesChart from '../../components/artisan/ArtisanProductSalesChart';
import '../../styles/artisan/ArtisanDashboard.css';

const ArtisanDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if artisan token exists
    const artisanToken = localStorage.getItem('artisanToken');
    console.log('ArtisanDashboard - artisanToken check:', artisanToken ? 'Token exists' : 'No token found');
    
    if (!artisanToken) {
      console.warn('No artisan token found, redirecting to login');
      setIsAuthenticated(false);
      navigate('/login');
      return;
    }
    
    setIsAuthenticated(true);
    setLoading(false);
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
      <ArtisanTopBar />
      <div className="artisan-main-content">
        <div className="artisan-dashboard-title">
          <h2>Dashboard</h2>
        </div>
        <div className="artisan-dashboard-cards">
          <ArtisanDashboardCards />
        </div>
        <div className="artisan-graph-container">
          <ArtisanSalesTrendGraph />
          <ArtisanProductSalesChart />
        </div>
      </div>
    </div>
  );
};

export default ArtisanDashboard;
