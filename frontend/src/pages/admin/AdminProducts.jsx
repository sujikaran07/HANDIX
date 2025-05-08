import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageProducts from '../../components/ManageProducts';
import ProductViewForm from '../../components/ProductViewForm';
import '../../styles/admin/AdminProducts.css';

const AdminManageProductsPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);

  const handleViewProduct = async (product) => {
    try {
      // Optionally fetch additional product details if needed
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
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
