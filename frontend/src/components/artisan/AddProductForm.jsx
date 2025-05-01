import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/artisan/ArtisanProducts.css';

const AddProductForm = ({ onSave, onCancel, loggedInEmployeeId, productId = '' }) => {
  const navigate = useNavigate(); // Hook for programmatic navigation
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
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const fetchProductSuggestions = async (name) => {
    try {
      const token = localStorage.getItem('artisanToken');
      if (!token) {
        console.error('No token found for artisan');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/products/inventory-suggestions?search=${name}`, { 
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched inventory product suggestions:', data); 
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

      setIsLoading(true);
      setFeedbackMessage(null);
      console.log('Fetching product details for ID:', productId);
      
      setImages([]);
      setExistingImageUrls([]);
      
      let productData = null;
      let fetchSuccess = false;
      
      try {
        const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });
        
        if (response.ok) {
          productData = await response.json();
          fetchSuccess = true;
          console.log('Successfully fetched from products endpoint:', productData);
          
          if (productData.entryImages && productData.entryImages.length > 0) {
            const productImages = productData.entryImages.map(img => img.image_url);
            console.log('Found images in product data:', productImages);
            setImages(productImages);
            setExistingImageUrls(productImages); 
          }
        }
      } catch (error) {
        console.error('Error fetching from products endpoint:', error);
      }
      
      if (!fetchSuccess) {
        try {
          const response = await fetch(`http://localhost:5000/api/inventory/${productId}`, {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          });
          
          if (response.ok) {
            productData = await response.json();
            fetchSuccess = true;
            console.log('Successfully fetched from inventory endpoint:', productData);
          }
        } catch (error) {
          console.error('Error fetching from inventory endpoint:', error);
        }
      }
   
      if (!fetchSuccess) {
        setIsLoading(false);
        setFeedbackMessage({ type: 'error', message: 'Product not found with this ID' });
        return;
      }
      
      
      console.log('Explicitly fetching images for product ID:', productId);
      try {
        const imagesResponse = await fetch(`http://localhost:5000/api/products/${productId}/images`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();
          console.log('Images API response:', imagesData);
          
          if (imagesData.images && imagesData.images.length > 0) {
            const productImages = imagesData.images.map(img => img.image_url);
            console.log('Successfully fetched', productImages.length, 'product images');
            setImages(productImages);
            setExistingImageUrls(productImages); 
          } else {
            console.log('No images found for product ID:', productId);
          }
        } else {
          console.error('Failed to fetch images. Status:', imagesResponse.status);
        }
      } catch (imageError) {
        console.error('Error fetching product images:', imageError);
      }
      
      const originalQuantity = formData.quantity;
      
      setFormData((prevProduct) => ({
        ...prevProduct,
        product_id: productData.product_id,
        product_name: productData.product_name || productData.inventory?.product_name || '',
        description: productData.description || productData.inventory?.description || '',
        category: productData.category?.category_name || '',
        price: productData.unit_price || '',
        quantity: originalQuantity, 
        product_status: productData.product_status || 'In Stock',
        customization_available: productData.customization_available ? 'Yes' : 'No',
        size: (productData.variations && productData.variations.length > 0) ? 
          productData.variations[0].size : 
          (productData.size || 'N/A'),
        additional_price: (productData.variations && productData.variations.length > 0) ? 
          productData.variations[0].additional_price : 
          (productData.additional_price || '')
      }));
      
      setFeedbackMessage({ 
        type: 'success', 
        message: `Product "${productData.product_name}" details loaded successfully!` 
      });
      console.log('Populated form data from existing product');
      
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching product details:', error);
      setFeedbackMessage({ type: 'error', message: 'Error fetching product details' });
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

      setIsLoading(true);
      setImages([]);
      setExistingImageUrls([]);

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
          size: (data.variations && data.variations.length > 0) ? 
            data.variations[0].size : 
            (data.size || 'N/A'),
          additional_price: (data.variations && data.variations.length > 0) ? 
            data.variations[0].additional_price : 
            (data.additional_price || '')
        }));
        
        if (data.product_id) {
          try {
            console.log('Fetching images for product ID:', data.product_id);
            const imagesResponse = await fetch(`http://localhost:5000/api/products/${data.product_id}/images`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            
            if (imagesResponse.ok) {
              const imagesData = await imagesResponse.json();
              console.log('Images API response:', imagesData);
              
              if (imagesData.images && imagesData.images.length > 0) {
                const productImages = imagesData.images.map(img => img.image_url);
                console.log('Successfully fetched', productImages.length, 'product images');
                setImages(productImages);
                setExistingImageUrls(productImages);
              } else {
                console.log('No images found for product ID:', data.product_id);
              }
            }
          } catch (imageError) {
            console.error('Error fetching product images:', imageError);
          }
        }
        
        setFeedbackMessage({ 
          type: 'success', 
          message: `Product "${data.product_name}" details loaded successfully!` 
        });
      } else {
        console.error('Failed to fetch product details by name:', response.statusText);
        setFeedbackMessage({ 
          type: 'error', 
          message: 'Failed to fetch product details' 
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching product details by name:', error);
      setFeedbackMessage({ 
        type: 'error', 
        message: 'Error fetching product details' 
      });
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      if (value !== 'Clothing') {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          size: 'N/A'  // Reset size to N/A when category is not Clothing
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          // Don't reset size when switching to Clothing
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
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [imageFiles, setImageFiles] = useState([]); 
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    console.log("New images to upload:", newImageUrls);
    setImages(prevImages => [...prevImages, ...newImageUrls]);
    setImageFiles(prevFiles => [...prevFiles, ...files]); 
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
    
    if (formData.category === 'Artistry' && formData.customization_available === 'Yes' && 
      (!formData.additional_price || isNaN(formData.additional_price))) 
      newErrors.additional_price = 'Additional Price is required for customized products';
    
    if (images.length === 0) newErrors.images = 'At least one product image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setIsLoading(true);
        
        // Prepare the JSON payload
        const jsonPayload = {
          product_id: formData.product_id,
          product_name: formData.product_name,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity, 10),
          size: formData.size || 'N/A',  // Ensure size is 'N/A' if not selected
          additional_price: formData.additional_price ? parseFloat(formData.additional_price) : 0,
          customization_available: formData.customization_available,
          product_status: formData.product_status,
          e_id: loggedInEmployeeId
        };
        
        console.log('Submitting product with JSON payload:', jsonPayload);
        
        const token = localStorage.getItem('artisanToken');
        if (!token) {
          console.error('No token found');
          alert('Authentication error. Please log in again.');
          return;
        }
        
        // First, create the product using JSON
        const response = await fetch('http://localhost:5000/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(jsonPayload)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create product');
        }
        
        const productData = await response.json();
        console.log('Product created successfully:', productData);
        
        // Enhanced image upload to Cloudinary
        const uploadImages = async (productId, entryId) => {
          try {
            const token = localStorage.getItem('artisanToken');
            console.log(`Starting image upload for product ${productId}, entry ${entryId}`);
            console.log(`Total images to upload: ${imageFiles.length}`);
            
            // Create FormData for Cloudinary upload
            const formData = new FormData();
            
            // Add product and entry IDs
            formData.append('product_id', productId);
            formData.append('entry_id', entryId);
            
            // Add all image files
            imageFiles.forEach((file) => {
              formData.append('productImages', file);
              console.log(`Appending image: ${file.name}, size: ${file.size} bytes`);
            });
            
            // Upload to Cloudinary via our API
            const response = await fetch('http://localhost:5000/api/products/images', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('Failed to upload images to Cloudinary:', errorText);
              throw new Error(`Failed to upload images: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('Images uploaded successfully to Cloudinary:', result);
            return result;
          } catch (error) {
            console.error('Error during Cloudinary image upload:', error);
            throw error;
          }
        };

        // Handle Cloudinary image uploads BEFORE redirecting
        if (imageFiles.length > 0) {
          try {
            console.log(`Uploading ${imageFiles.length} images to Cloudinary for product ${productData.productEntry.product_id}`);
            await uploadImages(productData.productEntry.product_id, productData.productEntry.entry_id);
            console.log('All images uploaded successfully to Cloudinary');
          } catch (imageError) {
            console.error('Error uploading images to Cloudinary:', imageError);
            // We'll show the success message anyway since the product was created
          }
        }
        
        // Show success message
        alert('Product added successfully!');
        
        // Notify parent component
        onSave(productData.productEntry);
        
        // Redirect to products page after both product creation and image upload
        window.location.href = '/artisan/products';
        
      } catch (error) {
        console.error('Error adding product:', error);
        setFeedbackMessage({ 
          type: 'error', 
          message: error.message || 'Failed to add product. Please try again.' 
        });
        setIsLoading(false);
      }
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
              <label className="form-label">
                Product ID<span className="text-danger">*</span>
                {isLoading && (
                  <span className="ms-2">
                    <span className="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true"></span>
                  </span>
                )}
              </label>
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
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleNameChange}
                  placeholder="Enter product name"
                  required
                />
            
                {suggestions.length > 0 && (
                  <span className="position-absolute" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                    <i className="fas fa-caret-down text-secondary"></i>
                  </span>
                )}
                
                {suggestions.length > 0 && (
                  <div 
                    className="position-absolute w-100 border rounded mt-1 bg-white shadow-sm"
                    style={{ 
                      zIndex: 1000, 
                      maxHeight: '200px', 
                      overflowY: 'auto',
                      left: 0
                    }}
                  >
                    {suggestions.map((product, index) => (
                      <div
                        key={index}
                        className="py-2 px-3 border-bottom"
                        style={{ 
                          cursor: 'pointer', 
                          backgroundColor: 'white', 
                          transition: 'background-color 0.2s'
                        }}
                        onClick={() => {
                          setFormData(prev => ({...prev, product_name: product.product_name}));
                          fetchProductDetailsByName(product.product_name);
                          setSuggestions([]);
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        {product.product_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                Size {formData.category === 'Clothing' ? '' : '(N/A for non-clothing items)'}
              </label>
              <select
                className="form-select"
                name="size"
                value={formData.size}
                onChange={handleChange}
                disabled={formData.category !== 'Clothing'} // Only enable for clothing
              >
                <option value="N/A">Select Size</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Product Images<span className="text-danger">*</span></label>
              <input 
                type="file" 
                className="form-control" 
                multiple 
                onChange={handleImageUpload} 
                required={images.length === 0}
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
