import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/artisan/ArtisanProducts.css';

const AddProductForm = ({ onSave, onCancel }) => {
  const [product, setProduct] = useState({
    id: 'P001', // Auto-generated or existing ID
    name: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
    images: null,
    customization: {
      size: false,
      color: false,
      chat: false,
    },
    status: 'In Stock',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  const handleCustomizationChange = (e) => {
    const { name, checked } = e.target;
    setProduct((prevProduct) => ({
      ...prevProduct,
      customization: {
        ...prevProduct.customization,
        [name]: checked,
      },
    }));
  };

  const handleImageChange = (e) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      images: e.target.files,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(product);
  };

  return (
    <div className="container mt-4 d-flex flex-column" style={{ height: '100vh' }}>
      <div className="card p-4 mb-3 flex-grow-1" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <h4 className="mb-4">Add New Product</h4>
        <form onSubmit={handleSubmit} className="d-flex flex-column h-100">
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="id" className="form-label">Product ID</label>
              <input
                type="text"
                className="form-control"
                id="id"
                name="id"
                value={product.id}
                readOnly
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="name" className="form-label">Product Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={product.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="category" className="form-label">Category</label>
              <select
                className="form-select"
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
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="unitPrice" className="form-label">Unit Price</label>
              <input
                type="text"
                className="form-control"
                id="unitPrice"
                name="price"
                value={product.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="quantity" className="form-label">Stock Quantity</label>
              <input
                type="number"
                className="form-control"
                id="quantity"
                name="quantity"
                value={product.quantity}
                onChange={handleChange}
                required
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
          <div className="row mb-3">
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
              <label htmlFor="description" className="form-label">Product Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={product.description}
                onChange={handleChange}
                rows="1" /* Adjusted to match the size of other fields */
                required
              ></textarea>
            </div>
            <div className="col-md-4">
              <label className="form-label">Customization Type</label>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="size"
                  name="size"
                  checked={product.customization.size}
                  onChange={handleCustomizationChange}
                />
                <label htmlFor="size" className="form-check-label">Size</label>
              </div>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="color"
                  name="color"
                  checked={product.customization.color}
                  onChange={handleCustomizationChange}
                />
                <label htmlFor="color" className="form-check-label">Color</label>
              </div>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="chat"
                  name="chat"
                  checked={product.customization.chat}
                  onChange={handleCustomizationChange}
                />
                <label htmlFor="chat" className="form-check-label">Customizable</label>
              </div>
            </div>
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
