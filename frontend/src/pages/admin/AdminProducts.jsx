import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageProducts from '../../components/ManageProducts';
import '../../styles/admin/AdminProducts.css';

// Add ProductDetails component
const ProductDetails = ({ product, onBack }) => {
  return (
    <div className="container mt-4">
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Product Details</h2>
          <button className="btn btn-secondary" onClick={onBack}>
            Back to Products
          </button>
        </div>
        
        <div className="row">
          <div className="col-md-6">
            <h5>Basic Information</h5>
            <p><strong>Product ID:</strong> {product.product_id}</p>
            <p><strong>Product Name:</strong> {product.product_name}</p>
            <p><strong>Category:</strong> {product.category?.category_name || 'N/A'}</p>
            <p><strong>Employee ID:</strong> {product.e_id || 'N/A'}</p>
            <p><strong>Status:</strong> <span className={`badge ${product.status.toLowerCase() === 'approved' ? 'bg-success' : product.status.toLowerCase() === 'rejected' ? 'bg-danger' : 'bg-warning'}`}>
              {product.status}
            </span></p>
          </div>
          <div className="col-md-6">
            <h5>Pricing & Inventory</h5>
            <p><strong>Unit Price:</strong> ${product.unit_price}</p>
            <p><strong>Quantity:</strong> {product.quantity}</p>
            <p><strong>Date Added:</strong> {new Date(product.date_added).toLocaleString()}</p>
            <h5 className="mt-3">Description</h5>
            <p>{product.inventory?.description || 'No description available'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

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
