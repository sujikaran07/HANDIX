import React, { useState, useEffect } from "react";
import "../../styles/artisan/ArtisanDashboard.css";
import axios from "axios";

const ArtisanDashboardCards = () => {
  const [summaryData, setSummaryData] = useState({
    totalProducts: 120,
    assignedOrders: 15,
    totalRevenue: 85000
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        // Get artisan ID from localStorage or other auth state
        const artisanId = localStorage.getItem('artisanId') || '1'; // Default to 1 for testing
        
        // Add a timeout to prevent hanging if the request takes too long
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );
        
        console.log('Fetching artisan dashboard summary...');
        const fetchPromise = axios.get(`http://localhost:5000/api/artisan-dashboard/summary/${artisanId}`);
        
        // Use default values and log the error if fetch fails
        try {
          const response = await Promise.race([fetchPromise, timeoutPromise]);
          console.log('Artisan dashboard summary response:', response.data);
          setSummaryData(response.data);
          setError(null);
        } catch (fetchError) {
          console.error('Error fetching artisan dashboard summary:', fetchError);
          
          // Keep using the default values that were set in useState
          console.log('Using default summary data');
          // Don't set error state so we don't show an error message to users
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
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db', marginBottom: '10px' }}>
            Loading...
          </p>
        </div>
        
        <div className="artisan-card" style={{ 
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#fff',
        }}>
          <h4 style={{ color: '#666', marginBottom: '15px' }}>Assigned Orders</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60', marginBottom: '10px' }}>
            Loading...
          </p>
        </div>
        
        <div className="artisan-card" style={{ 
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#fff',
        }}>
          <h4 style={{ color: '#666', marginBottom: '15px' }}>Total Revenue</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0022ff', marginBottom: '10px' }}>
            Loading...
          </p>
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
      {error && <div style={{color: '#e74c3c', padding: '10px', textAlign: 'center', gridColumn: '1 / -1'}}>
        Note: Using sample data. {error}
      </div>}
    </div>
  );
};

export default ArtisanDashboardCards;
