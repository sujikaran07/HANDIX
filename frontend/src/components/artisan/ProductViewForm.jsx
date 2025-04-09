import React from 'react';

const ProductViewForm = ({ product, onBack }) => {
  const getFieldValue = (value) => (value ? value : 'N/A');

  return (
    <div>
      <h4 className="mb-4">Product Details</h4>
      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Product ID</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(product.product_id)}</p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Name</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(product.product_name)}</p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Category</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(product.category?.category_name)}</p>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Unit Price</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(product.unit_price)}</p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Quantity</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(product.quantity)}</p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Status</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(product.status)}</p>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Description</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(product.description)}</p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Added Date</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(new Date(product.date_added).toISOString().split('T')[0])}</p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Product Status</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(product.product_status)}</p>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Size</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(product.variation?.size)}</p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Additional Price</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(product.variation?.additional_price)}</p>
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Stock Level</label>
          <p className="form-control-plaintext bg-light p-2">{getFieldValue(product.variation?.stock_level)}</p>
        </div>
      </div>
      <div className="d-flex justify-content-end">
        <button type="button" className="btn btn-secondary" onClick={onBack}>Back</button>
      </div>
    </div>
  );
};

export default ProductViewForm;
