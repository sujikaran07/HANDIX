import React, { useState, useEffect } from 'react';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import ArtisanManageProducts from '../../components/artisan/ArtisanManageProducts';
import AddProductForm from '../../components/artisan/AddProductForm'; // Import the AddProductForm component
import '../../styles/artisan/ArtisanProducts.css';

const ArtisanProductsPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddProductForm, setShowAddProductForm] = useState(false); // State to manage the Add Product form
  const [loggedInEmployeeId, setLoggedInEmployeeId] = useState(null); // Dynamically fetch the logged-in user's ID
  const [newProductId, setNewProductId] = useState(''); // State to store the new product ID

  useEffect(() => {
    const fetchLoggedInEmployeeId = async () => {
      try {
        const token = localStorage.getItem('artisanToken'); // Use artisanToken for artisan role
        if (!token) {
          console.error('No token found for artisan');
          return;
        }

        const response = await fetch('http://localhost:5000/api/login/current-user', {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched logged-in employee ID:', data.eId); // Debugging: Log the fetched eId
          setLoggedInEmployeeId(data.eId); // Ensure this is correctly set
        } else {
          const errorData = await response.json();
          console.error('Failed to fetch logged-in user ID:', errorData);
        }
      } catch (error) {
        console.error('Error fetching logged-in user ID:', error);
      }
    };

    fetchLoggedInEmployeeId();
  }, []);

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
  };

  const handleAddProductClick = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products/new-id'); // Endpoint to generate a new product ID
      if (response.ok) {
        const data = await response.json();
        setNewProductId(data.product_id); // Set the new product ID
        setShowAddProductForm(true); // Show the AddProductForm
      } else {
        console.error('Failed to generate new product ID');
      }
    } catch (error) {
      console.error('Error generating new product ID:', error);
    }
  };

  const handleCancel = () => {
    setShowAddProductForm(false);
  };

  const handleSave = async (newProduct) => {
    try {
      const token = localStorage.getItem('artisanToken'); // Use artisanToken for artisan role
      if (!token) {
        console.error('No token found for artisan');
        return;
      }

      console.log('Sending product to backend:', newProduct); // Debugging: Log the product data
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        console.log('Product saved successfully:', await response.json());
        setShowAddProductForm(false);
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error('Error saving product:', errorData);
      }
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
          <AddProductForm
            onSave={handleSave}
            onCancel={handleCancel}
            loggedInEmployeeId={loggedInEmployeeId} // Pass the logged-in employee's ID
            productId={newProductId} // Pass the new product ID to the form
          />
        ) : selectedProduct ? (
          <ProductDetails product={selectedProduct} onBack={handleBackToProducts} />
        ) : (
          <ArtisanManageProducts
            onViewProduct={handleViewProduct}
            onAddProductClick={handleAddProductClick} // Pass the handler for adding products
          />
        )}
      </div>
    </div>
  );
};

export default ArtisanProductsPage;
