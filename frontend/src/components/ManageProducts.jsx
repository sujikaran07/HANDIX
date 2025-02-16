import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons';
import { FaBox } from 'react-icons/fa';
import Pagination from './Pagination';
import '../styles/admin/AdminProducts.css';

const ManageProducts = ({ onViewProduct }) => {
  const [products, setProducts] = useState([
    { pID: 'P001', name: 'Tote Bag', category: 'Carry Goods', aID: 'A001', price: '$100', quantity: 50, uploadedDate: '2023-10-01', status: 'Approved' },
    { pID: 'P002', name: 'Beeralu Jewelry', category: 'Accessories', aID: 'A002', price: '$200', quantity: 30, uploadedDate: '2023-10-02', status: 'Pending' },
    { pID: 'P003', name: 'Handloom Sarong', category: 'Clothing', aID: 'A003', price: '$150', quantity: 20, uploadedDate: '2023-10-03', status: 'Rejected' },
    { pID: 'P004', name: 'Coconut ', category: 'Crafts', aID: 'A004', price: '$250', quantity: 40, uploadedDate: '2023-10-04', status: 'Approved' },
    { pID: 'P005', name: 'Hand-Painted Mask', category: 'Artistry', aID: 'A005', price: '$300', quantity: 10, uploadedDate: '2023-10-05', status: 'Pending' },
    { pID: 'P006', name: 'Handwoven Bag ', category: 'Carry Goods', aID: 'A006', price: '$350', quantity: 60, uploadedDate: '2023-10-06', status: 'Rejected' },
    { pID: 'P007', name: 'Batik Shawl', category: 'Clothing', aID: 'A007', price: '$400', quantity: 25, uploadedDate: '2023-10-07', status: 'Approved' },
    { pID: 'P008', name: 'Palmyrah Basket', category: 'Crafts', aID: 'A008', price: '$450', quantity: 35, uploadedDate: '2023-10-08', status: 'Pending' },
    { pID: 'P009', name: 'Dumbara Mat', category: 'Artistry', aID: 'A009', price: '$500', quantity: 15, uploadedDate: '2023-10-09', status: 'Rejected' },
    { pID: 'P010', name: 'Coconut Shell ', category: 'Carry Goods', aID: 'A010', price: '$550', quantity: 45, uploadedDate: '2023-10-10', status: 'Approved' },
    // ...more products
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['Carry Goods', 'Accessories', 'Clothing', 'Crafts', 'Artistry']);
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 4;

  const handleCategoryChange = (category) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(category)
        ? prevSelected.filter((cat) => cat !== category)
        : [...prevSelected, category]
    );
  };

  const filteredProducts = products.filter(product => {
    return (
      (selectedCategories.includes(product.category)) &&
      (filterStatus === 'All' || product.status === filterStatus) &&
      (product.pID.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.category.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <div className="manage-products-header d-flex justify-content-between align-items-center mb-3">
          <div className="title-section">
            <div className="icon-and-title">
              <FaBox className="product-icon" />
              <div className="text-section">
                <h2>Products</h2>
                <p>Manage your products</p>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <div className="search-bar me-2">
              <div className="input-group">
                <span className="input-group-text bg-light border-0">
                  <FontAwesomeIcon icon={faSearch} />
                </span>
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ boxShadow: 'none' }}
                />
              </div>
            </div>
            <button className="export-btn btn btn-light" style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
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
                <option value="All">All</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ flex: '1 1 auto', overflowY: 'auto', marginTop: '20px' }}>
          <table className="table table-bordered table-striped product-table">
            <thead>
              <tr>
                <th>P-ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>A-ID</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Uploaded Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map(product => (
                  <tr key={product.pID}>
                    <td>{product.pID}</td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.aID}</td>
                    <td>{product.price}</td>
                    <td>{product.quantity}</td>
                    <td>{product.uploadedDate}</td>
                    <td className={`status ${product.status.toLowerCase()}`}>{product.status}</td>
                    <td className="action-buttons">
                      <div className="dropdown">
                        <button className="btn dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                          Actions
                        </button>
                        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                          <li>
                            <button className="dropdown-item" onClick={() => onViewProduct(product)}>View</button>
                          </li>
                          {product.status === 'Pending' && (
                            <>
                              <li>
                                <button className="dropdown-item">Approve</button>
                              </li>
                              <li>
                                <button className="dropdown-item">Reject</button>
                              </li>
                              <li>
                                <button className="dropdown-item">Edit</button>
                              </li>
                              <li>
                                <button className="dropdown-item">Delete</button>
                              </li>
                            </>
                          )}
                          {product.status === 'Approved' && (
                            <>
                              <li>
                                <button className="dropdown-item">Edit</button>
                              </li>
                              <li>
                                <button className="dropdown-item">Disable</button>
                              </li>
                              <li>
                                <button className="dropdown-item">Delete</button>
                              </li>
                            </>
                          )}
                          {product.status === 'Rejected' && (
                            <>
                              <li>
                                <button className="dropdown-item">Restore</button>
                              </li>
                              <li>
                                <button className="dropdown-item">Delete</button>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center">No products available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination className="product-pagination" currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default ManageProducts;
