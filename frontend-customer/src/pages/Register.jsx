import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaStore, FaIdCard } from 'react-icons/fa';
import '../styles/Register.css';

const Register = ({ loginUser }) => {
  const [accountType, setAccountType] = useState('retail');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    businessName: '',
    taxId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAccountTypeChange = (type) => {
    setAccountType(type);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const user = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      };

      if (accountType === 'wholesale') {
        user.businessName = formData.businessName;
        user.taxId = formData.taxId;
      }

      loginUser(user, accountType);
      navigate('/');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="register-container">
      <div className="container">
        <div className="header">
          <h2>Create an Account</h2>
        </div>
        <div className="content">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="account-type">
            <h3>Account Type</h3>
            <div className="account-buttons">
              <button
                type="button"
                className={`account-button retail ${accountType === 'retail' ? 'active' : ''}`}
                onClick={() => handleAccountTypeChange('retail')}
              >
                <FaUser className="mr-2" />
                <span>Retail Customer</span>
              </button>
              <button
                type="button"
                className={`account-button wholesale ${accountType === 'wholesale' ? 'active' : ''}`}
                onClick={() => handleAccountTypeChange('wholesale')}
              >
                <FaStore className="mr-2" />
                <span>Wholesale Business</span>
              </button>
            </div>
            <p className="account-info">
              {accountType === 'wholesale' 
                ? 'Wholesale customers receive discounted pricing for bulk orders.' 
                : 'Individual customers shopping for personal use.'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name</label>
                <div className="input-group">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <div className="input-group">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-group">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <div className="input-group">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <div className="input-group">
                  <FaPhone className="input-icon" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="address" className="form-label">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-input textarea"
                  placeholder="Enter your address"
                  required
                />
              </div>
            </div>

            {accountType === 'wholesale' && (
              <div className="wholesale-section">
                <h4 className="wholesale-header">Wholesale Account Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="businessName" className="form-label">Business Name</label>
                    <div className="input-group">
                      <FaStore className="input-icon" />
                      <input
                        type="text"
                        id="businessName"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Enter your business name"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="taxId" className="form-label">Tax ID / Business Registration Number</label>
                    <div className="input-group">
                      <FaIdCard className="input-icon" />
                      <input
                        type="text"
                        id="taxId"
                        name="taxId"
                        value={formData.taxId}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Enter your tax ID or business registration"
                        required
                      />
                    </div>
                  </div>
                </div>
                <p className="wholesale-info">
                  Wholesale accounts require verification before accessing wholesale pricing.
                  Our team will review your application and contact you within 1-2 business days.
                </p>
              </div>
            )}

            <div className="terms-agreement">
              <input
                type="checkbox"
                id="termsAgree"
                name="termsAgree"
                className="terms-checkbox"
                required
              />
              <label htmlFor="termsAgree" className="terms-label">
                I agree to the <a href="#" className="terms-link">Terms of Service</a> and <a href="#" className="terms-link">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="footer">
            <p>
              Already have an account?{' '}
              <Link to="/signin" className="text-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;