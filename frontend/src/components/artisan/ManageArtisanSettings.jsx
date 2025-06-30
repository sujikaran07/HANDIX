import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/artisan/ArtisanSettings.css';
import axios from 'axios';
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Artisan settings management component with profile and password update functionality
const ManageArtisanSettings = ({ onViewSetting }) => {
  // Password visibility toggle states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordForEdit, setShowPasswordForEdit] = useState(false);
  
  // Profile form state with initialized empty strings
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordForEdit, setPasswordForEdit] = useState('');
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch artisan profile data with role verification
  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('artisanToken');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Verify artisan role before proceeding
      try {
        const response = await axios.get('/api/employees/settings/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.success) {
          const userData = response.data.data;
          
          // Ensure user has artisan role (roleId = 2)
          if (userData.roleId !== 2) {
            setError('You are not authorized to access artisan settings.');
            setLoading(false);
            return;
          }
          
          setProfile({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
          });
          
          if (userData.profileUrl && userData.profileUrl.trim() !== '') {
            setPreviewImage(userData.profileUrl);
          } else {
            setPreviewImage(null);
          }
        }
        setError(null);
      } catch (err) {
        setError('Failed to load profile data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Input validation functions
  const validateName = (name) => /^[A-Za-z ]+$/.test(name.trim());
  const validatePhone = (phone) => /^\d{10}$/.test(phone);
  const validatePassword = (password) => password.length >= 8;

  // Handle form input changes with validation
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;
    if (name === 'firstName' || name === 'lastName') {
      filteredValue = value.replace(/[^A-Za-z ]/g, '');
    }
    if (name === 'phone') {
      filteredValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    setProfile({ ...profile, [name]: filteredValue });
  };

  // Handle profile picture upload with preview
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Preview image locally
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Upload image to server
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      setLoading(true);
      const token = localStorage.getItem('artisanToken');
      
      const response = await axios.put('/api/employees/settings/profile-picture', 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        setPreviewImage(response.data.data.profileUrl);
        setMessage('Profile picture updated successfully');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // Validate and save profile changes
  const handleSaveChanges = async () => {
    setFirstNameError('');
    setLastNameError('');
    setPhoneError('');
    setPasswordError('');
    let valid = true;
    if (!validateName(profile.firstName)) {
      setFirstNameError('First name can only contain letters and spaces.');
      valid = false;
    }
    if (!validateName(profile.lastName)) {
      setLastNameError('Last name can only contain letters and spaces.');
      valid = false;
    }
    if (!validatePhone(profile.phone)) {
      setPhoneError('Phone number must be exactly 10 digits.');
      valid = false;
    }
    if (profile.newPassword && !validatePassword(profile.newPassword)) {
      setPasswordError('Password must be at least 8 characters.');
      valid = false;
    }
    if (!valid) return;
    
    // Handle password update with validation
    if (profile.newPassword || profile.confirmNewPassword || profile.currentPassword) {
      if (profile.newPassword !== profile.confirmNewPassword) {
        setError('New passwords do not match');
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      if (!profile.currentPassword) {
        setError('Current password is required to update password');
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      // Show password confirmation popup
      setShowPasswordPopup(true);
      return;
    }
    
    // Update profile info only
    await updateProfile();
  };

  // Update profile information
  const updateProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('artisanToken');
      
      const profileResponse = await axios.put('/api/employees/settings/profile', 
        {
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone
        }, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (profileResponse.data && profileResponse.data.success) {
        setMessage('Profile updated successfully');
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  // Handle password confirmation and update
  const handleConfirmPassword = async () => {
    try {
      setLoading(true);
      
      // Verify current password first
      const token = localStorage.getItem('artisanToken');
      
      const verifyResponse = await axios.post('/api/employees/settings/verify-password', 
        { currentPassword: passwordForEdit }, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (verifyResponse.data && verifyResponse.data.success) {
        // Update password if verification successful
        const passwordResponse = await axios.put('/api/employees/settings/password', 
          {
            currentPassword: profile.currentPassword,
            newPassword: profile.newPassword
          }, 
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (passwordResponse.data && passwordResponse.data.success) {
          setMessage('Password updated successfully');
          setProfile({
            ...profile,
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
          });
        }
        
        setError(null);
      } else {
        setError('Current password is incorrect');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError('Failed to update password. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
      setShowPasswordPopup(false);
      setPasswordForEdit('');
    }
  };

  // Remove profile picture
  const handleRemoveProfilePicture = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('artisanToken');
      
      const response = await axios.delete('/api/employees/settings/profile-picture', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.success) {
        setPreviewImage(null);
        setMessage('Profile picture removed successfully');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setError('Failed to remove profile picture. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container mt-4 manage-settings-container">
        <div className="card p-4 manage-settings-card">
          {/* Settings header */}
          <div className="manage-settings-header d-flex justify-content-between align-items-center mb-3">
            <div className="title-section">
              <h4>Account Settings</h4>
            </div>
          </div>

          {/* Loading spinner */}
          {loading && (
            <div className="text-center my-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {/* Error and success messages */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {message && (
            <div className="alert alert-success" role="alert">
              {message}
            </div>
          )}

          {/* Profile information section */}
          <div className="profile-section mb-4">
            <h5>Profile Information</h5>
            <div className="row mb-3">
              <div className="col-md-3">
                {/* Profile picture upload with preview */}
                <div className="profile-picture-container position-relative mb-3">
                  {/* Delete icon with white X */}
                  {previewImage && (
                    <div 
                      className="delete-icon position-absolute"
                      onClick={handleRemoveProfilePicture}
                      style={{
                        top: '-5px',
                        right: '35px',
                        backgroundColor: '#ff2222',
                        width: '25px',
                        height: '25px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        zIndex: 100,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Remove profile picture"
                    >
                      <span style={{
                        color: 'white', 
                        fontSize: '14px',
                        fontWeight: 'bold',
                        lineHeight: '14px'
                      }}>✕</span>
                    </div>
                  )}

                  <div 
                    className="profile-picture-preview position-relative" 
                    onClick={handleImageClick}
                    style={{
                      width: '150px',
                      height: '150px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '1px solid #ddd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f8f9fa',
                      margin: '0 auto'
                    }}
                  >
                    {previewImage ? (
                      <>
                        <img 
                          src={previewImage} 
                          alt="Profile Preview" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <div className="edit-overlay position-absolute" style={{
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.3s',
                          borderRadius: '50%'
                        }} onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                          onMouseOut={(e) => e.currentTarget.style.opacity = 0}>
                          <i className="fas fa-edit fa-2x text-white"></i>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center">
                          <i className="fas fa-user fa-3x text-secondary"></i>
                          <p className="mt-2 small text-muted">Click to upload</p>
                        </div>
                        <div className="edit-overlay position-absolute" style={{
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.3s',
                          borderRadius: '50%'
                        }} onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                          onMouseOut={(e) => e.currentTarget.style.opacity = 0}>
                          <i className="fas fa-plus fa-2x text-white"></i>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="form-control d-none" 
                    id="profilePicture" 
                    name="profilePicture" 
                    onChange={handleFileChange} 
                    accept="image/*"
                  />
                </div>
              </div>
              <div className="col-md-9">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="firstName" name="firstName" value={profile.firstName} onChange={handleProfileChange} />
                    {firstNameError && <div className="text-danger small">{firstNameError}</div>}
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="lastName" name="lastName" value={profile.lastName} onChange={handleProfileChange} />
                    {lastNameError && <div className="text-danger small">{lastNameError}</div>}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" className="form-control" id="email" name="email" value={profile.email} onChange={handleProfileChange} disabled />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input type="text" className="form-control" id="phone" name="phone" value={profile.phone} onChange={handleProfileChange} />
                    {phoneError && <div className="text-danger small">{phoneError}</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Password change section */}
          <div className="password-section mb-4">
            <h5>Password</h5>
            <div className="row mb-3">
              <div className="col-md-4">
                <label htmlFor="currentPassword" className="form-label">Current Password</label>
                <div className="position-relative input-group">
                  <input 
                    type={showCurrentPassword ? "text" : "password"} 
                    className="form-control" 
                    id="currentPassword" 
                    name="currentPassword" 
                    value={profile.currentPassword}
                    onChange={handleProfileChange}
                    style={{ height: "38px" }}
                  />
                  <span 
                    className="input-icon" 
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)} 
                    style={{ cursor: 'pointer' }}
                  >
                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
              <div className="col-md-4">
                <label htmlFor="newPassword" className="form-label">New Password</label>
                <div className="position-relative input-group">
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    className="form-control" 
                    id="newPassword" 
                    name="newPassword" 
                    value={profile.newPassword}
                    onChange={handleProfileChange}
                    style={{ height: "38px" }}
                  />
                  <span 
                    className="input-icon" 
                    onClick={() => setShowNewPassword(!showNewPassword)} 
                    style={{ cursor: 'pointer' }}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {passwordError && <div className="text-danger small">{passwordError}</div>}
              </div>
              <div className="col-md-4">
                <label htmlFor="confirmNewPassword" className="form-label">Confirm New Password</label>
                <div className="position-relative input-group">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    className="form-control" 
                    id="confirmNewPassword" 
                    name="confirmNewPassword" 
                    value={profile.confirmNewPassword}
                    onChange={handleProfileChange}
                    style={{ height: "38px" }}
                  />
                  <span 
                    className="input-icon" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    style={{ cursor: 'pointer' }}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="d-flex justify-content-end">
            <button className="btn btn-success" onClick={handleSaveChanges} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Password confirmation modal */}
          {showPasswordPopup && (
            <div className="modal password-confirmation-modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirm Password</h5>
                    <button type="button" className="btn-close" onClick={() => setShowPasswordPopup(false)}></button>
                  </div>
                  <div className="modal-body">
                    <label htmlFor="passwordForEdit" className="form-label">Enter Password to Confirm</label>
                    <div className="position-relative input-group">
                      <input 
                        type={showPasswordForEdit ? "text" : "password"} 
                        className="form-control" 
                        id="passwordForEdit" 
                        name="passwordForEdit" 
                        value={passwordForEdit} 
                        onChange={(e) => setPasswordForEdit(e.target.value)} 
                        style={{ height: "38px" }}
                      />
                      <span 
                        className="input-icon" 
                        onClick={() => setShowPasswordForEdit(!showPasswordForEdit)} 
                        style={{ cursor: 'pointer' }}
                      >
                        {showPasswordForEdit ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordPopup(false)}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={handleConfirmPassword} disabled={loading}>
                      {loading ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ManageArtisanSettings;
