import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageAssignOrders from '../../components/ManageAssignOrders';
import '../../styles/admin/AdminAssignOrder.css';

const AdminAssignOrderPage = () => {
  const [showAddAssignOrderForm, setShowAddAssignOrderForm] = useState(false);

  const handleAddAssignOrderClick = () => {
    setShowAddAssignOrderForm(true);
  };

  const handleCancel = () => {
    setShowAddAssignOrderForm(false);
  };

  const handleSave = (newOrder) => {
    // Implement save functionality here
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
