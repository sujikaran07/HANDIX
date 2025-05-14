import React from "react";
import "../../styles/artisan/ArtisanDashboard.css";

const ArtisanDashboardCards = () => {
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
          120
        </p>
        <span className="artisan-percentage" style={{ 
          color: '#666',
          fontSize: '14px',
          display: 'block',
          marginTop: '5px'
        }}>
          +3.2% Since last month
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
          15
        </p>
        <span className="artisan-percentage" style={{ 
          color: '#666',
          fontSize: '14px',
          display: 'block',
          marginTop: '5px'
        }}>
          -1.5% Since last month
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
          LKR 85,000
        </p>
        <span className="artisan-percentage" style={{ 
          color: '#666',
          fontSize: '14px',
          display: 'block',
          marginTop: '5px'
        }}>
          +4.8% Since last month
        </span>
      </div>
    </div>
  );
};

export default ArtisanDashboardCards;
