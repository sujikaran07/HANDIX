import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import AdminDashboardCards from '../../components/AdminDashboardCards';
import SalesTrendGraph from '../../components/AdminSalesTrendGraph';
import '../../styles/admin/AdminDashboard.css';

// Admin dashboard page with authentication and layout
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check admin token
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      setIsAuthenticated(false);
      navigate('/login');
      return;
    }
    setIsAuthenticated(true);
    setLoading(false);
  }, [navigate]);

  if (loading) {
    // Show spinner while loading
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
    // Redirected if not authenticated
    return null; 
  }

  // Dashboard layout
  return (
    <div className="dashboard-container">
      <AdminSidebar />
      <AdminTopbar />
      <div className="main-content">
        <div className="dashboard-title">
          <h2>Dashboard</h2>
        </div>
        <div className="dashboard-cards">
          <AdminDashboardCards />
        </div>
        <div className="graph-container">
          <SalesTrendGraph />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
