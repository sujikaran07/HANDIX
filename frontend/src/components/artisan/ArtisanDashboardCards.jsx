import React, { useState, useEffect } from "react";
import "../../styles/artisan/ArtisanDashboard.css";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';

// Dashboard cards component displaying artisan's key metrics
const ArtisanDashboardCards = () => {
  const [summaryData, setSummaryData] = useState({
    totalProducts: 0,
    totalProductQuantity: 0,
    assignedOrders: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract artisan ID from JWT token
  const getArtisanIdFromToken = () => {
    try {
      const token = localStorage.getItem('artisanToken');
      if (!token) {
        return null;
      }
      
      const decoded = jwtDecode(token);
      return decoded.id;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    // Fetch dashboard summary data for the artisan
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        
        // Get artisan ID from JWT token
        const artisanId = getArtisanIdFromToken();
        
        if (!artisanId) {
          throw new Error('Authentication error. Please log in again.');
        }
        
        // Store artisan ID for other components
        localStorage.setItem('artisanId', artisanId);
        
        // Set authorization header
        const token = localStorage.getItem('artisanToken');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 8000)
        );
        
        const fetchPromise = axios.get(`http://localhost:5000/api/artisan-dashboard/summary/${artisanId}`);
        
        try {
          const response = await Promise.race([fetchPromise, timeoutPromise]);
          
          // Process and format response data
          const productQuantity = Number(response.data.totalProductQuantity) || 0;
            
          const responseData = {
            totalProducts: productQuantity,
            assignedOrders: parseInt(response.data.assignedOrders) || 0,
            completedOrders: parseInt(response.data.completedOrders) || 0
          };
          
          setSummaryData(responseData);
          setError(null);
        } catch (fetchError) {
          // Handle fetch errors with detailed messages
          const errorMessage = fetchError.response ? 
            `Error ${fetchError.response.status}: ${fetchError.response.data?.error || 'Unknown error'}` :
            `Failed to fetch data: ${fetchError.message}`;
          
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  // Loading state display
  if (loading) {
    return (
      <div className="artisan-dashboard-cards" style={{ paddingBottom: '20px', opacity: 0.7 }}>
        <div className="artisan-card" style={{ 
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#fff',
        }}>
          <h4 style={{ color: '#666', marginBottom: '15px' }}>Total Units</h4>
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
          <h4 style={{ color: '#666', marginBottom: '15px' }}>Ongoing Orders</h4>
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
          <h4 style={{ color: '#666', marginBottom: '15px' }}>Completed Orders</h4>
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="artisan-dashboard-cards" style={{ paddingBottom: '20px' }}>
      {/* Total product units card */}
      <div className="artisan-card" style={{ 
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
        transition: 'transform 0.2s',
        cursor: 'pointer'
      }}>
        <h4 style={{ color: '#666', marginBottom: '15px' }}>Total Units</h4>
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
          All product items
        </span>
      </div>

      {/* Ongoing orders card */}
      <div className="artisan-card" style={{ 
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
        transition: 'transform 0.2s',
        cursor: 'pointer'
      }}>
        <h4 style={{ color: '#666', marginBottom: '15px' }}>Ongoing Orders</h4>
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
          Currently Active
        </span>
      </div>

      {/* Completed orders card */}
      <div className="artisan-card" style={{ 
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
        transition: 'transform 0.2s',
        cursor: 'pointer'
      }}>
        <h4 style={{ color: '#666', marginBottom: '15px' }}>Completed Orders</h4>
        <p style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#0022ff',
          marginBottom: '10px'
        }}>
          {summaryData.completedOrders}
        </p>
        <span className="artisan-percentage" style={{ 
          color: '#666',
          fontSize: '14px',
          display: 'block',
          marginTop: '5px'
        }}>
          All Time
        </span>
      </div>

      {/* Error display */}
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
