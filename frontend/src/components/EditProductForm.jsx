import React, { useState, useEffect } from 'react';

const EditProductForm = ({ product, onSave, onCancel }) => {
  const [updatedProduct, setUpdatedProduct] = useState(product);

  useEffect(() => {
    setUpdatedProduct(product);
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProduct({ ...updatedProduct, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(updatedProduct);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="productId" className="form-label">Product ID</label>
        <input type="text" className="form-control" id="productId" name="id" value={updatedProduct.id} onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label htmlFor="productName" className="form-label">Name</label>
        <input type="text" className="form-control" id="productName" name="name" value={updatedProduct.name} onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label htmlFor="productCategory" className="form-label">Category</label>
        <input type="text" className="form-control" id="productCategory" name="category" value={updatedProduct.category} onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label htmlFor="productArtisan" className="form-label">Artisan</label>
        <input type="text" className="form-control" id="productArtisan" name="artisan" value={updatedProduct.artisan} onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label htmlFor="productPrice" className="form-label">Price</label>
        <input type="text" className="form-control" id="productPrice" name="price" value={updatedProduct.price} onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label htmlFor="productStatus" className="form-label">Status</label>
        <select className="form-select" id="productStatus" name="status" value={updatedProduct.status} onChange={handleChange} required>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
      <button type="submit" className="btn btn-primary">Save</button>
      <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
    </form>
  );
};

export default EditProductForm;
