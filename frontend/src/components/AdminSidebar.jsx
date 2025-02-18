import React from 'react';
import { FaTachometerAlt, FaUserTie, FaUsers, FaRegListAlt, FaGift, FaComments, FaCog, FaSignOutAlt, FaChartLine, FaWarehouse, FaBox } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/admin/AdminDashboard.css';
import logo from '../assets/logo1.png'; 

const AdminSidebar = () => {
  return (
    <div className="sidebar text-white">
      <div className="sidebar-header">
        <div className="logo-title-container">
          <img src={logo} alt="HANDIX Logo" className="handix-logo" /> 
          <h3 className="handix-title">HANDIX</h3>
        </div>
      </div>
      <div className="sidebar-content">
        <ul className="list-unstyled">
          <li>
            <Link to="/admin/dashboard">
              <FaTachometerAlt /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/admin/products">
              <FaUserTie /> Employee
            </Link>
          </li>
          <li>
            <Link to="/admin/category">
              <FaUsers /> Customers
            </Link>
          </li>
          <li>
            <Link to="/admin/customers">
              <FaRegListAlt /> Assign Orders
            </Link>
          </li>
          <li>
            <Link to="/admin/orders">
              <FaGift /> Orders
            </Link>
          </li>
          <li>
            <Link to="/admin/coupons">
              <FaWarehouse /> Inventory
            </Link>
          </li>
          <li>
            <Link to="/admin/chats">
              <FaBox /> Products
            </Link>
          </li>
          <li className="/admin/settings">
            <Link to="/admin/settings">
              <FaCog /> Settings
            </Link>
          </li>
          <li>
            <Link to="/admin/logout">
              <FaSignOutAlt /> Logout
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSidebar;
