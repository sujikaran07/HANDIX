import React, { useState, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Top navigation bar component for artisan interface with user profile display
const ArtisanTopBar = () => {
  const [userProfile, setUserProfile] = useState({
    firstName: 'Artisan',
    profileUrl: null
  });

  useEffect(() => {
    // Fetch artisan profile information
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('artisanToken');
        if (!token) return;
        
        const response = await axios.get('/api/employees/settings/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.success) {
          const { firstName, profileUrl } = response.data.data;
          setUserProfile({
            firstName: firstName || 'Artisan',
            profileUrl: profileUrl || null
          });
        }
      } catch (err) {
        // Continue with default profile on error
      }
    };
    
    fetchUserProfile();
  }, []);

  return (
    <div className="artisan-topbar d-flex justify-content-between align-items-center">
      <div className="flex-grow-1"></div>
      
      {/* Centered dashboard title */}
      <div className="position-absolute w-100 d-flex justify-content-center" style={{ pointerEvents: 'none' }}>
        <span style={{ color: '#3e87c3', fontSize: '18px', fontWeight: 'bold' }}>
          Artisan Dashboard
        </span>
      </div>
      
      {/* User profile section */}
      <div className="artisan-info position-relative" style={{ zIndex: 5 }}>
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

export default ArtisanTopBar;
