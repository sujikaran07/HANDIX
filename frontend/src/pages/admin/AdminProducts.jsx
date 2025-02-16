import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageProducts from '../../components/ManageProducts';
import '../../styles/admin/AdminProducts.css';

const AdminManageProductsPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="admin-products-page">
      <AdminSidebar />
      <div className="main-content">
        <AdminTopbar />
        {selectedProduct ? (
          <ProductDetails product={selectedProduct} onBack={handleBackToProducts} />
        ) : (
          <ManageProducts onViewProduct={handleViewProduct} />
        )}
      </div>
    </div>
  );
};

export default AdminManageProductsPage;
