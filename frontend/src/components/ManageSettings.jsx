import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../styles/admin/AdminSettings.css';
import axios from 'axios';
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Component for managing admin profile settings and password changes
const ManageSettings = ({ onViewSetting }) => {
  // Password visibility state management
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordForEdit, setShowPasswordForEdit] = useState(false);
  
  // Profile data state
  const [profile, setProfile] = useState({
    profilePicture: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // UI state management
  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordForEdit, setPasswordForEdit] = useState('');
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);
  
  // Validation error states
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch admin profile data from server
  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Fetch profile data and verify admin role
      try {
        const response = await axios.get('/api/employees/settings/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.success) {
          const userData = response.data.data;
          
          // Verify admin role authorization
          if (userData.roleId !== 1) {
            setError('You are not authorized to access admin settings.');
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

  // Handle profile picture upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Preview image locally
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Upload to server
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
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

  // Handle save changes with validation
  const handleSaveChanges = async () => {
    setFirstNameError('');
    setLastNameError('');
    setPhoneError('');
    setPasswordError('');
    let valid = true;
    
    // Validate all form fields
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
    
    // Handle password change validation
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
      
      setShowPasswordPopup(true);
      return;
    }
    
    // Update profile without password confirmation
    await updateProfile();
  };

  // Update profile information
  const updateProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
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
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  // Handle password confirmation for security
  const handleConfirmPassword = async () => {
    if (!passwordForEdit) {
      setError('Please enter your password to confirm changes');
      return;
    }
    
    try {
      setLoading(true);
      
      // Update profile information first
      await updateProfile();
      
      // Update password if fields are filled
      if (profile.newPassword && profile.currentPassword) {
        const passwordResponse = await axios.put('/api/employees/settings/password', 
          {
            currentPassword: profile.currentPassword,
            newPassword: profile.newPassword
          }, 
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('adminToken')}`
            }
          }
        );
        
        if (passwordResponse.data && passwordResponse.data.success) {
          setMessage(message ? `${message} and password updated successfully` : 'Password updated successfully');
          
          // Clear password fields
          setProfile({
            ...profile,
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
          });
        }
      }
      
      setShowPasswordPopup(false);
      setPasswordForEdit('');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err.response?.data?.message || 'Failed to update settings. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Remove profile picture
  const handleRemoveProfilePicture = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await axios.put('/api/employees/settings/profile', 
        {
          removeProfilePicture: true,
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
      
      if (response.data && response.data.success) {
        setPreviewImage(null); // Clear the preview image locally
        setMessage('Profile picture removed successfully');
        setTimeout(() => setMessage(null), 3000);
        
        // Refresh profile data after removal
        await fetchProfile();
      } else {
        // Handle unexpected response format
        setError('Unexpected response from server. Please try again.');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('Error removing profile picture:', err);
      const errorMsg = err.response?.data?.message || 'Failed to remove profile picture. Please try again.';
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container mt-4 manage-settings-container">
        <div className="card p-4 manage-settings-card">
          {/* Header section */}
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

export default ManageSettings;
