import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EditProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    product_id: '',
    product_name: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
    size: 'N/A',
    additional_price: '',
    customization_available: 'No',
    product_status: 'In Stock',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (product) {
      setFormData({
        product_id: product.product_id || '',
        product_name: product.product_name || '',
        description: product.description || '',
        category: product.category?.category_name || '',
        price: product.unit_price || '',
        quantity: product.quantity || '',
        size: product.variations && product.variations.length > 0 ? product.variations[0].size : 'N/A',
        additional_price: product.variations && product.variations.length > 0 ? product.variations[0].additional_price : '',
        customization_available: product.customization_available ? 'Yes' : 'No',
        product_status: product.product_status || 'In Stock',
      });

      if (product.entryImages && product.entryImages.length > 0) {
        const productImages = product.entryImages.map(img => img.image_url);
        setImages(productImages);
        setExistingImageUrls(productImages);
      }
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setImages(prevImages => [...prevImages, ...newImageUrls]);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.product_name) newErrors.product_name = 'Product Name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.quantity) newErrors.quantity = 'Quantity is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);

      const newImages = images.filter(img => !existingImageUrls.includes(img));
      
      const updatedProductData = {
        ...formData,
        entry_id: product.entry_id,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
        images: newImages,
        hasExistingImages: existingImageUrls.length > 0
      };
      
      onSave(updatedProductData);
      setIsLoading(false);
    }
  };

  return (
    <div className="edit-product-form">
      <h4 className="mb-4">Edit Product</h4>
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Product ID</label>
            <input
              type="text"
              className="form-control"
              name="product_id"
              value={formData.product_id}
              disabled
            />
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
          </div>
          <div className="col-md-4">
            <label className="form-label">
              Product Status<span className="text-danger">*</span>
            </label>
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
          </div>
          <div className="col-md-4">
            <label className="form-label">Product Images</label>
            <input
              type="file"
              className="form-control"
              multiple
              onChange={handleImageUpload}
            />
            {images.length > 0 && (
              <div className="mt-2 text-success small">
                {images.length} image{images.length !== 1 ? 's' : ''} selected 
                ({existingImageUrls.length} existing)
              </div>
            )}
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
            />
          </div>
        </div>

        <div className="d-flex justify-content-end mt-4">
          <button type="button" className="btn btn-secondary me-2" onClick={onCancel}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductForm;
