import React, { useState, useEffect } from "react";
import "../styles/admin/AdminDashboard.css";
import axios from "axios";

const AdminDashboardCards = () => {
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeCustomers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        console.log('Fetching dashboard summary...');
        const response = await axios.get('http://localhost:5000/api/dashboard/summary');
        console.log('Dashboard summary response:', response.data);
        setSummaryData(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  if (loading) {
    return <div className="dashboard-cards">Loading...</div>;
  }

  if (error) {
    return <div className="dashboard-cards">Error: {error}</div>;
  }

  return (
    <div className="dashboard-cards" style={{ paddingBottom: '20px' }}>
      <div className="card" style={{ 
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
        transition: 'transform 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-5px)'
        }
      }}>
        <h4 style={{ color: '#666', marginBottom: '15px' }}>Total Revenue</h4>
        <p style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#3498db',
          marginBottom: '10px'
        }}>
          LKR {summaryData.totalRevenue.toLocaleString()}
        </p>
        <span className="percentage" style={{ 
          color: '#666',
          fontSize: '14px',
          display: 'block',
          marginTop: '5px'
        }}>Last 30 Days</span>
      </div>
      <div className="card" style={{ 
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
        transition: 'transform 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-5px)'
        }
      }}>
        <h4 style={{ color: '#666', marginBottom: '15px' }}>Total Orders</h4>
        <p style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#27ae60',
          marginBottom: '10px'
        }}>
          {summaryData.totalOrders}
        </p>
        <span className="percentage" style={{ 
          color: '#666',
          fontSize: '14px',
          display: 'block',
          marginTop: '5px'
        }}>Last 30 Days</span>
      </div>
      <div className="card" style={{ 
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
        transition: 'transform 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-5px)'
        }
      }}>
        <h4 style={{ color: '#666', marginBottom: '15px' }}>Active Customers</h4>
        <p style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#0022ff',
          marginBottom: '10px'
        }}>
          {summaryData.activeCustomers}
        </p>
        <span className="percentage" style={{ 
          color: '#666',
          fontSize: '14px',
          display: 'block',
          marginTop: '5px'
        }}>Last 30 Days</span>
      </div>
    </div>
  );
};

export default AdminDashboardCards;
