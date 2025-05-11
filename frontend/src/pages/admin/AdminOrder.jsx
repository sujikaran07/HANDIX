import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageOrders from '../../components/ManageOrder';
import OrderViewForm from '../../components/OrderViewForm';
import AssignArtisanModal from '../../components/AssignArtisanModal';
import '../../styles/admin/AdminOrder.css';

const AdminManageOrderPage = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAssignArtisanModal, setShowAssignArtisanModal] = useState(false);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null);

  const handleViewOrder = (order, action) => {
    // For customized orders with assigned artisans, ensure they show with Review status
    if (order.customized === 'Yes' && order.assignedArtisan && order.assignedArtisan !== 'Not Assigned') {
      order.status = 'Review';
    }
    
    setSelectedOrder(order);
    
    if (action === 'assign') {
      setShowAssignArtisanModal(true);
      setSelectedOrderForAssign(order);
    }
  };

  const handleBackToOrders = () => {
    setSelectedOrder(null);
    setShowAssignArtisanModal(false);
    setSelectedOrderForAssign(null);
  };
  
  const handleAssignSuccess = () => {
    // After successfully assigning an artisan, go back to orders list
    handleBackToOrders();
  };

  return (
    <div className="admin-order-page">
      <AdminSidebar />
      <div className="main-content">
        <AdminTopbar />
        {showAssignArtisanModal && selectedOrderForAssign ? (
          <AssignArtisanModal 
            show={showAssignArtisanModal}
            handleClose={handleBackToOrders}
            orderId={selectedOrderForAssign.id}
            onAssignSuccess={handleAssignSuccess}
            orderData={selectedOrderForAssign} // Pass the full order data
          />
        ) : selectedOrder ? (
          <OrderViewForm order={selectedOrder} onBack={handleBackToOrders} />
        ) : (
          <ManageOrders onViewOrder={handleViewOrder} />
        )}
      </div>
    </div>
  );
};

export default AdminManageOrderPage;
