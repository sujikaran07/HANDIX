import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageInventory from '../../components/ManageInventory';
import RestockProduct from '../../components/RestockProduct';
import InventoryViewForm from '../../components/InventoryViewForm';
import '../../styles/admin/AdminInventory.css';

const AdminManageInventoryPage = () => {
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [currentView, setCurrentView] = useState('inventory'); // 'inventory', 'details', 'restock'

  const handleViewInventory = (inventory) => {
    setSelectedInventory(inventory);
    setCurrentView('details');
  };

  const handleRestockProduct = (inventory) => {
    setSelectedInventory(inventory);
    setCurrentView('restock');
  };

  const handleBackToInventory = () => {
    setSelectedInventory(null);
    setCurrentView('inventory');
  };

  const handleRestockComplete = (restockData) => {
    // Changed success message to indicate request was created, not immediate restock
    alert(`Restock request for ${restockData.quantity} units of product ${restockData.product_id} has been submitted and assigned to artisan.`);
    
    // Return to inventory view
    setCurrentView('inventory');
  };

  return (
    <div className="admin-inventory-page">
      <AdminSidebar />
      <div className="main-content">
        <AdminTopbar />
        {currentView === 'inventory' && (
          <ManageInventory 
            onViewInventory={handleViewInventory} 
            onRestockProduct={handleRestockProduct}
          />
        )}
        {currentView === 'details' && selectedInventory && (
          <InventoryViewForm 
            inventory={selectedInventory} 
            onBack={handleBackToInventory} 
          />
        )}
        {currentView === 'restock' && selectedInventory && (
          <RestockProduct 
            product={selectedInventory}
            onBack={handleBackToInventory}
            onRestock={handleRestockComplete}
          />
        )}
      </div>
    </div>
  );
};

export default AdminManageInventoryPage;
