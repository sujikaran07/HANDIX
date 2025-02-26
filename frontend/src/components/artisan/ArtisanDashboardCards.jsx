import React from "react";
import "../../styles/artisan/ArtisanDashboard.css";

const ArtisanDashboardCards = () => {
  return (
    <div className="artisan-dashboard-cards">
      <div className="artisan-card">
        <h4>Assigned Orders</h4>
        <p>120</p>
        <span className="artisan-percentage">+3.2%</span>
      </div>
      <div className="artisan-card">
        <h4>Pending Reviews</h4>
        <p>15</p>
        <span className="artisan-percentage">-1.5%</span>
      </div>
      <div className="artisan-card">
        <h4>Performance</h4>
        <p>85%</p>
        <span className="artisan-percentage">+4.8%</span>
      </div>
    </div>
  );
};

export default ArtisanDashboardCards;
