import React, { useState, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminTopbar = () => {
  const [userProfile, setUserProfile] = useState({
    firstName: 'Admin',
    profileUrl: null
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get('/api/employees/settings/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.success) {
          const { firstName, profileUrl } = response.data.data;
          setUserProfile({
            firstName: firstName || 'Admin',
            profileUrl: profileUrl || null
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    
    fetchUserProfile();
  }, []);

  return (
    <div className="admin-topbar d-flex justify-content-between align-items-center">
      <div className="flex-grow-1"></div>
      
      <div className="position-absolute w-100 d-flex justify-content-center" style={{ pointerEvents: 'none' }}>
        <span style={{ color: '#3e87c3', fontSize: '18px', fontWeight: 'bold' }}>
          Admin Dashboard
        </span>
      </div>
      
      <div className="admin-info position-relative" style={{ zIndex: 5 }}>
        <div className="user-profile">
          {userProfile.profileUrl ? (
            <img 
              src={userProfile.profileUrl} 
              alt="Profile" 
              style={{ 
                width: '35px', 
                height: '35px', 
                borderRadius: '50%',
                objectFit: 'cover',
                marginRight: '8px'
              }} 
            />
          ) : (
            <FaUserCircle style={{ fontSize: '30px', color: '#3e87c3', marginRight: '8px' }} />
          )}
          <span>{userProfile.firstName}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminTopbar;
