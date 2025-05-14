import React, { useState, useEffect } from "react";
import "../../styles/artisan/ArtisanDashboard.css";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';

const ArtisanDashboardCards = () => {
  const [summaryData, setSummaryData] = useState({
    totalProducts: 0,
    assignedOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to extract artisan ID from token
  const getArtisanIdFromToken = () => {
    try {
      const token = localStorage.getItem('artisanToken');
      if (!token) {
        return null;
      }
      
      const decoded = jwtDecode(token);
      console.log('Decoded token in dashboard cards:', decoded);
      return decoded.id; // The employee ID is stored as 'id' in the token
    } catch (error) {
      console.error('Error decoding token in dashboard cards:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        
        // Get artisan ID from token
        const artisanId = getArtisanIdFromToken();
        
        if (!artisanId) {
          throw new Error('Authentication error. Please log in again.');
        }
        
        // Store artisanId in localStorage for other components
        localStorage.setItem('artisanId', artisanId);
        
        // Set authorization header with token
        const token = localStorage.getItem('artisanToken');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Add a timeout to prevent hanging if the request takes too long
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 8000)
        );
        
        console.log('Fetching artisan dashboard summary...');
        const fetchPromise = axios.get(`http://localhost:5000/api/artisan-dashboard/summary/${artisanId}`);
        
        try {
          const response = await Promise.race([fetchPromise, timeoutPromise]);
          console.log('Artisan dashboard summary response:', response.data);
          
          // Ensure data has proper format
          const responseData = {
            totalProducts: parseInt(response.data.totalProducts) || 0,
            assignedOrders: parseInt(response.data.assignedOrders) || 0,
            totalRevenue: parseFloat(response.data.totalRevenue) || 0
          };
          
          setSummaryData(responseData);
          setError(null);
        } catch (fetchError) {
          console.error('Error fetching artisan dashboard summary:', fetchError);
          
          // Keep using the default values but show an error message
          setError('Could not load summary data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  if (loading) {
    return (
      <div className="artisan-dashboard-cards" style={{ paddingBottom: '20px', opacity: 0.7 }}>
        <div className="artisan-card" style={{ 
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#fff',
        }}>
          <h4 style={{ color: '#666', marginBottom: '15px' }}>Total Products</h4>
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        
        <div className="artisan-card" style={{ 
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#fff',
        }}>
          <h4 style={{ color: '#666', marginBottom: '15px' }}>Assigned Orders</h4>
          <div className="spinner-border spinner-border-sm text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        
        <div className="artisan-card" style={{ 
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#fff',
        }}>
          <h4 style={{ color: '#666', marginBottom: '15px' }}>Total Revenue</h4>
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="artisan-dashboard-cards" style={{ paddingBottom: '20px' }}>
      <div className="artisan-card" style={{ 
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
        transition: 'transform 0.2s',
        cursor: 'pointer'
      }}>
        <h4 style={{ color: '#666', marginBottom: '15px' }}>Total Products</h4>
        <p style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#3498db',
          marginBottom: '10px'
        }}>
          {summaryData.totalProducts}
        </p>
        <span className="artisan-percentage" style={{ 
          color: '#666',
          fontSize: '14px',
          display: 'block',
          marginTop: '5px'
        }}>
          All time
        </span>
      </div>
      
      <div className="artisan-card" style={{ 
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
        transition: 'transform 0.2s',
        cursor: 'pointer'
      }}>
        <h4 style={{ color: '#666', marginBottom: '15px' }}>Assigned Orders</h4>
        <p style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#27ae60',
          marginBottom: '10px'
        }}>
          {summaryData.assignedOrders}
        </p>
        <span className="artisan-percentage" style={{ 
          color: '#666',
          fontSize: '14px',
          display: 'block',
          marginTop: '5px'
        }}>
          Last 30 Days
        </span>
      </div>
      
      <div className="artisan-card" style={{ 
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
        transition: 'transform 0.2s',
        cursor: 'pointer'
      }}>
        <h4 style={{ color: '#666', marginBottom: '15px' }}>Total Revenue</h4>
        <p style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#0022ff',
          marginBottom: '10px'
        }}>
          LKR {summaryData.totalRevenue.toLocaleString()}
        </p>
        <span className="artisan-percentage" style={{ 
          color: '#666',
          fontSize: '14px',
          display: 'block',
          marginTop: '5px'
        }}>
          Last 30 Days
        </span>
      </div>
      {error && (
        <div style={{
          color: '#e74c3c', 
          padding: '10px', 
          textAlign: 'center', 
          gridColumn: '1 / -1',
          backgroundColor: '#fdf0ed',
          borderRadius: '4px',
          marginTop: '10px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default ArtisanDashboardCards;
