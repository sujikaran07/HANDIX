import React from "react";
import "../styles/admin/AdminDashboard.css";

const AdminDashboardCards = () => {
  return (
    <div className="dashboard-cards">
      <div className="card">
        <h4>Expected Earnings</h4>
        <p>$4589.00</p>
        <span className="percentage">+5.5%</span>
      </div>
      <div className="card">
        <h4>Average Daily Sales</h4>
        <p>$2,420.00</p>
        <span className="percentage">-8.9%</span>
      </div>
      <div className="card">
        <h4>New Customers This Month</h4>
        <p>4.5K</p>
        <span className="percentage">+6.2%</span>
      </div>
    </div>
  );
};

export default AdminDashboardCards;
