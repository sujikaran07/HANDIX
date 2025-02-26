import React, { useState } from 'react';
import { FaTachometerAlt, FaUserTie, FaUsers, FaRegListAlt, FaGift, FaComments, FaCog, FaSignOutAlt, FaChartLine, FaWarehouse, FaBox } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/artisan/ArtisanDashboard.css';
import logo from '../../assets/logo1.png'; 

const ArtisanSidebar = () => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);

  const handleLinkClick = (path) => {
    setActiveLink(path);
  };

  return (
    <div className="artisan-sidebar text-white">
      <div className="artisan-sidebar-header">
        <div className="artisan-logo-title-container">
          <img src={logo} alt="HANDIX Logo" className="artisan-handix-logo" /> 
          <h3 className="artisan-handix-title">HANDIX</h3>
        </div>
      </div>
      <div className="artisan-sidebar-content">
        <ul className="list-unstyled">
          <li className={activeLink === '/artisan/dashboard' ? 'artisan-active' : ''}>
            <Link to="/artisan/dashboard" onClick={() => handleLinkClick('/artisan/dashboard')}>
              <FaTachometerAlt /> Dashboard
            </Link>
          </li>
          <li className={activeLink === '/artisan/products' ? 'artisan-active' : ''}>
            <Link to="/artisan/products" onClick={() => handleLinkClick('/artisan/products')}>
              <FaBox /> Products
            </Link>
          </li>
          <li className={activeLink === '/artisan/assignorders' ? 'artisan-active' : ''}>
            <Link to="/artisan/assignorders" onClick={() => handleLinkClick('/artisan/assignorders')}>
              <FaRegListAlt /> Assigned Orders
            </Link>
          </li>
          <li className={activeLink === '/artisan/performance' ? 'artisan-active' : ''}>
            <Link to="/artisan/performance" onClick={() => handleLinkClick('/artisan/performance')}>
              <FaChartLine /> Performance
            </Link>
          </li>
          <li className={activeLink === '/artisan/notification' ? 'artisan-active' : ''}>
            <Link to="/artisan/notification" onClick={() => handleLinkClick('/artisan/notification')}>
              <FaComments /> Notification
            </Link>
          </li>
          <li className={activeLink === '/artisan/settings' ? 'artisan-active' : ''}>
            <Link to="/artisan/settings" onClick={() => handleLinkClick('/artisan/settings')}>
              <FaCog /> Settings
            </Link>
          </li>
          <li className={activeLink === '/artisan/logout' ? 'artisan-active' : ''}>
            <Link to="/artisan/logout" onClick={() => handleLinkClick('/artisan/logout')}>
              <FaSignOutAlt /> Logout
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ArtisanSidebar;
