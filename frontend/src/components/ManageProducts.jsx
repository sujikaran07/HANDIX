import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons';
import { FaBox } from 'react-icons/fa';
import Pagination from './Pagination';
import EditProductForm from './EditProductForm';

const ManageProducts = () => {
  const [products, setProducts] = useState([
    { id: 'P001', name: 'Tote Bag', category: 'Carry Goods', artisan: 'Artisan 1', price: '$10', status: 'Pending', updatedDate: '2023-10-01' },
    { id: 'P002', name: 'Necklace', category: 'Accessories', artisan: 'Artisan 2', price: '$20', status: 'Approved', updatedDate: '2023-10-02' },
    { id: 'P003', name: 'Socks', category: 'Clothing', artisan: 'Artisan 3', price: '$15', status: 'Pending', updatedDate: '2023-10-03' },
    { id: 'P004', name: 'DIY Pot', category: 'Crafts', artisan: 'Artisan 4', price: '$25', status: 'Approved', updatedDate: '2023-10-04' },
    { id: 'P005', name: 'Aari Work Dress', category: 'Artistry', artisan: 'Artisan 5', price: '$50', status: 'Rejected', updatedDate: '2023-10-05' },
    // ...more products
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['Carry Goods', 'Accessories', 'Clothing', 'Crafts', 'Artistry']);
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditProductForm, setShowEditProductForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const productsPerPage = 4;

  const handleCategoryChange = (category) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(category)
        ? prevSelected.filter((cat) => cat !== category)
        : [...prevSelected, category]
    );
  };

  const handleDelete = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const handleEdit = (id) => {
    const product = products.find(product => product.id === id);
    setSelectedProduct(product);
    setShowEditProductForm(true);
  };

  const handleCancel = () => {
    setShowEditProductForm(false);
  };

  const handleSave = (newProduct) => {
    setProducts(products.map(product => product.id === newProduct.id ? newProduct : product));
    setShowEditProductForm(false);
  };

  const filteredProducts = products.filter(product => {
    return (
      (selectedCategories.includes(product.category)) &&
      (filterStatus === 'All' || product.status === filterStatus) &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.artisan.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        {showEditProductForm ? (
          <EditProductForm product={selectedProduct} onSave={handleSave} onCancel={handleCancel} />
        ) : (
          <>
            <div className="manage-product-header d-flex justify-content-between align-items-center mb-3">
              <div className="title-section">
                <div className="icon-and-title">
                  <FaBox className="product-icon" />
                  <div className="text-section">
                    <h2>Products</h2>
                    <p>Manage your products</p>
                  </div>
                </div>
              </div>
              <div className="button-section d-flex align-items-center">
                <div className="search-bar me-2">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">
                      <FontAwesomeIcon icon={faSearch} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-0"
                      placeholder="Search keyword"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <button className="export-btn btn btn-light me-2">
                  <FontAwesomeIcon icon={faCloudDownloadAlt} /> Export
                </button>
              </div>
            </div>

            <div className="filter-section mb-3 d-flex justify-content-between align-items-center">
              <div className="d-flex">
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="carryGoodsCheckbox"
                    value="Carry Goods"
                    checked={selectedCategories.includes('Carry Goods')}
                    onChange={() => handleCategoryChange('Carry Goods')}
                  />
                  <label className="form-check-label" htmlFor="carryGoodsCheckbox">Carry Goods</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="accessoriesCheckbox"
                    value="Accessories"
                    checked={selectedCategories.includes('Accessories')}
                    onChange={() => handleCategoryChange('Accessories')}
                  />
                  <label className="form-check-label" htmlFor="accessoriesCheckbox">Accessories</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="clothingCheckbox"
                    value="Clothing"
                    checked={selectedCategories.includes('Clothing')}
                    onChange={() => handleCategoryChange('Clothing')}
                  />
                  <label className="form-check-label" htmlFor="clothingCheckbox">Clothing</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="craftsCheckbox"
                    value="Crafts"
                    checked={selectedCategories.includes('Crafts')}
                    onChange={() => handleCategoryChange('Crafts')}
                  />
                  <label className="form-check-label" htmlFor="craftsCheckbox">Crafts</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="artistryCheckbox"
                    value="Artistry"
                    checked={selectedCategories.includes('Artistry')}
                    onChange={() => handleCategoryChange('Artistry')}
                  />
                  <label className="form-check-label" htmlFor="artistryCheckbox">Artistry</label>
                </div>
              </div>
              <div className="filter-dropdown">
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <FontAwesomeIcon icon={faFilter} />
                  </span>
                  <select
                    className="form-select border-0"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ flex: '1 1 auto', overflowY: 'auto' }}>
              <table className="table table-bordered table-striped table-hover product-table" style={{ borderRadius: '10px' }}>
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Artisan</th>
                    <th>Updated Date</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.length > 0 ? (
                    currentProducts.map(product => (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>{product.artisan}</td>
                        <td>{product.updatedDate}</td>
                        <td>{product.price}</td>
                        <td>{product.status}</td>
                        <td className="action-buttons">
                          <div className="dropdown">
                            <button className="btn dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                              Actions
                            </button>
                            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                              <li>
                                <button className="dropdown-item" onClick={() => {/* Implement approve functionality */}}>Approve</button>
                              </li>
                              <li>
                                <button className="dropdown-item" onClick={() => {/* Implement reject functionality */}}>Reject</button>
                              </li>
                              <li>
                                <button className="dropdown-item" onClick={() => handleEdit(product.id)}>Edit</button>
                              </li>
                              <li>
                                <button className="dropdown-item" onClick={() => handleDelete(product.id)}>Delete</button>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">No products available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;
