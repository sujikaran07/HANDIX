
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaStore, FaIdCard, FaEdit, FaShoppingBag, FaHeart, FaSignOutAlt } from 'react-icons/fa';
import '../styles/Account.css'; 

const Account = ({ userData, setUserData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name || '',
    email: userData.email || '',
    phone: userData.phone || '',
    address: userData.address || '',
    businessName: userData.businessName || '',
    taxId: userData.taxId || '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  const isWholesale = userData.hasOwnProperty('businessName') && userData.hasOwnProperty('taxId');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

   
    const updatedUserData = {
      ...userData,
      ...formData
    };

   
    setUserData(updatedUserData);

   
    const savedUser = localStorage.getItem('handixUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      localStorage.setItem('handixUser', JSON.stringify({
        ...parsedUser,
        userData: updatedUserData
      }));
    }

   
    setSuccessMessage('Your account information has been updated successfully.');
    setIsEditing(false);

 
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <div className="account-container">
      <div className="container">
        <h1 className="account-title">My Account</h1>

        <div className="account-grid">
          {}
          <div className="sidebar">
            <div className="profile-header">
              <div className="profile-info">
                <div className="profile-avatar">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="profile-details">
                  <h3 className="profile-name">{userData.name}</h3>
                  <p className="profile-type">{isWholesale ? 'Wholesale Account' : 'Retail Account'}</p>
                </div>
              </div>
            </div>
            <nav className="sidebar-nav">
              <ul className="nav-list">
                <li className="nav-item">
                  <Link to="/account" className="nav-link active">
                    <FaUser className="nav-icon" />
                    Account Information
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/orders" className="nav-link">
                    <FaShoppingBag className="nav-icon" />
                    Order History
                  </Link>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link">
                    <FaHeart className="nav-icon" />
                    Wishlist
                  </a>
                </li>
                {isWholesale && (
                  <li className="nav-item">
                    <Link to="/wholesale" className="nav-link">
                      <FaStore className="nav-icon" />
                      Wholesale Dashboard
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <a href="#" className="nav-link">
                    <FaSignOutAlt className="nav-icon" />
                    Sign Out
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {}
          <div className="main-content">
            <div className="section-header">
              <h2 className="section-title">Account Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="edit-button"
                >
                  <FaEdit className="edit-icon" />
                  Edit
                </button>
              )}
            </div>

            {successMessage && (
              <div className="success-message">
                {successMessage}
              </div>
            )}

            <div className="form-section">
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">Full Name</label>
                      <div className="input-group">
                        <div className="input-icon">
                          <FaUser />
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">Email Address</label>
                      <div className="input-group">
                        <div className="input-icon">
                          <FaEnvelope />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">Phone Number</label>
                      <div className="input-group">
                        <div className="input-icon">
                          <FaPhone />
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="address" className="form-label">Address</label>
                      <div className="input-group">
                        <div className="input-icon">
                          <FaMapMarkerAlt />
                        </div>
                        <textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="textarea-field"
                          required
                        />
                      </div>
                    </div>

                    {isWholesale && (
                      <>
                        <div className="form-group">
                          <label htmlFor="businessName" className="form-label">Business Name</label>
                          <div className="input-group">
                            <div className="input-icon">
                              <FaStore />
                            </div>
                            <input
                              type="text"
                              id="businessName"
                              name="businessName"
                              value={formData.businessName}
                              onChange={handleChange}
                              className="input-field"
                              required
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label htmlFor="taxId" className="form-label">Tax ID / Business Registration</label>
                          <div className="input-group">
                            <div className="input-icon">
                              <FaIdCard />
                            </div>
                            <input
                              type="text"
                              id="taxId"
                              name="taxId"
                              value={formData.taxId}
                              onChange={handleChange}
                              className="input-field"
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="save-button"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="display-grid">
                  <div className="display-item">
                    <h3 className="display-label">Full Name</h3>
                    <p className="display-value">
                      <FaUser className="display-icon" />
                      {userData.name}
                    </p>
                  </div>
                  <div className="display-item">
                    <h3 className="display-label">Email Address</h3>
                    <p className="display-value">
                      <FaEnvelope className="display-icon" />
                      {userData.email}
                    </p>
                  </div>
                  <div className="display-item">
                    <h3 className="display-label">Phone Number</h3>
                    <p className="display-value">
                      <FaPhone className="display-icon" />
                      {userData.phone}
                    </p>
                  </div>
                  <div className="display-item">
                    <h3 className="display-label">Address</h3>
                    <p className="display-value">
                      <FaMapMarkerAlt className="display-icon" />
                      {userData.address}
                    </p>
                  </div>

                  {isWholesale && (
                    <>
                      <div className="display-item">
                        <h3 className="display-label">Business Name</h3>
                        <p className="display-value">
                          <FaStore className="display-icon" />
                          {userData.businessName}
                        </p>
                      </div>
                      <div className="display-item">
                        <h3 className="display-label">Tax ID / Business Registration</h3>
                        <p className="display-value">
                          <FaIdCard className="display-icon" />
                          {userData.taxId}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="password-section">
              <div className="password-header">
                <h2 className="password-title">Password & Security</h2>
              </div>
              <div className="password-content">
                <button className="password-button">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;