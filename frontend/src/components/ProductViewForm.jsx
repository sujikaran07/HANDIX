import React, { useState, useEffect } from 'react';

// Component for displaying detailed product information with image carousel
const ProductViewForm = ({ product, onBack }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Reset image index when product changes
    setCurrentImageIndex(0);
  }, [product]);
  
  if (!product) {
    return <div>No product data available</div>;
  }

  // Get images from various possible sources in product object
  const images = (product.entryImages || 
    (product.inventory && product.inventory.images) || 
    []);
  
  const hasImages = images && Array.isArray(images) && images.length > 0;
  
  // Image carousel navigation functions
  const handleNextImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };
  
  const handlePrevImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    }
  };

  // Format date for user-friendly display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge styling based on approval status
  const getStatusClass = (status) => {
    if (!status) return '';
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('approved')) return 'bg-success';
    if (statusLower.includes('rejected')) return 'bg-danger';
    if (statusLower.includes('pending')) return 'bg-warning text-dark';
    return 'bg-secondary';
  };

  // Get text color based on status
  const getStatusTextClass = (status) => {
    if (!status) return 'text-muted';
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('approved')) return 'text-success';
    if (statusLower.includes('rejected')) return 'text-danger';
    if (statusLower.includes('pending')) return 'text-warning';
    return 'text-secondary';
  };

  return (
    <div className="container mt-4" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <div className="card" style={{ 
        borderRadius: '16px', 
        overflow: 'hidden', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="card-body p-4 d-flex flex-column">
          {/* Header section */}
          <div className="mb-3">
            <h5 className="mb-0">Product Details</h5>
          </div>

          <div className="row flex-grow-1">
            {/* Image carousel section */}
            <div className="col-md-4 mb-3">
              {hasImages ? (
                <div className="position-relative">
                  <img 
                    src={images[currentImageIndex].image_url || images[currentImageIndex].url} 
                    alt={product.product_name}
                    className="img-fluid rounded shadow" 
                    style={{ 
                      width: '100%',
                      height: '220px',     
                      objectFit: 'contain', 
                      objectPosition: 'center',
                      backgroundColor: '#f8f9fa',
                      padding: '8px'
                    }}
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = 'https://via.placeholder.com/250x250?text=No+Image';
                    }}
                  />
                  
                  {/* Navigation buttons for multiple images */}
                  {images.length > 1 && (
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
                  
                  {/* Image indicators */}
                  {images.length > 1 && (
                    <div className="d-flex justify-content-center mt-2">
                      {images.map((_, index) => (
                        <span 
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: index === currentImageIndex ? '#007bff' : '#ccc',
                            display: 'inline-block',
                            margin: '0 5px',
                            cursor: 'pointer'
                          }}
                        ></span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-image p-4 border text-center bg-light rounded" style={{ height: '220px' }}>
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <p className="mb-0 text-muted">No image available</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Product information section */}
            <div className="col-md-8 d-flex flex-column">
              {/* Product ID and Name */}
              <div className="row g-2 flex-grow-1">
                <div className="col-md-6">
                  <label>Product ID:</label>
                  <div className="bg-light p-2 rounded text-dark" style={{height: "36px", lineHeight: "22px", paddingLeft: "12px"}}>
                    {product.product_id || 'N/A'}
                  </div>
                </div>
                <div className="col-md-6">
                  <label>Product Name:</label>
                  <div className="bg-light p-2 rounded text-dark" style={{height: "36px", lineHeight: "22px", paddingLeft: "12px"}}>
                    {product.product_name || 'N/A'}
                  </div>
                </div>
              </div>
              
              {/* Category and Status */}
              <div className="row g-2 flex-grow-1">
                <div className="col-md-6">
                  <label>Category:</label>
                  <div className="bg-light p-2 rounded text-dark" style={{height: "36px", lineHeight: "22px", paddingLeft: "12px"}}>
                    {product.category?.category_name || 'N/A'}
                  </div>
                </div>
                <div className="col-md-6">
                  <label>Status:</label>
                  <div className="bg-light p-2 rounded" style={{height: "36px", lineHeight: "22px", paddingLeft: "12px"}}>
                    <span className={getStatusTextClass(product.status)}>
                      {product.status || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Price and Quantity */}
              <div className="row g-2 flex-grow-1">
                <div className="col-md-6">
                  <label>Price:</label>
                  <div className="bg-light p-2 rounded text-dark" style={{height: "36px", lineHeight: "22px", paddingLeft: "12px"}}>
                    LKR {parseFloat(product.unit_price || 0).toFixed(2)}
                  </div>
                </div>
                <div className="col-md-6">
                  <label>Quantity:</label>
                  <div className="bg-light p-2 rounded text-dark" style={{height: "36px", lineHeight: "22px", paddingLeft: "12px"}}>
                    {product.quantity || '0'}
                  </div>
                </div>
              </div>
              
              {/* Employee ID and Date Added */}
              <div className="row g-2 flex-grow-1">
                <div className="col-md-6">
                  <label>Employee ID:</label>
                  <div className="bg-light p-2 rounded text-dark" style={{height: "36px", lineHeight: "22px", paddingLeft: "12px"}}>
                    {product.e_id || 'N/A'}
                  </div>
                </div>
                <div className="col-md-6">
                  <label>Date Added:</label>
                  <div className="bg-light p-2 rounded text-dark" style={{height: "36px", lineHeight: "22px", paddingLeft: "12px"}}>
                    {formatDate(product.date_added)}
                  </div>
                </div>
              </div>
              
              {/* Description with custom scrollbar styling */}
              <div className="row g-2 flex-grow-1">
                <div className="col-12">
                  <label>Description:</label>
                  <div 
                    className="bg-light p-2 rounded text-dark" 
                    style={{
                      height: "60px", 
                      lineHeight: "22px", 
                      paddingLeft: "12px", 
                      overflowY: "auto",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    <style>
                      {`
                        div::-webkit-scrollbar {
                          width: 0;
                          background: transparent;
                        }
                      `}
                    </style>
                    {product.inventory?.description || 'No description available'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Back button */}
          <div className="d-flex justify-content-end mt-3">
            <button className="btn btn-secondary" onClick={onBack}>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductViewForm;
