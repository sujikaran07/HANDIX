import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageProducts from '../../components/ManageProducts';
import ProductViewForm from '../../components/ProductViewForm';
import '../../styles/admin/AdminProducts.css';

// Admin products management page with authentication and product viewing
const AdminManageProductsPage = () => {
  const navigate = useNavigate();
  // State management for product views and authentication
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify admin authentication on page load
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken) {
      setIsAuthenticated(false);
      navigate('/login');
      return;
    }
    
    setIsAuthenticated(true);
    setLoading(false);
  }, [navigate]);

  // Handle product view with image fetching
  const handleViewProduct = async (product) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch product images if available
      try {
        const imagesResponse = await fetch(`http://localhost:5000/api/products/${product.product_id}/images`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();

          if (imagesData.images && imagesData.images.length > 0) {
            product.entryImages = imagesData.images;
          }
        }
      } catch (error) {
        // Continue with product data even if images fail to load
      }
      
      setSelectedProduct(product);
      setShowProductDetails(true);
    } catch (error) {
      // Show product with available data on error
      setSelectedProduct(product);
      setShowProductDetails(true);
    }
  };

  // Return to products list view
  const handleBackToProducts = () => {
    setShowProductDetails(false);
    setSelectedProduct(null);
  };
  
  // Loading state while verifying authentication
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Verifying credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="admin-products-page">
      {/* Admin navigation sidebar */}
      <AdminSidebar />
      <div className="main-content">
        {/* Top navigation bar */}
        <AdminTopbar />
        {/* Conditional rendering based on view state */}
        {showProductDetails ? (
          <ProductViewForm 
            product={selectedProduct} 
            onBack={handleBackToProducts} 
          />
        ) : (
          <ManageProducts onViewProduct={handleViewProduct} />
        )}
      </div>
    </div>
  );
};

export default AdminManageProductsPage;
