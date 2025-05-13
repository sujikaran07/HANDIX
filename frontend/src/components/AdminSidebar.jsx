import React, { useState } from 'react';
import { FaTachometerAlt, FaUserTie, FaUsers, FaRegListAlt, FaGift, FaComments, FaCog, FaSignOutAlt, FaChartLine, FaWarehouse, FaBox, FaFileAlt, FaPaypal, FaWallet, FaPercentage, FaReceipt } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import '../styles/admin/AdminDashboard.css';
import logo from '../assets/logo1.png'; 

const AdminSidebar = () => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);

  const handleLinkClick = (path) => {
    setActiveLink(path);
  };

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
          <li className={activeLink === '/admin/dashboard' ? 'active' : ''}>
            <Link to="/admin/dashboard" onClick={() => handleLinkClick('/admin/dashboard')}>
              <FaTachometerAlt /> Dashboard
            </Link>
          </li>
          <li className={activeLink === '/admin/employee' ? 'active' : ''}>
            <Link to="/admin/employee" onClick={() => handleLinkClick('/admin/employee')}>
              <FaUserTie /> Employee
            </Link>
          </li>
          <li className={activeLink === '/admin/customers' ? 'active' : ''}>
            <Link to="/admin/customers" onClick={() => handleLinkClick('/admin/customers')}>
              <FaUsers /> Customers
            </Link>
          </li>
          <li className={activeLink === '/admin/assignorders' ? 'active' : ''}>
            <Link to="/admin/assignorders" onClick={() => handleLinkClick('/admin/assignorders')}>
              <FaRegListAlt /> Assign Orders
            </Link>
          </li>
          <li className={activeLink === '/admin/orders' ? 'active' : ''}>
            <Link to="/admin/orders" onClick={() => handleLinkClick('/admin/orders')}>
              <FaGift /> Orders
            </Link>
          </li>
          <li className={activeLink === '/admin/payments' ? 'active' : ''}>
            <Link to="/admin/payments" onClick={() => handleLinkClick('/admin/payments')}>
              <FaWallet /> Payments
            </Link>
          </li>
          <li className={activeLink === '/admin/inventory' ? 'active' : ''}>
            <Link to="/admin/inventory" onClick={() => handleLinkClick('/admin/inventory')}>
              <FaWarehouse /> Inventory
            </Link>
          </li>
          <li className={activeLink === '/admin/products' ? 'active' : ''}>
            <Link to="/admin/products" onClick={() => handleLinkClick('/admin/products')}>
              <FaBox /> Products
            </Link>
          </li>
          <li className={activeLink === '/admin/pricing' ? 'active' : ''}>
            <Link to="/pricing" onClick={() => handleLinkClick('/admin/pricing')}>
              <FaReceipt /> Pricing
            </Link>
          </li>
          <li className={activeLink === '/admin/reports' ? 'active' : ''}>
            <Link to="/admin/reports" onClick={() => handleLinkClick('/admin/reports')}>
              <FaFileAlt /> Reports
            </Link>
          </li>

          <li className={activeLink === '/admin/settings' ? 'active' : ''}>
            <Link to="/admin/settings" onClick={() => handleLinkClick('/admin/settings')}>
              <FaCog /> Settings
            </Link>
          </li>
          <li className={activeLink === '/admin/logout' ? 'active' : ''}>
            <Link to="/admin/logout" onClick={() => handleLinkClick('/admin/logout')}>
              <FaSignOutAlt /> Logout
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSidebar;
