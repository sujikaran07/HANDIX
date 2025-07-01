import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageAssignOrders from '../../components/ManageAssignOrders';
import '../../styles/admin/AdminAssignOrder.css';

// Admin assign order page with add and manage logic
const AdminAssignOrderPage = () => {
  const [showAddAssignOrderForm, setShowAddAssignOrderForm] = useState(false);

  // Show add assign order form
  const handleAddAssignOrderClick = () => {
    setShowAddAssignOrderForm(true);
  };

  // Cancel add assign order form
  const handleCancel = () => {
    setShowAddAssignOrderForm(false);
  };

  // Save new assigned order
  const handleSave = (newOrder) => {
    setShowAddAssignOrderForm(false);
  };

  return (
    <div className="admin-assign-order-page">
      <AdminSidebar />
      <div className="main-content">
        <AdminTopbar />
        {showAddAssignOrderForm ? (
          <AddAssignOrderForm onSave={handleSave} onCancel={handleCancel} />
        ) : (
          <ManageAssignOrders onAddAssignOrderClick={handleAddAssignOrderClick} />
        )}
      </div>
    </div>
  );
};

export default AdminAssignOrderPage;
