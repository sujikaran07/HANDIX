import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../styles/admin/AdminLogout.css';

const ManageLogout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Implement logout functionality here
    navigate('/login');
  };

  const handleCancel = () => {
    // Implement cancel functionality here
    navigate('/admin/dashboard');
  };

  return (
    <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', flex: '1 1 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div className="logout-wrapper" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h3>Do you want to log out?</h3>
          <div className="logout-buttons mt-4" style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', gap: '10px' }}>
            <button className="btn btn-secondary rounded" onClick={handleCancel}>No</button>
            <button className="btn btn-danger rounded" onClick={handleLogout}>Yes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageLogout;
