import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageOrders from '../../components/ManageOrder';
import '../../styles/admin/AdminOrder.css';

const AdminManageOrderPage = () => {
  const [showAddOrderForm, setShowAddOrderForm] = useState(false);

  const handleAddOrderClick = () => {
    setShowAddOrderForm(true);
  };

  const handleCancel = () => {
    setShowAddOrderForm(false);
  };

  const handleSave = (newOrder) => {
    // Implement save functionality here
    setShowAddOrderForm(false);
  };

  return (
    <div className="admin-order-page">
      <AdminSidebar />
      <div className="main-content">
        <AdminTopbar />
        {showAddOrderForm ? (
          <AddOrderForm onSave={handleSave} onCancel={handleCancel} />
        ) : (
          <ManageOrders onAddOrderClick={handleAddOrderClick} />
        )}
      </div>
    </div>
  );
};

export default AdminManageOrderPage;
