import React, { useState, useEffect } from 'react';

const ProductViewForm = ({ product, onBack }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    console.log("Product data in view form:", product);
    if (product.entryImages) {
      console.log("Entry images:", product.entryImages);
    }
  }, [product]);
  
  if (!product) {
    return <div>No product data available</div>;
  }

  const hasImages = product.entryImages && Array.isArray(product.entryImages) && product.entryImages.length > 0;
  
  const handleNextImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === product.entryImages.length - 1 ? 0 : prevIndex + 1
      );
    }
  };
  
  const handlePrevImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? product.entryImages.length - 1 : prevIndex - 1
      );
    }
  };

  return (
    <div className="product-view container">
      <h4 className="mb-4">Product Details</h4>
      
      <div className="row">
        <div className="col-md-4 mb-4">
          {hasImages ? (
            <div className="position-relative">
              <img 
                src={product.entryImages[currentImageIndex].image_url} 
                alt={product.product_name}
                className="img-fluid rounded shadow" 
                style={{ 
                  width: '100%',
                  height: '250px',     
                  objectFit: 'contain', 
                  objectPosition: 'center',
                  backgroundColor: '#f8f9fa',
                  padding: '10px'
                }}
                onError={(e) => {
                  console.error("Image failed to load:", e.target.src);
                  e.target.onerror = null; 
                  e.target.src = 'https://via.placeholder.com/250x250?text=No+Image';
                }}
              />
              
              {product.entryImages.length > 1 && (
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
              
              {product.entryImages.length > 1 && (
                <div className="d-flex justify-content-center mt-2">
                  {product.entryImages.map((_, index) => (
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
            <div className="no-image p-5 border text-center bg-light rounded" style={{ height: '250px' }}>
              <div className="d-flex align-items-center justify-content-center h-100">
                <p className="mb-0 text-muted">No image available</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="col-md-8">
          <div className="row mb-3">
            <div className="col-md-6">
              <strong>Product ID:</strong>
              <p className="bg-light p-2 rounded">{product.product_id || 'N/A'}</p>
            </div>
            <div className="col-md-6">
              <strong>Product Name:</strong>
              <p className="bg-light p-2 rounded">{product.product_name || 'N/A'}</p>
            </div>
          </div>
          
          <div className="row mb-3">
            <div className="col-md-6">
              <strong>Category:</strong>
              <p className="bg-light p-2 rounded">{product.category?.category_name || 'N/A'}</p>
            </div>
            <div className="col-md-6">
              <strong>Status:</strong>
              <p className="bg-light p-2 rounded">{product.product_status || 'N/A'}</p>
            </div>
          </div>
          
          <div className="row mb-3">
            <div className="col-md-6">
              <strong>Price:</strong>
              <p className="bg-light p-2 rounded">${parseFloat(product.unit_price || 0).toFixed(2)}</p>
            </div>
            <div className="col-md-6">
              <strong>Quantity:</strong>
              <p className="bg-light p-2 rounded">{product.quantity || 'N/A'}</p>
            </div>
          </div>
          
          <div className="row mb-3">
            <div className="col-12">
              <strong>Description:</strong>
              <p className="bg-light p-2 rounded">{product.description || 'No description available'}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mb-3">
        <div className="col-md-4">
          <strong>Size:</strong>
          <p className="bg-light p-2 rounded">
            {product.variations && product.variations.length > 0 
              ? product.variations[0].size 
              : 'N/A'}
          </p>
        </div>
        <div className="col-md-4">
          <strong>Additional Price:</strong>
          <p className="bg-light p-2 rounded">
            {product.variations && product.variations.length > 0 && product.variations[0].additional_price > 0
              ? `$${parseFloat(product.variations[0].additional_price).toFixed(2)}`
              : 'N/A'}
          </p>
        </div>
        <div className="col-md-4">
          <strong>Customization Available:</strong>
          <p className="bg-light p-2 rounded">
            {product.customization_available ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
      
      <div className="d-flex justify-content-end mt-4">
        <button className="btn btn-secondary" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
};

export default ProductViewForm;
