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
          <label className="form-label font-weight-bold">Product ID</label>
          <input
            type="text"
            className="form-control"
            id="productId"
            value={productId}
            readOnly
          />
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Product Name</label>
          <input
            type="text"
            className="form-control"
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            disabled={isMultipleEntries} 
          />
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Category</label>
          <select
            className="form-select"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isMultipleEntries}
          >
            <option value="Accessories">Accessories</option>
            <option value="Clothing">Clothing</option>
            <option value="Crafts">Crafts</option>
            <option value="Carry Goods">Carry Goods</option>
            <option value="Artistry">Artistry</option>
          </select>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Unit Price</label>
          <input
            type="number"
            className="form-control"
            id="unitPrice"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            disabled={isMultipleEntries} 
          />
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Quantity</label>
          <input
            type="number"
            className="form-control"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Product Status</label>
          <select
            className="form-select"
            id="productStatus"
            value={productStatus}
            onChange={(e) => setProductStatus(e.target.value)}
            disabled={isMultipleEntries} 
          >
            <option value="Available">Available</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="In Stock">In Stock</option>
            <option value="Discontinued">Discontinued</option>
          </select>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Product Image</label>
          <input
            type="file"
            className="form-control"
            id="productImage"
            onChange={handleImageChange}
            disabled={isMultipleEntries} 
          />
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Size</label>
          <select
            className="form-select"
            id="size"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            disabled={isMultipleEntries || category !== 'Clothing'} 
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
          <label className="form-label font-weight-bold">Additional Price</label>
          <input
            type="number"
            className="form-control"
            id="additionalPrice"
            value={additionalPrice}
            onChange={(e) => setAdditionalPrice(e.target.value)}
            disabled={isMultipleEntries || !customization} 
          />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Description</label>
          <input
            type="text"
            className="form-control"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isMultipleEntries} 
          />
        </div>
      </div>
      <div className="d-flex justify-content-end">
        <button type="button" className="btn btn-success me-2" onClick={handleSave}>Update</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default EditProductForm;
