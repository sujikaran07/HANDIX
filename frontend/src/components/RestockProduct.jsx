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
  const [isAssigned, setIsAssigned] = useState(false);
  const [assignedArtisan, setAssignedArtisan] = useState(null);
  
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
    
    // Check if this product already has a pending restock assignment
    const checkExistingAssignments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`http://localhost:5000/api/inventory/${product.product_id}/restock-orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.orders && data.orders.length > 0) {
            // Find the most recent pending or assigned order
            const pendingOrder = data.orders.find(order => 
              order.status === 'Assigned' || order.status === 'Pending'
            );
            
            if (pendingOrder) {
              setIsAssigned(true);
              setAssignedArtisan({
                id: pendingOrder.artisan_id,
                name: pendingOrder.artisan_name || 'Unknown Artisan'
              });
              setQuantity(pendingOrder.quantity);
              setDueDate(new Date(pendingOrder.due_date).toISOString().split('T')[0]);
              setNotes(pendingOrder.notes || '');
              setArtisan(pendingOrder.artisan_id);
            }
          }
        }
      } catch (error) {
        console.error('Error checking existing restock orders:', error);
      }
    };
    
    fetchArtisans();
    fetchProductImages();
    checkExistingAssignments();
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
        console.log('Restock response:', data);
        setIsAssigned(true);
        setAssignedArtisan(artisans.find(a => a.id === artisan));
        
        // Call onRestock with the restock data
        onRestock({
          product_id: product.product_id,
          quantity: quantity,
          artisan: artisan,
          dueDate: dueDate,
          notes: notes,
          requestId: data.requestId
        });
      } else {
        console.error('Restock failed:', data);
        alert(`Failed to restock: ${data.message || 'Server error'}`);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error restocking product:', error);
      setLoading(false);
      alert('Failed to restock product. Please try again.');
    }
  };

  const handleCancelAssignment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/inventory/${product.product_id}/cancel-restock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setIsAssigned(false);
        setAssignedArtisan(null);
        alert('Restock assignment has been canceled.');
      } else {
        const data = await response.json();
        alert(`Failed to cancel assignment: ${data.message || 'Server error'}`);
      }
    } catch (error) {
      console.error('Error canceling restock:', error);
      alert('Failed to cancel restock assignment. Please try again.');
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
                <h6 className="mb-0">Restock Request</h6>
              </div>
              <div className="card-body">
                {isAssigned && (
                  <div className="alert alert-info mb-2 py-1 small">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Currently assigned to:</strong> {assignedArtisan ? assignedArtisan.name : 'Unknown Artisan'}
                        <br/>
                        <small>This product already has a pending restock request.</small>
                      </div>
                      <button 
                        className="btn btn-sm btn-outline-danger py-1 px-2" 
                        onClick={handleCancelAssignment}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="compact-form">
                  <div className="row mb-1">
                    <div className="col">
                      <label className="form-label small mb-1">Quantity</label>
                      <div className="input-group input-group-sm">
                        <button 
                          className="btn btn-outline-secondary" 
                          type="button" 
                          onClick={decrementQuantity}
                          disabled={isAssigned}
                        >-</button>
                        <input 
                          type="number" 
                          className="form-control text-center" 
                          value={quantity} 
                          onChange={handleQuantityChange}
                          min="1"
                          disabled={isAssigned}
                          style={{height: "32px"}}
                          onFocus={(e) => e.target.select()}
                          inputMode="numeric"
                          pattern="[0-9]*"
                        />
                        <button 
                          className="btn btn-outline-secondary" 
                          type="button" 
                          onClick={incrementQuantity}
                          disabled={isAssigned}
                        >+</button>
                      </div>
                    </div>
                  </div>
                  <div className="row mb-1">
                    <div className="col">
                      <label className="form-label small mb-1">Assign to Artisan</label>
                      <select 
                        className="form-select form-select-sm" 
                        value={artisan} 
                        onChange={(e) => setArtisan(e.target.value)}
                        disabled={isAssigned}
                        required
                        style={{height: "32px"}}
                      >
                        <option value="">Select an artisan</option>
                        {artisans.map((a) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="row mb-1">
                    <div className="col">
                      <label className="form-label small mb-1">Due Date</label>
                      <input 
                        type="date" 
                        className="form-control form-control-sm" 
                        value={dueDate} 
                        onChange={(e) => setDueDate(e.target.value)}
                        min={minDate}
                        disabled={isAssigned}
                        required
                        style={{height: "32px"}}
                        // Add calendar-specific attributes to improve calendar UX
                        onFocus={(e) => e.target.showPicker()}
                      />
                    </div>
                  </div>
                  <div className="row mb-1">
                    <div className="col">
                      <label className="form-label small mb-1">Notes</label>
                      <textarea 
                        className="form-control form-control-sm" 
                        rows="1" 
                        placeholder="Special instructions..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={isAssigned}
                        style={{fontSize: "14px", height: "28px"}}
                      ></textarea>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between mt-2">
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-secondary" 
                      onClick={onBack}
                    >
                      Back
                    </button>
                    
                    {!isAssigned ? (
                      <button 
                        type="submit" 
                        className="btn btn-sm btn-secondary" 
                        style={{ 
                          minWidth: '120px',
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
                    ) : (
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-secondary"
                        disabled
                      >
                        Already Assigned
                      </button>
                    )}
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
