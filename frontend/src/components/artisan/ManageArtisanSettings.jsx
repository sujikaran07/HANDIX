import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/artisan/ArtisanSettings.css';

const ManageArtisanSettings = ({ onViewSetting }) => {
  const [profile, setProfile] = useState({
    profilePicture: '',
    username: 'artisan_user',
    email: 'artisan@example.com',
    mobileNumber: '123-456-7890',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [passwordForEdit, setPasswordForEdit] = useState('');
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSaveChanges = () => {
    setShowPasswordPopup(true);
  };

  const handleConfirmPassword = () => {
    if (passwordForEdit === profile.currentPassword) {
      setShowPasswordPopup(false);
      setIsEditing(false);
    } else {
      alert('Incorrect password. Please try again.');
    }
  };

  return (
    <>
      <div className="container mt-4 manage-settings-container">
        <div className="card p-4 manage-settings-card">
          <div className="manage-settings-header d-flex justify-content-between align-items-center mb-3">
            <div className="title-section">
              <h4>Account Settings</h4>
            </div>
          </div>

          <div className="profile-section mb-4">
            <h5>Profile Information</h5>
            <div className="row mb-3">
              <div className="col-md-4">
                <label htmlFor="profilePicture" className="form-label">Profile Picture</label>
                <input type="file" className="form-control" id="profilePicture" name="profilePicture" onChange={handleProfileChange} />
              </div>
              <div className="col-md-4">
                <label htmlFor="username" className="form-label">Username</label>
                <input type="text" className="form-control" id="username" name="username" value={profile.username} onChange={handleProfileChange} />
              </div>
              <div className="col-md-4">
                <label htmlFor="email" className="form-label">Email</label>
                <input type="email" className="form-control" id="email" name="email" value={profile.email} onChange={handleProfileChange} disabled />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-4">
                <label htmlFor="mobileNumber" className="form-label">Mobile Number</label>
                <input type="text" className="form-control" id="mobileNumber" name="mobileNumber" value={profile.mobileNumber} onChange={handleProfileChange} />
              </div>
            </div>
          </div>

          <div className="password-section mb-4">
            <h5>Password</h5>
            <div className="row mb-3">
              <div className="col-md-4">
                <label htmlFor="currentPassword" className="form-label">Current Password</label>
                <input type="password" className="form-control" id="currentPassword" name="currentPassword" value={profile.currentPassword} onChange={handleProfileChange} />
              </div>
              <div className="col-md-4">
                <label htmlFor="newPassword" className="form-label">New Password</label>
                <input type="password" className="form-control" id="newPassword" name="newPassword" value={profile.newPassword} onChange={handleProfileChange} />
              </div>
              <div className="col-md-4">
                <label htmlFor="confirmNewPassword" className="form-label">Confirm New Password</label>
                <input type="password" className="form-control" id="confirmNewPassword" name="confirmNewPassword" value={profile.confirmNewPassword} onChange={handleProfileChange} />
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <button className="btn btn-success" onClick={handleSaveChanges}>Save Changes</button>
          </div>

          {showPasswordPopup && (
            <div className="modal password-confirmation-modal">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirm Password</h5>
                    <button type="button" className="btn-close" onClick={() => setShowPasswordPopup(false)}></button>
                  </div>
                  <div className="modal-body">
                    <label htmlFor="passwordForEdit" className="form-label">Enter Password to Confirm</label>
                    <input type="password" className="form-control" id="passwordForEdit" name="passwordForEdit" value={passwordForEdit} onChange={(e) => setPasswordForEdit(e.target.value)} />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordPopup(false)}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={handleConfirmPassword}>Confirm</button>
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
