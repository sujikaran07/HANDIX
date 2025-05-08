import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faMinusCircle, faBoxOpen, faUserTag, faCalendarAlt, faStickyNote } from '@fortawesome/free-solid-svg-icons';

const RestockProduct = ({ product, onBack, onRestock }) => {
  const [quantity, setQuantity] = useState(1);
  const [artisan, setArtisan] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [artisans, setArtisans] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Minimum date for the due date picker (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    // Fetch artisans
    const fetchArtisans = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/employees', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Filter for artisans only (role ID 2)
          const artisanEmployees = data.filter(employee => 
            employee.roleId === 2 || employee.roleId === '2'
          );
          
          if (artisanEmployees.length > 0) {
            const formattedArtisans = artisanEmployees.map(employee => ({
              id: employee.eId,
              name: `${employee.firstName} ${employee.lastName}`
            }));
            setArtisans(formattedArtisans);
          } else {
            // Fallback to dummy data
            setArtisans([
              { id: 'E002', name: 'John Doe' },
              { id: 'E003', name: 'Jane Smith' },
              { id: 'E004', name: 'Alex Johnson' },
              { id: 'E005', name: 'Maria Garcia' }
            ]);
          }
        } else {
          // Fallback to dummy data
          setArtisans([
            { id: 'E002', name: 'John Doe' },
            { id: 'E003', name: 'Jane Smith' },
            { id: 'E004', name: 'Alex Johnson' },
            { id: 'E005', name: 'Maria Garcia' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching artisans:', error);
        // Fallback to dummy data
        setArtisans([
          { id: 'E002', name: 'John Doe' },
          { id: 'E003', name: 'Jane Smith' },
          { id: 'E004', name: 'Alex Johnson' },
          { id: 'E005', name: 'Maria Garcia' }
        ]);
      }
    };
    
    // Fetch product images
    const fetchProductImages = async () => {
      if (product && product.product_id) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/api/products/${product.product_id}/images`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.images && data.images.length > 0) {
              console.log(`Fetched ${data.images.length} images for product ${product.product_id}`);
              setProductImages(data.images);
            }
          } else {
            console.error('Failed to fetch product images');
          }
        } catch (error) {
          console.error('Error fetching product images:', error);
        }
      }
    };
    
    fetchArtisans();
    fetchProductImages();
  }, [product]);

  // Handle image navigation
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!artisan) {
      alert('Please select an artisan');
      return;
    }
    
    if (!dueDate) {
      alert('Please select a due date');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      // Changed endpoint to create a restock request rather than updating inventory directly
      const response = await fetch(`http://localhost:5000/api/inventory/${product.product_id}/restock-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quantity: parseInt(quantity),
          artisan_id: artisan,
          due_date: dueDate,
          notes: notes
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('Restock request created:', data);
        onRestock({
          product_id: product.product_id,
          quantity: quantity,
          artisan: artisan,
          dueDate: dueDate,
          notes: notes,
          requestId: data.requestId
        });
      } else {
        console.error('Failed to create restock request:', data);
        alert(`Failed to submit restock request: ${data.message || 'Server error'}`);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error creating restock request:', error);
      setLoading(false);
      alert('Failed to submit restock request. Please try again.');
    }
  };

  return (
    <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Request Product Restock</h5>
        </div>

        <div className="row g-3">
          {/* Product Info Card */}
          <div className="col-lg-4">
            <div className="card h-100">
              <div className="card-header bg-light">
                <h6 className="mb-0">Product Information</h6>
              </div>
              <div className="card-body">
                <div className="position-relative mb-3">
                  {productImages.length > 0 ? (
                    <>
                      <img 
                        src={productImages[currentImageIndex].image_url} 
                        alt={product.product_name}
                        className="img-fluid rounded mx-auto d-block" 
                        style={{ 
                          maxHeight: '150px',
                          objectFit: 'contain'
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
                    <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ height: '150px' }}>
                      <span className="text-muted">No image available</span>
                    </div>
                  )}
                </div>

                <h6 className="text-center mb-3">{product.product_name}</h6>
                
                <div className="info-list small">
                  <div className="d-flex justify-content-between p-1 border-bottom">
                    <span>Product ID:</span>
                    <span>{product.product_id}</span>
                  </div>
                  <div className="d-flex justify-content-between p-1 border-bottom">
                    <span>Category:</span>
                    <span>{product.category?.category_name || 'N/A'}</span>
                  </div>
                  <div className="d-flex justify-content-between p-1 border-bottom">
                    <span>Current Stock:</span>
                    <span className={product.quantity === 0 ? 'text-danger' : product.quantity < 10 ? 'text-warning' : ''}>
                      {product.quantity}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between p-1">
                    <span>Price:</span>
                    <span>LKR {parseFloat(product.unit_price || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Restock Form Card */}
          <div className="col-lg-8">
            <div className="card h-100">
              <div className="card-header bg-light">
                <h6 className="mb-0">Restock Details</h6>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="quantity" className="form-label">
                        <FontAwesomeIcon icon={faBoxOpen} className="me-1 text-secondary" />
                        Restock Quantity <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary d-flex align-items-center justify-content-center" 
                          onClick={decrementQuantity}
                          style={{ height: '28px', width: '28px', padding: '0' }}
                        >
                          <FontAwesomeIcon icon={faMinusCircle} />
                        </button>
                        <input
                          type="number"
                          className="form-control text-center"
                          id="quantity"
                          value={quantity}
                          onChange={handleQuantityChange}
                          min="1"
                          required
                          style={{ height: '28px' }}
                        />
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary d-flex align-items-center justify-content-center" 
                          onClick={incrementQuantity}
                          style={{ height: '28px', width: '28px', padding: '0' }}
                        >
                          <FontAwesomeIcon icon={faPlusCircle} />
                        </button>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="dueDate" className="form-label">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1 text-secondary" />
                        Due Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="dueDate"
                        min={minDate}
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                        style={{ height: '38px', cursor: 'pointer' }}
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                      />
                    </div>
                  </div>

                  <div className="mb-3 mt-3">
                    <label htmlFor="artisan" className="form-label">
                      <FontAwesomeIcon icon={faUserTag} className="me-1 text-secondary" />
                      Assign Artisan <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="artisan"
                      value={artisan}
                      onChange={(e) => setArtisan(e.target.value)}
                      required
                      style={{ height: '38px' }}
                    >
                      <option value="">Select an artisan</option>
                      {artisans.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="notes" className="form-label">
                      <FontAwesomeIcon icon={faStickyNote} className="me-1 text-secondary" />
                      Notes / Instructions
                    </label>
                    <textarea
                      className="form-control"
                      id="notes"
                      rows="3"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter any special instructions or notes for the artisan"
                    ></textarea>
                  </div>

                  <div className="mt-4 d-flex justify-content-between">
                    <button 
                      type="button" 
                      className="btn btn-light" 
                      onClick={onBack}
                    >
                      Back
                    </button>
                    
                    <button 
                      type="submit" 
                      className="btn btn-secondary" 
                      style={{ 
                        minWidth: '180px',
                        transition: 'background-color 0.3s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#3e87c3'}
                      onMouseOut={(e) => e.target.style.backgroundColor = ''}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          Processing...
                        </>
                      ) : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestockProduct;
