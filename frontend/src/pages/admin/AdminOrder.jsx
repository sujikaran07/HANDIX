import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageOrders from '../../components/ManageOrder';
import OrderDetails from '../../components/OrderDetails';
import '../../styles/admin/AdminOrder.css';

const AdminManageOrderPage = () => {
  const [showAddOrderForm, setShowAddOrderForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleBackToOrders = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="admin-order-page">
      <AdminSidebar />
      <div className="main-content">
        <AdminTopbar />
        {selectedOrder ? (
          <OrderDetails order={selectedOrder} onBack={handleBackToOrders} />
        ) : (
          <ManageOrders onAddOrderClick={handleAddOrderClick} onViewOrder={handleViewOrder} />
        )}
      </div>
    </div>
  );
};

export default AdminManageOrderPage;
