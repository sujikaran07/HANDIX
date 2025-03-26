import React, { useState } from 'react';

const AddProductForm = ({ onSave, onCancel }) => {
  const [product, setProduct] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    date: '',
    status: 'Pending',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(product);
  };

  return (
    <div className="add-product-form">
      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name</label>
          <input type="text" name="name" value={product.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Category</label>
          <input type="text" name="category" value={product.category} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input type="text" name="price" value={product.price} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Quantity</label>
          <input type="number" name="quantity" value={product.quantity} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" name="date" value={product.date} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select name="status" value={product.status} onChange={handleChange}>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <button type="submit" className="btn btn-success">Save</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </form>
    </div>
  );
};

export default AddProductForm;
