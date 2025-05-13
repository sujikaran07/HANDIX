import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageProducts from '../../components/ManageProducts';
import ProductViewForm from '../../components/ProductViewForm';
import '../../styles/admin/AdminProducts.css';

const AdminManageProductsPage = () => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin token exists
    const adminToken = localStorage.getItem('adminToken');
    console.log('AdminProducts - adminToken check:', adminToken ? 'Token exists' : 'No token found');
    
    if (!adminToken) {
      console.warn('No admin token found, redirecting to login');
      setIsAuthenticated(false);
      navigate('/login');
      return;
    }
    
    setIsAuthenticated(true);
    setLoading(false);
  }, [navigate]);

  const handleViewProduct = async (product) => {
    try {
      // Optionally fetch additional product details if needed
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('No token found');
        navigate('/login');
        return;
      }

      // Try to fetch images if available
      try {
        const imagesResponse = await fetch(`http://localhost:5000/api/products/${product.product_id}/images`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();
          console.log("Images data fetched:", imagesData);

          if (imagesData.images && imagesData.images.length > 0) {
            product.entryImages = imagesData.images;
          }
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }
      
      setSelectedProduct(product);
      setShowProductDetails(true);
    } catch (error) {
      console.error('Error in view product:', error);
      // Still show the product with available data
      setSelectedProduct(product);
      setShowProductDetails(true);
    }
  };

  const handleBackToProducts = () => {
    setShowProductDetails(false);
    setSelectedProduct(null);
  };
  
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
      <AdminSidebar />
      <div className="main-content">
        <AdminTopbar />
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
