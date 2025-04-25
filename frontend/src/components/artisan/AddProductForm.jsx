import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/artisan/ArtisanProducts.css';

const AddProductForm = ({ onSave, onCancel, loggedInEmployeeId, productId = '' }) => {
  const [formData, setFormData] = useState({
    product_id: productId,
    product_name: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
    size: 'N/A',
    additional_price: '', 
    images: null,
    customization_available: 'No',
    product_status: 'In Stock',
  });

  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showAdditionalPrice, setShowAdditionalPrice] = useState(false); 

  const fetchProductSuggestions = async (name) => {
    try {
      const token = localStorage.getItem('artisanToken');
      if (!token) {
        console.error('No token found for artisan');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/products/suggestions?search=${name}`, { 
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched product suggestions:', data); 
        setSuggestions(data.products || []);
      } else {
        console.error('Failed to fetch product suggestions:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching product suggestions:', error);
    }
  };

  const fetchProductDetails = async (productId) => {
    try {
      const token = localStorage.getItem('artisanToken'); 
      if (!token || !productId) {
        console.error('No token found for artisan or product ID is empty');
        return;
      }

      console.log('Fetching product details for ID:', productId);
      
      const response = await fetch(`http://localhost:5000/api/inventory/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
      if (response.ok) {
        const data = await response.json();
        const originalQuantity = formData.quantity;
        
        setFormData((prevProduct) => ({
          ...prevProduct,
          product_id: data.product_id,
          product_name: data.product_name,
          description: data.description,
          category: data.category?.category_name || '',
          price: data.unit_price,
          quantity: originalQuantity, 
          product_status: data.product_status,
          customization_available: data.customization_available ? 'Yes' : 'No',
          size: data.size || 'N/A',
          additional_price: data.additional_price || ''
        }));
        
        console.log('Populated form data from existing product');
      } else {
        console.error('Failed to fetch product details:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const fetchProductDetailsByName = async (name) => {
    try {
      console.log('Fetching product details for name:', name); 
      const token = localStorage.getItem('artisanToken');
      if (!token) {
        console.error('No token found for artisan');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/products/by-name?name=${name}`, { 
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched product details by name:', data); 
        setFormData((prevProduct) => ({
          ...prevProduct,
          product_id: data.product_id,
          product_name: data.product_name,
          description: data.description,
          category: data.category?.category_name || '',
          price: data.unit_price,
          customization_available: data.customization_available ? 'Yes' : 'No',
          product_status: data.product_status,
        }));
      } else {
        console.error('Failed to fetch product details by name:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching product details by name:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      if (value !== 'Clothing') {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          size: 'N/A'
        }));
      } 
      if (value !== 'Artistry') {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          customization_available: 'No',
          additional_price: ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } 
    else if (name === 'customization_available' && value === 'No') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        additional_price: ''
      }));
    }
    else {
      setFormData((prevProduct) => ({
        ...prevProduct,
        [name]: value,
      }));
    }

    if (name === 'product_id' && value) {
      fetchProductDetails(value);
    }
  };

  const handleNameChange = (e) => {
    const { value } = e.target;
    setFormData((prevProduct) => ({
      ...prevProduct,
      product_name: value,
    }));

    if (value.length > 1) {
      fetchProductSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (selectedProductName) => {
    const selectedProduct = suggestions.find((product) => product.product_name === selectedProductName);
    if (selectedProduct) {
      fetchProductDetailsByName(selectedProduct.product_name);
      setSuggestions([]);
    }
  };

  const [images, setImages] = useState([]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setImages(prevImages => [...prevImages, ...newImageUrls]);
    
    console.log("Images to upload:", newImageUrls);
  };

  const handleAdditionalPriceToggle = () => {
    setShowAdditionalPrice((prev) => !prev);
    if (!showAdditionalPrice) {
      setFormData((prevProduct) => ({
        ...prevProduct,
        additional_price: '', 
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.product_id) newErrors.product_id = 'Product ID is required';
    if (!formData.product_name) newErrors.product_name = 'Product Name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price || isNaN(formData.price)) newErrors.price = 'Valid Unit Price is required';
    if (!formData.quantity || isNaN(formData.quantity)) newErrors.quantity = 'Valid Stock Quantity is required';
    if (!formData.description) newErrors.description = 'Product Description is required';
    
    if (formData.category === 'Clothing' && formData.size === 'N/A') 
      newErrors.size = 'Size is required for Clothing items';
    if (formData.category === 'Artistry' && formData.customization_available === 'Yes' && 
      (!formData.additional_price || isNaN(formData.additional_price))) 
      newErrors.additional_price = 'Additional Price is required for customized products';
    
    if (images.length === 0) newErrors.images = 'At least one product image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const productData = {
        ...formData,
        e_id: loggedInEmployeeId, 
        size: formData.category === 'Clothing' && formData.size !== 'N/A' ? formData.size : null, 
        price: parseFloat(formData.price),
        additional_price: formData.customization_available === 'Yes' ? parseFloat(formData.additional_price || 0) : 0, 
        customization_available: formData.customization_available, 
        status: 'pending',
        images: images
      };

      console.log('Submitting product with e_id:', loggedInEmployeeId); 
      onSave(productData);
    }
  };

  const removeImage = (index) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const handleProductIdBlur = (e) => {
    const productId = e.target.value.trim();
    if (productId) {
      fetchProductDetails(productId);
    }
  };

  return (
    <div className="container mt-4 d-flex flex-column" style={{ height: '100vh' }}>
      <div className="card p-4 mb-3 flex-grow-1" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <h4 className="mb-4">Add New Product</h4>
        <form onSubmit={handleSubmit} className="d-flex flex-column h-100">
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Product ID<span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                onBlur={handleProductIdBlur}
                required
              />
              {errors.product_id && <div className="text-danger small">{errors.product_id}</div>}
            </div>
            <div className="col-md-4">
              <label className="form-label">Product Name<span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                required
              />
              {errors.product_name && <div className="text-danger small">{errors.product_name}</div>}
            </div>
            <div className="col-md-4">
              <label className="form-label">Category<span className="text-danger">*</span></label>
              <select
                className="form-select"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="Carry Goods">Carry Goods</option>
                <option value="Accessories">Accessories</option>
                <option value="Clothing">Clothing</option>
                <option value="Crafts">Crafts</option>
                <option value="Artistry">Artistry</option>
              </select>
              {errors.category && <div className="text-danger small">{errors.category}</div>}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Description<span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Product description"
                required
              />
              {errors.description && <div className="text-danger small">{errors.description}</div>}
            </div>
            <div className="col-md-4">
              <label className="form-label">Price<span className="text-danger">*</span></label>
              <input
                type="number"
                className="form-control"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
              {errors.price && <div className="text-danger small">{errors.price}</div>}
            </div>
            <div className="col-md-4">
              <label className="form-label">Stock Quantity<span className="text-danger">*</span></label>
              <input
                type="number"
                className="form-control"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                required
              />
              {errors.quantity && <div className="text-danger small">{errors.quantity}</div>}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">
                Size {formData.category === 'Clothing' && <span className="text-danger">*</span>}
              </label>
              <select
                className="form-select"
                name="size"
                value={formData.size}
                onChange={handleChange}
                disabled={formData.category !== 'Clothing'}
                required={formData.category === 'Clothing'}
              >
                <option value="N/A">Select Size</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
              {errors.size && <div className="text-danger small">{errors.size}</div>}
            </div>
            <div className="col-md-4">
              <label className="form-label">Product Images<span className="text-danger">*</span></label>
              <input 
                type="file" 
                className="form-control" 
                multiple 
                onChange={handleImageUpload} 
                required
              />
              {errors.images && <div className="text-danger small">{errors.images}</div>}
              {images.length > 0 && (
                <div className="mt-2 text-success small">
                  {images.length} image{images.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label">Product Status<span className="text-danger">*</span></label>
              <select
                className="form-select"
                name="product_status"
                value={formData.product_status}
                onChange={handleChange}
                required
              >
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
              {errors.product_status && <div className="text-danger small">{errors.product_status}</div>}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Customization Available</label>
              <select
                className="form-select"
                name="customization_available"
                value={formData.customization_available}
                onChange={handleChange}
                disabled={formData.category !== 'Artistry'}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Additional Price
                {formData.category === 'Artistry' && formData.customization_available === 'Yes' && 
                  <span className="text-danger">*</span>}
              </label>
              <input
                type="number"
                className="form-control"
                name="additional_price"
                value={formData.additional_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                disabled={formData.customization_available !== 'Yes' || formData.category !== 'Artistry'}
                required={formData.customization_available === 'Yes' && formData.category === 'Artistry'}
              />
              {errors.additional_price && <div className="text-danger small">{errors.additional_price}</div>}
            </div>
            <div className="col-md-4">
            </div>
          </div>

          <div className="d-flex justify-content-end mt-4">
            <button type="button" className="btn btn-secondary me-2" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;
