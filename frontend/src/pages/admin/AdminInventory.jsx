import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageInventory from '../../components/ManageInventory';
import '../../styles/admin/AdminInventory.css';

const AdminManageInventoryPage = () => {
  const [selectedInventory, setSelectedInventory] = useState(null);

  const handleViewInventory = (inventory) => {
    setSelectedInventory(inventory);
  };

  const handleBackToInventory = () => {
    setSelectedInventory(null);
  };

  return (
    <div className="admin-inventory-page">
      <AdminSidebar />
      <div className="main-content">
        <AdminTopbar />
        {selectedInventory ? (
          <InventoryDetails inventory={selectedInventory} onBack={handleBackToInventory} />
        ) : (
          <ManageInventory onViewInventory={handleViewInventory} />
        )}
      </div>
    </div>
  );
};

export default AdminManageInventoryPage;
