import React, { useState, useEffect } from 'react';

const EditProductForm = ({ product, onSave, onCancel }) => {
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [productStatus, setProductStatus] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [size, setSize] = useState('');
  const [additionalPrice, setAdditionalPrice] = useState('');
  const [description, setDescription] = useState('');
  const [customization, setCustomization] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isMultipleEntries, setIsMultipleEntries] = useState(false); 

  useEffect(() => {
    if (product) {
      setProductId(product.product_id);
      setProductName(product.product_name);
      setCategory(product.category?.category_name);
      setUnitPrice(product.unit_price);
      setQuantity(product.quantity);
      setProductStatus(product.product_status);
      setSize(product.variation?.size || '');
      setAdditionalPrice(product.variation?.additional_price || '');
      setDescription(product.description || '');
      setCustomization(product.customization_available || false);
      setIsApproved(product.status === 'Approved');

    
      setIsMultipleEntries(product.multiple_entries || false); 
    }
  }, [product]);

  const handleImageChange = (e) => {
    setProductImage(e.target.files[0]);
  };

  const handleSave = () => {
    const updatedProduct = new FormData();
    updatedProduct.append('product_id', productId);
    updatedProduct.append('product_name', productName);
    updatedProduct.append('category', category);
    updatedProduct.append('unit_price', unitPrice);
    updatedProduct.append('quantity', quantity);
    updatedProduct.append('product_status', productStatus);
    if (productImage) {
      updatedProduct.append('product_image', productImage);
    }
    updatedProduct.append('size', size);
    updatedProduct.append('additional_price', additionalPrice);
    updatedProduct.append('description', description);

    onSave(updatedProduct);
  };

  return (
    <div>
      <h4 className="mb-4">Edit Product</h4>
<div className="row mb-3">
  <div className="col-md-4">
    <label className="form-label">Product ID</label>
    <input
      type="text"
      className="form-control"
      name="product_id"
      value={formData.product_id}
      readOnly
    />
  </div>
  <div className="col-md-4">
    <label className="form-label">Product Name</label>
    <input
      type="text"
      className="form-control"
      name="product_name"
      value={formData.product_name}
      onChange={handleChange}
      required
    />
  </div>
  <div className="col-md-4">
    <label className="form-label">Category</label>
    <select
      className="form-select"
      name="category"
      value={formData.category?.category_name || ''}
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
  </div>
</div>

<div className="row mb-3">
  <div className="col-md-4">
    <label className="form-label">Description</label>
    <input
      type="text"
      className="form-control"
      name="description"
      value={formData.description || formData.inventory?.description || ''}
      onChange={handleChange}
      placeholder="Product description"
    />
  </div>
  <div className="col-md-4">
    <label className="form-label">Price</label>
    <input
      type="number"
      className="form-control"
      name="unit_price"
      value={formData.unit_price}
      onChange={handleChange}
      min="0"
      step="0.01"
      required
    />
  </div>
  <div className="col-md-4">
    <label className="form-label">Stock Quantity</label>
    <input
      type="number"
      className="form-control"
      name="quantity"
      value={formData.quantity}
      onChange={handleChange}
      min="1"
      required
    />
  </div>
</div>

<div className="row mb-3">
  <div className="col-md-4">
    <label className="form-label">Size</label>
    <select
      className="form-select"
      name="size"
      value={formData.variation?.size || 'N/A'}
      onChange={handleChange}
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
    <label className="form-label">Product Images</label>
    <input 
      type="file" 
      className="form-control" 
      multiple 
      onChange={handleImageUpload} 
    />
    
    {formData.entryImages && formData.entryImages.length > 0 && (
      <div className="mt-2 d-flex flex-wrap">
        {formData.entryImages.map((img, index) => (
          <div key={index} className="me-2 mb-2 position-relative">
            <img src={img.image_url} alt={`Product ${index}`} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
            <button 
              type="button" 
              className="btn btn-sm btn-danger position-absolute top-0 end-0"
              onClick={() => removeExistingImage(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    )}
    

    {newImages.length > 0 && (
      <div className="mt-2 d-flex flex-wrap">
        {newImages.map((img, index) => (
          <div key={index} className="me-2 mb-2 position-relative">
            <img src={img} alt={`New ${index}`} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
            <button 
              type="button" 
              className="btn btn-sm btn-danger position-absolute top-0 end-0"
              onClick={() => removeNewImage(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
  <div className="col-md-4">
    <label className="form-label">Product Status</label>
    <select
      className="form-select"
      name="product_status"
      value={formData.product_status}
      onChange={handleChange}
    >
      <option value="In Stock">In Stock</option>
      <option value="Out of Stock">Out of Stock</option>
    </select>
  </div>
</div>

<div className="row mb-3">
  <div className="col-md-4">
    <label className="form-label">Customization Available</label>
    <select
      className="form-select"
      name="customization_available"
      value={formData.customization_available || 'No'}
      onChange={handleChange}
    >
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </select>
  </div>
  <div className="col-md-4">
    <label className="form-label">Additional Price</label>
    <input
      type="number"
      className="form-control"
      name="additional_price"
      value={formData.variation?.additional_price || 0}
      onChange={handleChange}
      min="0"
      step="0.01"
    />
  </div>
  <div className="col-md-4">
  </div>
</div>

<div className="d-flex justify-content-end mt-4">
  <button type="button" className="btn btn-secondary me-2" onClick={onCancel}>
    Cancel
  </button>
  <button type="submit" className="btn btn-primary">
    Save Changes
  </button>
</div>
    </div>
  );
};

export default EditProductForm;
