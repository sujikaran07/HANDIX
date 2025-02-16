import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageProducts from '../../components/ManageProducts';
import AddProductForm from '../../components/AddProductForm';
import '../../styles/admin/AdminEmployee.css';

const AdminManageProductsPage = () => {
  const [showAddProductForm, setShowAddProductForm] = useState(false);

  const handleAddProductClick = () => {
    setShowAddProductForm(true);
  };

  const handleCancel = () => {
    setShowAddProductForm(false);
  };

  const handleSave = (newProduct) => {
    // Implement save functionality here
    setShowAddProductForm(false);
  };

  return (
    <div className="admin-employee-page">
      <AdminSidebar />
      <div className="main-content">
        <AdminTopbar />
        {showAddProductForm ? (
          <AddProductForm onSave={handleSave} onCancel={handleCancel} />
        ) : (
          <ManageProducts onAddProductClick={handleAddProductClick} />
        )}
      </div>
    </div>
  );
};

export default AdminManageProductsPage;
