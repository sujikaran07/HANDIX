import React, { useState } from 'react';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import ArtisanManageProducts from '../../components/artisan/ArtisanManageProducts';
import AddProductForm from '../../components/artisan/AddProductForm'; // Import the AddProductForm component
import '../../styles/artisan/ArtisanProducts.css';

const ArtisanProductsPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddProductForm, setShowAddProductForm] = useState(false); // State to manage the Add Product form

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
  };

  const handleAddProductClick = () => {
    setShowAddProductForm(true);
  };

  const handleCancel = () => {
    setShowAddProductForm(false);
  };

  const handleSave = async (newProduct) => {
    try {
      // Save the new product (you can add your API call here)
      console.log('Product saved:', newProduct);
      setShowAddProductForm(false);
      window.location.reload(); // Reload the page to reflect the new product
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  return (
    <div className="artisan-products-page">
      <ArtisanSidebar />
      <div className="artisan-main-content">
        <ArtisanTopBar />
        {showAddProductForm ? (
          <AddProductForm onSave={handleSave} onCancel={handleCancel} />
        ) : selectedProduct ? (
          <ProductDetails product={selectedProduct} onBack={handleBackToProducts} />
        ) : (
          <ArtisanManageProducts onViewProduct={handleViewProduct} onAddProductClick={handleAddProductClick} />
        )}
      </div>
    </div>
  );
};

export default ArtisanProductsPage;
