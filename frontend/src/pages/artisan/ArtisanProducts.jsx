import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import ArtisanManageProducts from '../../components/artisan/ArtisanManageProducts';
import AddProductForm from '../../components/artisan/AddProductForm';
import ProductViewForm from '../../components/artisan/ProductViewForm';
import EditProductForm from '../../components/artisan/EditProductForm';
import '../../styles/artisan/ArtisanProducts.css';

const ArtisanProductsPage = () => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [loggedInEmployeeId, setLoggedInEmployeeId] = useState(null);
  const [newProductId, setNewProductId] = useState('');
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showEditProductForm, setShowEditProductForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if artisan token exists
    const artisanToken = localStorage.getItem('artisanToken');
    console.log('ArtisanProducts - artisanToken check:', artisanToken ? 'Token exists' : 'No token found');
    
    if (!artisanToken) {
      console.warn('No artisan token found, redirecting to login');
      setIsAuthenticated(false);
      navigate('/login');
      return;
    }
    
    setIsAuthenticated(true);
    
    const fetchLoggedInEmployeeId = async () => {
      try {
        if (!artisanToken) {
          console.error('No token found for artisan');
          return;
        }

        const response = await fetch('http://localhost:5000/api/login/me', {
          headers: {
            Authorization: `Bearer ${artisanToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched logged-in employee ID:', data.eId);
          setLoggedInEmployeeId(data.eId); 
        } else if (response.status === 401) {
          console.error('Unauthorized access - token may be expired');
          setIsAuthenticated(false);
          navigate('/login');
          return;
        } else {
          console.error('Failed to fetch logged-in employee ID');
        }
      } catch (error) {
        console.error('Error fetching logged-in employee ID:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoggedInEmployeeId();
  }, [navigate]);

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
      const token = localStorage.getItem('artisanToken'); 
      if (!token) {
        console.error('No token found for artisan');
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/products/new-id', {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNewProductId(data.product_id);
        setShowAddProductForm(true);
      } else if (response.status === 401) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error getting new product ID:', error);
    }
  };

  const handleCancel = () => {
    setShowAddProductForm(false);
  };

  const handleSave = async (newProduct) => {
    try {
      const token = localStorage.getItem('artisanToken');
      if (!token) {
        navigate('/login');
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
      } else if (response.status === 401) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleUpdateProduct = async (updatedProduct) => {
    try {
      const token = localStorage.getItem('artisanToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/products/${updatedProduct.product_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProduct),
      });

      if (response.ok) {
        setShowEditProductForm(false);
        setSelectedProduct(null);
        window.location.reload();
      } else if (response.status === 401) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
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
