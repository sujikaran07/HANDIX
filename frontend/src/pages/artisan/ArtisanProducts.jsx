import React, { useState, useEffect } from 'react';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import ArtisanManageProducts from '../../components/artisan/ArtisanManageProducts';
import AddProductForm from '../../components/artisan/AddProductForm';
import ProductViewForm from '../../components/artisan/ProductViewForm';
import EditProductForm from '../../components/artisan/EditProductForm';
import '../../styles/artisan/ArtisanProducts.css';

const ArtisanProductsPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [loggedInEmployeeId, setLoggedInEmployeeId] = useState(null);
  const [newProductId, setNewProductId] = useState('');
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showEditProductForm, setShowEditProductForm] = useState(false);

  useEffect(() => {
    const fetchLoggedInEmployeeId = async () => {
      try {
        const token = localStorage.getItem('artisanToken');
        if (!token) {
          return;
        }

        const response = await fetch('http://localhost:5000/api/login/current-user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setLoggedInEmployeeId(data.eId);
        }
      } catch (error) {}
    };

    fetchLoggedInEmployeeId();
  }, []);

  const handleViewProduct = async (product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditProductForm(true);
  };

  const handleBackToProducts = () => {
    setShowProductDetails(false);
    setShowEditProductForm(false);
    setSelectedProduct(null);
  };

  const handleAddProductClick = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products/new-id');
      if (response.ok) {
        const data = await response.json();
        setNewProductId(data.product_id);
        setShowAddProductForm(true);
      }
    } catch (error) {}
  };

  const handleCancel = () => {
    setShowAddProductForm(false);
  };

  const handleSave = async (newProduct) => {
    try {
      const token = localStorage.getItem('artisanToken');
      if (!token) {
        return;
      }

      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        setShowAddProductForm(false);
        window.location.reload();
      }
    } catch (error) {}
  };

  const handleUpdateProduct = async (updatedProduct) => {
    try {
      const token = localStorage.getItem('artisanToken');
      if (!token) return;

      await fetch(`http://localhost:5000/api/products/${updatedProduct.product_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProduct),
      });

      setShowEditProductForm(false);
      setSelectedProduct(null);
      window.location.reload();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <div className="artisan-products-page">
      <ArtisanSidebar />
      <div className="artisan-main-content">
        <ArtisanTopBar />
        {showProductDetails ? (
          <ProductViewForm product={selectedProduct} onBack={handleBackToProducts} />
        ) : showEditProductForm ? (
          <EditProductForm product={selectedProduct} onSave={handleUpdateProduct} onCancel={handleBackToProducts} />
        ) : showAddProductForm ? (
          <AddProductForm
            onSave={handleSave}
            onCancel={handleCancel}
            loggedInEmployeeId={loggedInEmployeeId}
            productId={newProductId}
          />
        ) : (
          <ArtisanManageProducts
            onViewProduct={handleViewProduct}
            onEditProduct={handleEditProduct}
            onAddProductClick={handleAddProductClick}
          />
        )}
      </div>
    </div>
  );
};

export default ArtisanProductsPage;
