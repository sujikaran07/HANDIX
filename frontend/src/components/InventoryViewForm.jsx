import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTags, faBoxOpen, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const InventoryViewForm = ({ inventory, onBack }) => {
  const [productImages, setProductImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [productVariation, setProductVariation] = useState(null);
  
  useEffect(() => {
    // Fetch product images
    const fetchProductImages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/products/${inventory.product_id}/images`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.images && data.images.length > 0) {
            console.log(`Fetched ${data.images.length} images for product ${inventory.product_id}`);
            setProductImages(data.images);
          }
        } else {
          console.error('Failed to fetch product images');
        }
      } catch (error) {
        console.error('Error fetching product images:', error);
      }
    };
    
    // Fetch product variations for additional fees
    const fetchProductVariation = async () => {
      try {
        const token = localStorage.getItem('token');
        // Use the correct endpoint for variations
        const response = await fetch(`http://localhost:5000/api/inventory/${inventory.product_id}/variations`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.variations && data.variations.length > 0) {
            console.log(`Fetched variations for product ${inventory.product_id}:`, data.variations);
            setProductVariation(data.variations[0]);  // Get the first variation
          } else {
            // Try the customization fee endpoint as a fallback
            const feeResponse = await fetch(`http://localhost:5000/api/variations/${inventory.product_id}/customization-fee`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (feeResponse.ok) {
              const feeData = await feeResponse.json();
              console.log(`Fetched customization fee for product ${inventory.product_id}:`, feeData);
              if (feeData.fee) {
                setProductVariation({ additional_price: feeData.fee });
              }
            }
          }
        } else {
          console.error('Failed to fetch product variations');
        }
      } catch (error) {
        console.error('Error fetching product variations:', error);
      }
    };
    
    if (inventory && inventory.product_id) {
      fetchProductImages();
      fetchProductVariation();
    }
  }, [inventory]);

  if (!inventory) {
    return <div>No inventory data available</div>;
  }

  // Handle image navigation
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  // Determine stock status based on quantity and product_status
  const getStockStatus = (item) => {
    // If product is disabled, show as "Disabled" regardless of quantity
    if (item.product_status === 'Disabled') {
      return "Disabled";
    }
    
    if (item.quantity === 0) return "Out of Stock";
    if (item.quantity < 10) return "Low Stock";
    return "In Stock";
  };

  // Get the actual quantity to display
  const getDisplayQuantity = (item) => {
    return item.product_status === 'Disabled' ? 0 : item.quantity;
  };

  const stockStatus = getStockStatus(inventory);
  const displayQuantity = getDisplayQuantity(inventory);
  
  // Determine status class based on status
  const getStatusClass = (status) => {
    switch(status) {
      case "In Stock": return 'text-success';
      case "Low Stock": return 'text-warning';
      case "Out of Stock": return 'text-danger';
      case "Disabled": return 'text-secondary';
      default: return '';
    }
  };
  
  const statusClass = getStatusClass(stockStatus);

  return (
    <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Product Details</h5>
          <span className={`badge ${
            stockStatus === "In Stock" ? 'bg-success' : 
            stockStatus === "Low Stock" ? 'bg-warning' : 
            stockStatus === "Disabled" ? 'bg-secondary' :
            'bg-danger'
          }`}>
            {stockStatus}
          </span>
        </div>

        <div className="row g-3">
          {/* Product Info Card */}
          <div className="col-lg-3">
            <div className="card h-100">
              <div className="position-relative">
                {productImages.length > 0 ? (
                  <>
                    <img 
                      src={productImages[currentImageIndex].image_url} 
                      alt={inventory.product_name}
                      className="img-fluid card-img-top" 
                      style={{ 
                        height: '180px',
                        objectFit: 'contain',
                        backgroundColor: '#f8f9fa',
                        padding: '8px'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                      }}
                    />
                    
                    {productImages.length > 1 && (
                      <div className="d-flex justify-content-between position-absolute w-100" style={{ top: '50%' }}>
                        <button 
                          className="btn btn-sm btn-light rounded-circle" 
                          onClick={handlePrevImage}
                          style={{ marginLeft: '10px' }}
                        >
                          &lsaquo;
                        </button>
                        <button 
                          className="btn btn-sm btn-light rounded-circle" 
                          onClick={handleNextImage}
                          style={{ marginRight: '10px' }}
                        >
                          &rsaquo;
                        </button>
                      </div>
                    )}
                    
                    {productImages.length > 1 && (
                      <div className="d-flex justify-content-center mt-2">
                        {productImages.map((_, index) => (
                          <span 
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: index === currentImageIndex ? '#007bff' : '#ccc',
                              display: 'inline-block',
                              margin: '0 3px',
                              cursor: 'pointer'
                            }}
                          ></span>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '180px' }}>
                    <span className="text-muted">No image available</span>
                  </div>
                )}
              </div>
              <div className="card-body text-center">
                <h6 className="card-title mb-2">{inventory.product_name}</h6>
                <p className="text-muted small mb-0">ID: {inventory.product_id}</p>
              </div>
            </div>
          </div>

          <div className="col-lg-9">
            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="card h-100">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">Product Information</h6>
                  </div>
                  <div className="card-body">
                    <div className="info-list small">
                      <div className="d-flex justify-content-between p-1 border-bottom">
                        <span>Category:</span>
                        <span>{inventory.category?.category_name || 'N/A'}</span>
                      </div>
                      <div className="d-flex justify-content-between p-1 border-bottom">
                        <span>Price:</span>
                        <span>LKR {parseFloat(inventory.unit_price || 0).toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between p-1 border-bottom">
                        <span>Quantity:</span>
                        <span className={inventory.product_status === 'Disabled' ? 'text-secondary' : (displayQuantity === 0 ? 'text-danger' : displayQuantity < 10 ? 'text-warning' : '')}>
                          {displayQuantity}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between p-1 border-bottom">
                        <span>Additional Fee:</span>
                        <span>
                          {productVariation && productVariation.additional_price > 0 ? 
                            `LKR ${parseFloat(productVariation.additional_price).toFixed(2)}` : 
                            (inventory.additional_price > 0 ? 
                              `LKR ${parseFloat(inventory.additional_price).toFixed(2)}` : 
                              'LKR 0.00')}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between p-1">
                        <span>Customization:</span>
                        <span>{inventory.customization_available ? 'Available' : 'Not Available'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 mb-3">
                <div className="card h-100">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">Additional Details</h6>
                  </div>
                  <div className="card-body">
                    <div className="info-list small">
                      <div className="d-flex justify-content-between p-1 border-bottom">
                        <span>Last Updated:</span>
                        <span>{new Date(inventory.date_added).toLocaleString()}</span>
                      </div>
                      <div className="d-flex justify-content-between p-1 border-bottom">
                        <span>Status:</span>
                        <span className={statusClass}>{stockStatus}</span>
                      </div>
                      {/* Only show size field if it exists in productVariation */}
                      {productVariation && productVariation.size && (
                        <div className="d-flex justify-content-between p-1 border-bottom">
                          <span>Size:</span>
                          <span>{productVariation.size}</span>
                        </div>
                      )}
                      <div className="d-flex justify-content-between p-1">
                        <span>Product Status:</span>
                        <span className={inventory.product_status === 'Disabled' ? 'text-secondary' : ''}>
                          {inventory.product_status || 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card mt-3">
              <div className="card-header bg-light">
                <h6 className="mb-0">Description</h6>
              </div>
              <div className="card-body">
                <p className="card-text">{inventory.description || 'No description available'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="d-flex justify-content-end mt-3">
          <button className="btn btn-secondary" onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryViewForm;
