import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/artisan/ArtisanProducts.css';

const AddProductForm = ({ onSave, onCancel, loggedInEmployeeId, productId = '' }) => {
  const [product, setProduct] = useState({
    product_id: productId,
    name: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
    size: '', 
    additional_price: '', 
    images: null,
    customization: {
      size: false,
      chat: false,
    },
    status: 'In Stock',
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
      if (!token) {
        console.error('No token found for artisan');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/inventory/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProduct((prevProduct) => ({
          ...prevProduct,
          product_id: data.product_id,
          name: data.product_name,
          description: data.description,
          category: data.category?.category_name || '',
          price: data.unit_price,
          status: data.product_status,
        }));
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
        setProduct((prevProduct) => ({
          ...prevProduct,
          product_id: data.product_id,
          name: data.product_name,
          description: data.description,
          category: data.category?.category_name || '',
          price: data.unit_price,
          customization: {
            ...prevProduct.customization,
            size: data.customization_available,
          },
          status: data.product_status,
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
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));

    if (name === 'product_id' && value) {
      fetchProductDetails(value);
    }
  };

  const handleNameChange = (e) => {
    const { value } = e.target;
    setProduct((prevProduct) => ({
      ...prevProduct,
      name: value,
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

  const handleImageChange = (e) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      images: e.target.files,
    }));
  };

  const handleAdditionalPriceToggle = () => {
    setShowAdditionalPrice((prev) => !prev);
    if (!showAdditionalPrice) {
      setProduct((prevProduct) => ({
        ...prevProduct,
        additional_price: '', 
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!product.product_id) newErrors.product_id = 'Product ID is required';
    if (!product.name) newErrors.name = 'Product Name is required';
    if (!product.category) newErrors.category = 'Category is required';
    if (!product.price || isNaN(product.price)) newErrors.price = 'Valid Unit Price is required';
    if (!product.quantity || isNaN(product.quantity)) newErrors.quantity = 'Valid Stock Quantity is required';
    if (!product.description) newErrors.description = 'Product Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const productWithUploader = {
        ...product,
        product_name: product.name,
        e_id: loggedInEmployeeId, 
        size: product.category === 'Clothing' && product.size ? product.size : null, 
        price: parseFloat(product.price),
        additional_price: showAdditionalPrice ? parseFloat(product.additional_price || 0) : 0, 
        customization_available: showAdditionalPrice,
        status: 'pending',
      };

      console.log('Submitting product with e_id:', loggedInEmployeeId); 
      onSave(productWithUploader);
    }
  };

  return (
    <div className="container mt-4 d-flex flex-column" style={{ height: '100vh' }}>
      <div className="card p-4 mb-3 flex-grow-1" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <h4 className="mb-4">Add New Product</h4>
        <form onSubmit={handleSubmit} className="d-flex flex-column h-100">
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="product_id" className="form-label">Product ID</label>
              <input
                type="text"
                className={`form-control ${errors.product_id ? 'is-invalid' : ''}`}
                id="product_id"
                name="product_id"
                value={product.product_id}
                onChange={handleChange}
              />
              {errors.product_id && <div className="invalid-feedback">{errors.product_id}</div>}
            </div>
            <div className="col-md-4">
              <label htmlFor="name" className="form-label">Product Name</label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                id="name"
                name="name"
                value={product.name}
                onChange={handleNameChange}
                onBlur={() => fetchProductDetailsByName(product.name)} 
                list="productSuggestions"
                required
              />
              <datalist id="productSuggestions">
                {suggestions.map((suggestion) => (
                  <option key={suggestion.product_id} value={suggestion.product_name}>
                    {suggestion.product_name}
                  </option>
                ))}
              </datalist>
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>
            <div className="col-md-4">
              <label htmlFor="category" className="form-label">Category</label>
              <select
                className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                id="category"
                name="category"
                value={product.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="Accessories">Accessories</option>
                <option value="Carry Goods">Carry Goods</option>
                <option value="Clothing">Clothing</option>
                <option value="Crafts">Crafts</option>
                <option value="Artistry">Artistry</option>
              </select>
              {errors.category && <div className="invalid-feedback">{errors.category}</div>}
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="description" className="form-label">Description</label>
              <input
                type="text"
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                id="description"
                name="description"
                value={product.description}
                onChange={handleChange}
                required
              />
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            </div>
            <div className="col-md-4">
              <label htmlFor="size" className="form-label">Size</label>
              <select
                className="form-select"
                id="size"
                name="size"
                value={product.size}
                onChange={handleChange}
                disabled={product.category !== 'Clothing'} 
              >
                <option value="">Select Size</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="unitPrice" className="form-label">Unit Price</label>
              <input
                type="text"
                className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                id="unitPrice"
                name="price"
                value={product.price}
                onChange={handleChange}
                required
              />
              {errors.price && <div className="invalid-feedback">{errors.price}</div>}
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="quantity" className="form-label">Stock Quantity</label>
              <input
                type="number"
                className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                id="quantity"
                name="quantity"
                value={product.quantity}
                onChange={handleChange}
                required
              />
              {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
            </div>
            <div className="col-md-4">
              <label htmlFor="images" className="form-label">Product Images</label>
              <input
                type="file"
                className="form-control"
                id="images"
                name="images"
                onChange={handleImageChange}
                multiple
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="status" className="form-label">Product Status</label>
              <select
                className="form-select"
                id="status"
                name="status"
                value={product.status}
                onChange={handleChange}
              >
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>
          <div className="row mb-3 align-items-center">
            <div className="col-md-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="customizationCheckbox"
                  checked={showAdditionalPrice}
                  onChange={handleAdditionalPriceToggle}
                />
                <label className="form-check-label" htmlFor="customizationCheckbox">
                  Customization
                </label>
              </div>
            </div>
            {showAdditionalPrice && (
              <div className="col-md-4">
                <label htmlFor="additional_price" className="form-label">Enter Customization Price</label>
                <input
                  type="number"
                  className="form-control"
                  id="additional_price"
                  name="additional_price"
                  value={product.additional_price}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>
          <div className="d-flex justify-content-between mt-auto">
            <button type="submit" className="btn btn-success me-2">Save</button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;
