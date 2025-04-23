import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons';
import { FaGift } from 'react-icons/fa';
import Pagination from './Pagination';
import '../styles/admin/AdminOrder.css';

const ManageOrder = ({ onAddOrderClick, onViewOrder }) => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomized, setSelectedCustomized] = useState(['Yes', 'No']);
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 4;

  const handleCustomizedChange = (customized) => {
    setSelectedCustomized((prevSelected) =>
      prevSelected.includes(customized)
        ? prevSelected.filter((type) => type !== customized)
        : [...prevSelected, customized]
    );
  };

  const filteredOrders = orders.filter(order => {
    return (
      (selectedCustomized.includes(order.customized)) &&
      (filterStatus === 'All' || order.status === filterStatus) &&
      (order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
       order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       order.customized.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        <div className="manage-order-header d-flex justify-content-between align-items-center mb-3">
          <div className="title-section">
            <div className="icon-and-title">
              <FaGift className="order-icon" />
              <div className="text-section">
                <h2>Orders</h2>
                <p>Manage your orders</p>
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
                id="customizedYesCheckbox"
                value="Yes"
                checked={selectedCustomized.includes('Yes')}
                onChange={() => handleCustomizedChange('Yes')}
              />
              <label className="form-check-label" htmlFor="customizedYesCheckbox">Yes</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                id="customizedNoCheckbox"
                value="No"
                checked={selectedCustomized.includes('No')}
                onChange={() => handleCustomizedChange('No')}
              />
              <label className="form-check-label" htmlFor="customizedNoCheckbox">No</label>
            </div>
          </div>
          {selectedCustomized.includes('Yes') && (
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
                  <option value="Review">Review</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Canceled">Canceled</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: '1 1 auto', overflowY: 'auto', marginTop: '20px' }}>
          <table className="table table-bordered table-striped order-table">
            <thead>
              <tr>
                <th>O-ID</th>
                <th>Customer Name</th>
                <th>Order Date</th>
                <th>Total Amount</th>
                <th>Customized</th>
                <th>Assigned Artisan</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customerName}</td>
                    <td>{order.orderDate}</td>
                    <td>{order.totalAmount}</td>
                    <td>{order.customized}</td>
                    <td>{order.customized === 'No' ? 'N/A' : order.assignedArtisan}</td>
                    <td className={`status ${order.status.toLowerCase().replace(' ', '-')}`}>{order.status}</td>
                    <td className="action-buttons">
                      <div className="dropdown">
                        <button className="btn dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                          Actions
                        </button>
                        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                          <li>
                            <button className="dropdown-item" onClick={() => onViewOrder(order)}>View</button>
                          </li>
                          {order.customized === 'Yes' && (
                            <li>
                              <button className="dropdown-item">Assign Artisan</button>
                            </li>
                          )}
                          <li>
                            <button className="dropdown-item">Confirm</button>
                          </li>
                          <li>
                            <button className="dropdown-item">Update</button>
                          </li>
                          <li>
                            <button className="dropdown-item">Cancel</button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">No orders available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination className="order-pagination" currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default ManageOrder;
