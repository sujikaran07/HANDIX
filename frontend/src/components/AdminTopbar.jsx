import React from 'react';
import { FaSearch, FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminTopbar = () => {
  return (
    <div className="admin-topbar">
      <div className="search-bar">
        <input type="text" placeholder="Search something here" />
        <button>
          <FaSearch />
        </button>
      </div>

      <div className="admin-info">
        <div className="user-profile">
          <FaUserCircle style={{ fontSize: '25px', color: '#3e87c3' }} />
          <span>SUJIKARAN</span>
        </div>
      </div>
    </div>
  );
};

export default AdminTopbar;
