import React, { useState, useEffect } from 'react';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import ArtisanManageOrders from '../../components/artisan/ArtisanManageOrders';
import OrderViewForm from '../../components/artisan/OrderViewForm';
import OrderUpdateForm from '../../components/artisan/OrderUpdateForm';
import '../../styles/artisan/ArtisanOrders.css';

// Artisan orders management page with view and update functionality
const ArtisanAssignedOrders = () => {
  // State management for order views and artisan data
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showUpdateOrderForm, setShowUpdateOrderForm] = useState(false);
  const [loggedInArtisan, setLoggedInArtisan] = useState(null);

  useEffect(() => {
    // Fetch logged-in artisan information
    const fetchLoggedInArtisan = async () => {
      try {
        const token = localStorage.getItem('artisanToken');
        if (!token) {
          return;
        }

        const response = await fetch('http://localhost:5000/api/login/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          // Format artisan information for order filtering
          const artisanInfo = {
            id: data.eId,
            name: `${data.firstName} ${data.lastName}`.trim(),
          };
          setLoggedInArtisan(artisanInfo);
        }
      } catch (error) {
        console.error('Error fetching logged-in artisan data:', error);
      }
    };

    fetchLoggedInArtisan();
  }, []);

  // Handle order detail view
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Handle order status update
  const handleUpdateOrder = (order) => {
    setSelectedOrder(order);
    setShowUpdateOrderForm(true);
  };

  // Return to orders list view
  const handleBackToOrders = () => {
    setShowOrderDetails(false);
    setShowUpdateOrderForm(false);
    setSelectedOrder(null);
  };

  // Submit order status update to server
  const handleOrderStatusUpdate = async (updatedOrder) => {
    try {
      const token = localStorage.getItem('artisanToken');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/orders/${updatedOrder.order_id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: updatedOrder.status,
          notes: updatedOrder.notes
        }),
      });

      if (response.ok) {
        setShowUpdateOrderForm(false);
        setSelectedOrder(null);
        // Refresh to show updated data
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Failed to update order status: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      alert('An error occurred while updating the order status.');
    }
  };

  return (
    <div className="artisan-orders-page">
      <ArtisanSidebar />
      <div className="artisan-main-content">
        <ArtisanTopBar />
        {/* Conditional rendering based on view state */}
        {showOrderDetails ? (
          <OrderViewForm order={selectedOrder} onBack={handleBackToOrders} onUpdate={handleUpdateOrder} />
        ) : showUpdateOrderForm ? (
          <OrderUpdateForm 
            order={selectedOrder} 
            onSave={handleOrderStatusUpdate} 
            onCancel={handleBackToOrders} 
          />
        ) : (
          <ArtisanManageOrders
            onViewOrder={handleViewOrder}
            onUpdateOrder={handleUpdateOrder}
            artisan={loggedInArtisan}
          />
        )}
      </div>
    </div>
  );
};

export default ArtisanAssignedOrders;
