import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageInventory from '../../components/ManageInventory';
import '../../styles/admin/AdminInventory.css';

// Simple inline InventoryDetails component
const InventoryDetails = ({ inventory, onBack }) => {
  return (
    <div className="container mt-4">
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Inventory Details</h2>
          <button className="btn btn-secondary" onClick={onBack}>
            Back to Inventory
          </button>
        </div>
        
        <div className="row">
          <div className="col-md-6">
            <h5>Basic Information</h5>
            <p><strong>Product ID:</strong> {inventory.product_id}</p>
            <p><strong>Product Name:</strong> {inventory.product_name}</p>
            <p><strong>Category:</strong> {inventory.category?.category_name || 'N/A'}</p>
            <p><strong>Status:</strong> <span className={`badge ${inventory.product_status === 'In Stock' ? 'bg-success' : inventory.product_status === 'Out of Stock' ? 'bg-danger' : 'bg-warning'}`}>
              {inventory.product_status}
            </span></p>
          </div>
          <div className="col-md-6">
            <h5>Stock Information</h5>
            <p><strong>Quantity:</strong> {inventory.quantity}</p>
            <p><strong>Unit Price:</strong> ${inventory.unit_price}</p>
            <p><strong>Last Updated:</strong> {new Date(inventory.date_added).toLocaleString()}</p>
            <h5 className="mt-3">Description</h5>
            <p>{inventory.description || 'No description available'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

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
