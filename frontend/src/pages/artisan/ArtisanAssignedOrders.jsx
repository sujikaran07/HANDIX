import React, { useState, useEffect } from 'react';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import ArtisanManageOrders from '../../components/artisan/ArtisanManageOrders';
import OrderViewForm from '../../components/artisan/OrderViewForm';
import OrderUpdateForm from '../../components/artisan/OrderUpdateForm';
import '../../styles/artisan/ArtisanOrders.css';

const ArtisanAssignedOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showUpdateOrderForm, setShowUpdateOrderForm] = useState(false);
  const [loggedInArtisan, setLoggedInArtisan] = useState(null);

  useEffect(() => {
    const fetchLoggedInArtisan = async () => {
      try {
        const token = localStorage.getItem('artisanToken');
        if (!token) {
          console.error('No token found for artisan');
          return;
        }

        const response = await fetch('http://localhost:5000/api/login/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched logged-in employee data:', data);
          
          // Save the artisan's full details to match what's in the Order table
          const artisanInfo = {
            id: data.eId,
            name: `${data.firstName} ${data.lastName}`.trim(),
          };
          console.log('Artisan info for orders lookup:', artisanInfo);
          setLoggedInArtisan(artisanInfo);
        } else {
          console.error('Failed to fetch logged-in artisan data');
        }
      } catch (error) {
        console.error('Error fetching logged-in artisan data:', error);
      }
    };

    fetchLoggedInArtisan();
  }, []);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleUpdateOrder = (order) => {
    setSelectedOrder(order);
    setShowUpdateOrderForm(true);
  };

  const handleBackToOrders = () => {
    setShowOrderDetails(false);
    setShowUpdateOrderForm(false);
    setSelectedOrder(null);
  };

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
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error('Failed to update order status:', errorData);
        alert(`Failed to update order status: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('An error occurred while updating the order status.');
    }
  };

  return (
    <div className="artisan-orders-page">
      <ArtisanSidebar />
      <div className="artisan-main-content">
        <ArtisanTopBar />
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
