import React from 'react';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import ArtisanDashboardCards from '../../components/artisan/ArtisanDashboardCards';
import ArtisanSalesTrendGraph from '../../components/artisan/ArtisanSalesTrendGraph';
import ArtisanProductSalesChart from '../../components/artisan/ArtisanProductSalesChart';
import '../../styles/artisan/ArtisanDashboard.css';

const ArtisanDashboard = () => {
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
