import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import AdminDashboardCards from '../../components/AdminDashboardCards';
import SalesTrendGraph from '../../components/AdminSalesTrendGraph';
import ProductSalesChart from '../../components/AdminProductSalesChart';
import '../../styles/admin/AdminDashboard.css';

const AdminDashboard = () => {
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
          <ProductSalesChart />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
