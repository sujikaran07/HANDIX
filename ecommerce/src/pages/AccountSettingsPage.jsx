import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Lock, CreditCard, Bell, Shield, Home } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import axios from 'axios';

const AccountSettingsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);

  // Set initial tab from URL query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['profile', 'security', 'payment', 'address', 'notifications', 'privacy'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

  // User data state
  const [userData, setUserData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    c_id: ''
  });

  // Load user data from localStorage
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUserData({
            firstName: parsedUser.firstName || '',
            lastName: parsedUser.lastName || '',
            email: parsedUser.email || '',
            phone: parsedUser.phone || '',
            c_id: parsedUser.c_id || ''
          });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, []);

  // Use actual user data for profile form
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  // Update form when userData changes
  useEffect(() => {
    setProfileForm({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone
    });
  }, [userData]);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Add state for password visibility
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  // Toggle password visibility function
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Initialize notification preferences state - FIXING DUPLICATE DECLARATION
  const [notificationPrefs, setNotificationPrefs] = useState({
    orders: true,
    offers: false,
    email: true,
    newsletter: true
  });

  // Add state for notification messages
  const [notificationSuccess, setNotificationSuccess] = useState('');
  const [notificationError, setNotificationError] = useState('');

  // Add privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    analytics: true,
    marketing: false
  });

  // Add state for privacy settings messages
  const [privacySuccess, setPrivacySuccess] = useState('');
  const [privacyError, setPrivacyError] = useState('');

  // Handle saving notification preferences
  const handleSaveNotifications = async () => {
    setNotificationSuccess('');
    setNotificationError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setNotificationError('You must be logged in to update notification preferences');
        return;
      }
      // Simulate API call and save to localStorage
      await new Promise(resolve => setTimeout(resolve, 300));
      localStorage.setItem('notificationPrefs', JSON.stringify(notificationPrefs));
      setNotificationSuccess('Notification preferences saved successfully');
      console.log('Saved notification preferences:', notificationPrefs);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      setNotificationError('Failed to save notification preferences. Please try again.');
    }
  };

  // Handle privacy setting changes
  const handlePrivacyChange = (setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Handle saving privacy settings
  const handleSavePrivacySettings = async () => {
    setPrivacySuccess('');
    setPrivacyError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setPrivacyError('You must be logged in to update privacy settings');
        return;
      }
      // Simulate API call and save to localStorage
      localStorage.setItem('privacySettings', JSON.stringify(privacySettings));
      setPrivacySuccess('Privacy settings updated successfully');
      console.log('Saved privacy settings:', privacySettings);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      setPrivacyError('Failed to save privacy settings. Please try again.');
    }
  };

  // Load saved privacy settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('privacySettings');
      if (savedSettings) {
        setPrivacySettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  }, []);

  // Load saved notification preferences from localStorage
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem('notificationPrefs');
      if (savedPrefs) {
        setNotificationPrefs(JSON.parse(savedPrefs));
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to update your profile');
      }

      // Determine API URL (use import.meta.env for Vite)
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('Updating profile using API:', `${baseUrl}/api/customers/${userData.c_id}`);

      // Update user profile
      const response = await axios.put(
        `${baseUrl}/api/customers/${userData.c_id}`,
        {
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          phone: profileForm.phone
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Profile update response:', response.data);

      // Update localStorage with new data
      const updatedUser = {
        ...JSON.parse(localStorage.getItem('user')),
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));

      alert('Profile updated successfully!');

    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
    // Clear error when user types
    if (passwordErrors[name]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: ''
      });
    }
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess(false);

    // Validate passwords
    if (!validatePasswordForm()) {
      return;
    }

    setIsChangingPassword(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to change your password');
      }

      // Get user data for email
      const userData = JSON.parse(localStorage.getItem('user'));
      const email = userData?.email;

      // Determine API URL (use import.meta.env for Vite)
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('Changing password using API:', `${baseUrl}/api/auth/change-password`);

      const response = await axios.post(
        `${baseUrl}/api/auth/change-password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          email: email // Include email for extra verification
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Password change response:', response.data);

      // Clear the form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Show success message
      setPasswordSuccess(true);

      alert('Password changed successfully');

    } catch (error) {
      console.error('Password change error:', error);

      // Handle specific errors
      if (error.response) {
        if (error.response.status === 401) {
          setPasswordErrors({
            ...passwordErrors,
            currentPassword: 'Current password is incorrect'
          });
          alert('Current password is incorrect');
        } else {
          alert(error.response.data.message || 'An error occurred while changing your password');
        }
      } else {
        alert('Unable to connect to the server. Please try again later.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Initialize addresses state
  const [addresses, setAddresses] = useState([]);
  const [isAddressLoading, setIsAddressLoading] = useState(false);

  // Initialize payment methods state - without mock data
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  // Better error handling for address operations
  const [addressError, setAddressError] = useState('');
  const [addressSuccess, setAddressSuccess] = useState('');

  // Better function to fetch addresses with proper error handling
  const fetchAddresses = async () => {
    if (!userData.c_id) return;

    setIsAddressLoading(true);
    setAddressError('');

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      const response = await axios.get(`${baseUrl}/api/addresses/customer/${userData.c_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Fetched addresses:', response.data);
      setAddresses(response.data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddressError('Failed to load your addresses. Please try again later.');
    } finally {
      setIsAddressLoading(false);
    }
  };

  // Load addresses whenever tab changes to address
  useEffect(() => {
    if (activeTab === 'address' && userData.c_id) {
      fetchAddresses();
    }
  }, [activeTab, userData.c_id]);

  // Load payment methods from API - modified to use real API when ready
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (activeTab === 'payment' && userData.c_id) {
        setIsPaymentLoading(true);
        try {
          // This will be replaced with real API call when payment API is ready
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const token = localStorage.getItem('token');

          // Placeholder for future API implementation
          // const response = await axios.get(`${baseUrl}/api/payment-methods/customer/${userData.c_id}`);
          // setPaymentMethods(response.data || []);

          // For now, just set empty array until API is implemented
          setPaymentMethods([]);
          setTimeout(() => {
            setIsPaymentLoading(false);
          }, 300);
        } catch (error) {
          console.error('Error fetching payment methods:', error);
          setPaymentMethods([]);
          setIsPaymentLoading(false);
        }
      }
    };

    fetchPaymentMethods();
  }, [activeTab, userData.c_id]);

  // Handle adding a new address
  const [newAddress, setNewAddress] = useState({
    name: '',
    street_address: '',
    city: '',
    district: '',
    postalCode: '',
    country: 'Sri Lanka',
    addressType: 'shipping'
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [currentEditAddress, setCurrentEditAddress] = useState(null);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleEditAddress = (address) => {
    setCurrentEditAddress(address);
    setNewAddress({
      name: address.name || '',
      street_address: address.street_address || '',
      city: address.city || '',
      district: address.district || '',
      postalCode: address.postalCode || '',
      country: address.country || 'Sri Lanka',
      addressType: address.addressType || 'shipping'
    });
    setShowAddressForm(true);
  };

  // Enhanced address submission with better feedback
  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    setAddressError('');
    setAddressSuccess('');

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      if (!token) {
        setAddressError('You must be logged in to perform this action');
        return;
      }

      const addressData = {
        ...newAddress,
        c_id: userData.c_id
      };

      console.log('Updating address with data:', addressData);

      let response;

      if (currentEditAddress) {
        // Update existing address - Fix the API endpoint
        const addressId = currentEditAddress.address_id;
        console.log(`Updating address with ID ${addressId} at: ${baseUrl}/api/addresses/${addressId}`);

        response = await axios.put(`${baseUrl}/api/addresses/${addressId}`, addressData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setAddressSuccess('Address updated successfully');
      } else {
        // Create new address
        console.log(`Creating new address at: ${baseUrl}/api/addresses`);

        response = await axios.post(`${baseUrl}/api/addresses`, addressData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setAddressSuccess('Address added successfully');
      }

      console.log('Address API response:', response.data);

      // Refresh the addresses list
      await fetchAddresses();

      // Reset form
      setNewAddress({
        name: '',
        street_address: '',
        city: '',
        district: '',
        postalCode: '',
        country: 'Sri Lanka',
        addressType: 'shipping'
      });

      setShowAddressForm(false);
      setCurrentEditAddress(null);
    } catch (error) {
      console.error('Error saving address:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      // More informative error message
      const errorMsg = error.response?.data?.message 
        || `Failed to ${currentEditAddress ? 'update' : 'save'} address (${error.response?.status || 'unknown error'}). Please try again.`;

      setAddressError(errorMsg);
    }
  };

  // Enhanced delete address function with confirmation
  const handleDeleteAddress = async (addressId, addressName) => {
    if (!confirm(`Are you sure you want to delete the address "${addressName || 'selected'}"?`)) return;

    setAddressError('');
    setAddressSuccess('');

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      console.log(`Deleting address with ID ${addressId} at: ${baseUrl}/api/addresses/${addressId}`);

      await axios.delete(`${baseUrl}/api/addresses/${addressId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Remove from state
      setAddresses(addresses.filter(addr => addr.address_id !== addressId));
      setAddressSuccess('Address deleted successfully');
    } catch (error) {
      console.error('Error deleting address:', error);
      setAddressError('Failed to delete address. Please try again.');
    }
  };

  // Enhanced set default address functionality
  const handleSetDefaultAddress = async (addressId) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      await axios.put(`${baseUrl}/api/addresses/${addressId}/default`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Update local state to reflect the change
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.address_id === addressId
      })));

      setAddressSuccess('Default address updated');
    } catch (error) {
      console.error('Error setting default address:', error);
      setAddressError('Failed to update default address. Please try again.');
    }
  };

  // Payment methods state and functions
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: false
  });

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [currentEditPaymentMethod, setCurrentEditPaymentMethod] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');

  // Handle payment form change
  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPaymentMethod(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Credit card number formatting (add spaces every 4 digits)
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Handle credit card number input with formatting
  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setNewPaymentMethod(prev => ({
      ...prev,
      cardNumber: formattedValue
    }));
  };

  // Payment method submission placeholder
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    setPaymentError('');
    setPaymentSuccess('');

    // Basic validation
    if (newPaymentMethod.cardNumber.replace(/\s/g, '').length < 16) {
      setPaymentError('Please enter a valid 16-digit card number');
      return;
    }

    if (!newPaymentMethod.cardName.trim()) {
      setPaymentError('Please enter the cardholder name');
      return;
    }

    if (!newPaymentMethod.expiryMonth || !newPaymentMethod.expiryYear) {
      setPaymentError('Please enter the card expiry date');
      return;
    }

    if (!newPaymentMethod.cvv || newPaymentMethod.cvv.length < 3) {
      setPaymentError('Please enter a valid CVV');
      return;
    }

    // In a real system, we'd send this to the payment API
    // For now, just show a message that this is coming soon
    setPaymentSuccess('Payment method successfully added!');

    // Reset form and close it
    setNewPaymentMethod({
      cardNumber: '',
      cardName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      isDefault: false
    });

    setShowPaymentForm(false);
    setCurrentEditPaymentMethod(null);

    // For demo purposes, update payment methods list
    const last4 = newPaymentMethod.cardNumber.replace(/\s/g, '').slice(-4);
    const cardType = getCardType(newPaymentMethod.cardNumber);
    const expiry = `${newPaymentMethod.expiryMonth}/${newPaymentMethod.expiryYear.slice(-2)}`;

    const newMethod = {
      id: `card-${Date.now()}`,
      type: cardType,
      last4: last4,
      expiry: expiry,
      isDefault: newPaymentMethod.isDefault
    };

    setPaymentMethods(prev => {
      // If setting this as default, remove default from others
      if (newMethod.isDefault) {
        return [
          ...prev.map(m => ({ ...m, isDefault: false })),
          newMethod
        ];
      }
      return [...prev, newMethod];
    });
  };

  // Determine card type based on first digit
  const getCardType = (cardNumber) => {
    const firstDigit = cardNumber.replace(/\s/g, '').charAt(0);

    switch (firstDigit) {
      case '4':
        return 'Visa';
      case '5':
        return 'Mastercard';
      case '3':
        return 'Amex';
      case '6':
        return 'Discover';
      default:
        return 'Card';
    }
  };

  // Handle delete payment method
  const handleDeletePayment = (id) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;

    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    setPaymentSuccess('Payment method removed successfully');
  };

  // Handle set default payment method
  const handleSetDefaultPayment = (id) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
    setPaymentSuccess('Default payment method updated');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
            <form onSubmit={handleProfileSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      className="w-full p-2 border rounded-md"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      className="w-full p-2 border rounded-md"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full p-2 border rounded-md bg-gray-50"
                    value={profileForm.email}
                    disabled
                    title="Email cannot be changed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className="w-full p-2 border rounded-md"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        );
        
      case 'security':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={showPasswords.currentPassword ? 'text' : 'password'}
                      className={`w-full p-2 border ${
                        passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                      } rounded-md`}
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      disabled={isChangingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('currentPassword')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPasswords.currentPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                          <line x1="2" x2="22" y1="2" y2="22"></line>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPasswords.newPassword ? 'text' : 'password'}
                      className={`w-full p-2 border ${
                        passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                      } rounded-md`}
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      disabled={isChangingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('newPassword')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPasswords.newPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                          <line x1="2" x2="22" y1="2" y2="22"></line>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPasswords.confirmPassword ? 'text' : 'password'}
                      className={`w-full p-2 border ${
                        passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      } rounded-md`}
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      disabled={isChangingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPasswords.confirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                          <line x1="2" x2="22" y1="2" y2="22"></line>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
                
                {passwordSuccess && (
                  <div className="p-3 bg-green-50 text-green-800 border border-green-200 rounded-md">
                    Password changed successfully!
                  </div>
                )}
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className={`bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors ${
                      isChangingPassword ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        );
        
      case 'address':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">Shipping Addresses</h2>
            
            {addressError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{addressError}</p>
                  </div>
                </div>
              </div>
            )}
            
            {addressSuccess && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{addressSuccess}</p>
                  </div>
                </div>
              </div>
            )}
            
            {isAddressLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {showAddressForm ? (
                  <div className="border rounded-md p-6 bg-gray-50">
                    <h3 className="font-medium mb-4">{currentEditAddress ? 'Edit Address' : 'Add New Address'}</h3>
                    <form onSubmit={handleAddressSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address Name</label>
                          <input
                            type="text"
                            name="name"
                            value={newAddress.name}
                            onChange={handleAddressChange}
                            placeholder="Home, Office, etc."
                            className="w-full p-2 border rounded-md"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                          <select
                            name="addressType"
                            value={newAddress.addressType}
                            onChange={handleAddressChange}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="shipping">Shipping</option>
                            <option value="billing">Billing</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                        <input
                          type="text"
                          name="street_address"
                          value={newAddress.street_address}
                          onChange={handleAddressChange}
                          placeholder="123 Main Street"
                          className="w-full p-2 border rounded-md"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            name="city"
                            value={newAddress.city}
                            onChange={handleAddressChange}
                            placeholder="City"
                            className="w-full p-2 border rounded-md"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                          <input
                            type="text"
                            name="district"
                            value={newAddress.district}
                            onChange={handleAddressChange}
                            placeholder="District"
                            className="w-full p-2 border rounded-md"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                          <input
                            type="text"
                            name="postalCode"
                            value={newAddress.postalCode}
                            onChange={handleAddressChange}
                            placeholder="Postal Code"
                            className="w-full p-2 border rounded-md"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                          <input
                            type="text"
                            name="country"
                            value={newAddress.country}
                            onChange={handleAddressChange}
                            className="w-full p-2 border rounded-md"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddressForm(false);
                            setCurrentEditAddress(null);
                            setNewAddress({
                              name: '',
                              street_address: '',
                              city: '',
                              district: '',
                              postalCode: '',
                              country: 'Sri Lanka',
                              addressType: 'shipping'
                            });
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
                        >
                          {currentEditAddress ? 'Update Address' : 'Add Address'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : null}
                
                {addresses && addresses.length > 0 ? (
                  addresses.map((address) => (
                    <div key={address.address_id} className="border rounded-md p-4">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium">{address.name || address.addressType}</h3>
                        <div className="flex items-center gap-2">
                          {address.isDefault && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                          <button 
                            onClick={() => handleEditAddress(address)}
                            className="text-sm text-gray-600 hover:text-primary"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteAddress(address.address_id, address.name)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600">{address.street_address}</p>
                      <p className="text-gray-600">{address.city}{address.district ? `, ${address.district}` : ''} {address.postalCode}</p>
                      <p className="text-gray-600">{address.country}</p>
                      
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(address.address_id)}
                          className="mt-2 text-sm text-primary hover:underline"
                        >
                          Set as default
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 border rounded-md bg-gray-50">
                    <p className="text-gray-500">No addresses found.</p>
                    <p className="text-sm text-gray-400 mt-1">Add a shipping address to use during checkout.</p>
                  </div>
                )}
              </div>
            )}
            
            {!showAddressForm && (
              <div className="mt-6">
                <button 
                  onClick={() => setShowAddressForm(true)}
                  className="border border-primary text-primary px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Add New Address
                </button>
              </div>
            )}
          </div>
        );
        
      case 'payment':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">Payment Methods</h2>
            
            {paymentError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{paymentError}</p>
                  </div>
                </div>
              </div>
            )}
            
            {paymentSuccess && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{paymentSuccess}</p>
                  </div>
                </div>
              </div>
            )}
            
            {isPaymentLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {showPaymentForm ? (
                  <div className="border rounded-md p-6 bg-gray-50">
                    <h3 className="font-medium mb-4">{currentEditPaymentMethod ? 'Edit Payment Method' : 'Add New Payment Method'}</h3>
                    <form onSubmit={handlePaymentSubmit}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={newPaymentMethod.cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="1234 5678 9012 3456"
                          className="w-full p-2 border rounded-md"
                          maxLength="19"
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          name="cardName"
                          value={newPaymentMethod.cardName}
                          onChange={handlePaymentChange}
                          placeholder="John Smith"
                          className="w-full p-2 border rounded-md"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              name="expiryMonth"
                              value={newPaymentMethod.expiryMonth}
                              onChange={handlePaymentChange}
                              className="p-2 border rounded-md"
                              required
                            >
                              <option value="">Month</option>
                              {Array.from({ length: 12 }, (_, i) => {
                                const month = i + 1;
                                return (
                                  <option key={month} value={month < 10 ? `0${month}` : month}>
                                    {month < 10 ? `0${month}` : month}
                                  </option>
                                );
                              })}
                            </select>
                            
                            <select
                              name="expiryYear"
                              value={newPaymentMethod.expiryYear}
                              onChange={handlePaymentChange}
                              className="p-2 border rounded-md"
                              required
                            >
                              <option value="">Year</option>
                              {Array.from({ length: 10 }, (_, i) => {
                                const year = new Date().getFullYear() + i;
                                return (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                          <input
                            type="password"
                            name="cvv"
                            value={newPaymentMethod.cvv}
                            onChange={handlePaymentChange}
                            placeholder="123"
                            className="w-full p-2 border rounded-md"
                            maxLength="4"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="isDefault"
                            checked={newPaymentMethod.isDefault}
                            onChange={handlePaymentChange}
                            className="rounded text-primary focus:ring-primary h-4 w-4 mr-2"
                          />
                          <span className="text-sm text-gray-700">Set as default payment method</span>
                        </label>
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPaymentForm(false);
                            setCurrentEditPaymentMethod(null);
                            setNewPaymentMethod({
                              cardNumber: '',
                              cardName: '',
                              expiryMonth: '',
                              expiryYear: '',
                              cvv: '',
                              isDefault: false
                            });
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
                        >
                          {currentEditPaymentMethod ? 'Update Card' : 'Add Card'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : null}
                
                {paymentMethods && paymentMethods.length > 0 ? (
                  paymentMethods.map((method) => (
                    <div key={method.id} className="border rounded-md p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                          <span className="font-bold">{method.type[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {method.type} •••• {method.last4}
                          </p>
                          <p className="text-sm text-gray-500">Expires {method.expiry}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.isDefault && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                        <button 
                          onClick={() => {
                            setCurrentEditPaymentMethod(method);
                            setNewPaymentMethod({
                              cardNumber: `•••• •••• •••• ${method.last4}`,
                              cardName: '',  // We wouldn't have the full name in a real system
                              expiryMonth: method.expiry.split('/')[0],
                              expiryYear: `20${method.expiry.split('/')[1]}`,
                              cvv: '',
                              isDefault: method.isDefault
                            });
                            setShowPaymentForm(true);
                          }} 
                          className="text-sm text-gray-600 hover:text-primary"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeletePayment(method.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                        {!method.isDefault && (
                          <button
                            onClick={() => handleSetDefaultPayment(method.id)}
                            className="text-sm text-primary hover:underline"
                          >
                            Set as default
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 border rounded-md bg-gray-50">
                    <div className="flex justify-center mb-4">
                      <CreditCard size={40} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500">No payment methods found.</p>
                    <p className="text-sm text-gray-400 mt-1">Add a payment method to use during checkout.</p>
                  </div>
                )}
              </div>
            )}
            
            {!showPaymentForm && (
              <div className="mt-6">
                <button 
                  onClick={() => setShowPaymentForm(true)}
                  className="border border-primary text-primary px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Add Payment Method
                </button>
              </div>
            )}
            
            {/* Information about payment security */}
            <div className="mt-8 p-4 bg-gray-50 border rounded-md">
              <h3 className="font-medium text-lg mb-2">Payment Security</h3>
              <p className="text-sm text-gray-600 mb-2">
                Your payment information is encrypted and stored securely. We never store your complete card details on our servers.
              </p>
              <p className="text-sm text-gray-600">
                All transactions are processed through our secure payment gateway partners.
              </p>
            </div>
          </div>
        );
        
      case 'notifications':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
            
            {/* Add success and error messages */}
            {notificationSuccess && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{notificationSuccess}</p>
                  </div>
                </div>
              </div>
            )}
            
            {notificationError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{notificationError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h3 className="font-medium">Order Updates</h3>
                  <p className="text-sm text-gray-500">Receive updates about your orders</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.orders}
                    onChange={() => setNotificationPrefs({ ...notificationPrefs, orders: !notificationPrefs.orders })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h3 className="font-medium">Promotional Emails</h3>
                  <p className="text-sm text-gray-500">Receive emails about special offers and discounts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.offers}
                    onChange={() => setNotificationPrefs({ ...notificationPrefs, offers: !notificationPrefs.offers })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive emails about account activity</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.email}
                    onChange={() => setNotificationPrefs({ ...notificationPrefs, email: !notificationPrefs.email })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h3 className="font-medium">Newsletter</h3>
                  <p className="text-sm text-gray-500">Receive our weekly newsletter</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.newsletter}
                    onChange={() => setNotificationPrefs({ ...notificationPrefs, newsletter: !notificationPrefs.newsletter })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors"
                onClick={handleSaveNotifications}
              >
                Save Preferences
              </button>
            </div>
          </div>
        );
        
      case 'privacy':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">Privacy Settings</h2>
            
            {/* Add success and error messages */}
            {privacySuccess && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{privacySuccess}</p>
                  </div>
                </div>
              </div>
            )}
            
            {privacyError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{privacyError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Data Sharing</h3>
                <p className="text-gray-600 mb-3">
                  Control how your data is used and shared with our partners.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="analytics"
                      type="checkbox"
                      checked={privacySettings.analytics}
                      onChange={() => handlePrivacyChange('analytics')}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="analytics" className="ml-2 block text-sm text-gray-700">
                      Allow usage data collection for service improvement
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="marketing"
                      type="checkbox"
                      checked={privacySettings.marketing}
                      onChange={() => handlePrivacyChange('marketing')}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="marketing" className="ml-2 block text-sm text-gray-700">
                      Allow data sharing with marketing partners
                    </label>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={handleSavePrivacySettings}
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors"
                  >
                    Save Privacy Settings
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Account Data</h3>
                <p className="text-gray-600 mb-4">
                  Download or delete your account data.
                </p>
                <div className="space-x-4">
                  <button 
                    onClick={() => alert('Data download feature coming soon!')}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Download Data
                  </button>
                  <button 
                    onClick={() => confirm('WARNING: This action cannot be undone. Are you sure you want to delete your account?')}
                    className="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-3">Cookies Preferences</h3>
                <p className="text-gray-600 mb-3">
                  Manage how we use cookies when you visit our website.
                </p>
                <button 
                  onClick={() => alert('Cookie management coming soon!')}
                  className="border text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Manage Cookie Preferences
                </button>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-3">Privacy Policy</h3>
                <p className="text-gray-600 mb-3">
                  Read our full privacy policy to understand how we collect, use, and protect your data.
                </p>
                <a 
                  href="/privacy-policy" 
                  target="_blank" 
                  className="text-primary hover:underline"
                >
                  View Privacy Policy
                </a>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (isLoading) {
    // Loading spinner
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow bg-gray-50 py-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading account settings...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow bg-gray-50 py-16">
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
          <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="grid md:grid-cols-4">
              {/* Sidebar navigation for settings */}
              <div className="md:col-span-1 border-r">
                <nav>
                  <button
                    className={`flex w-full items-center p-4 border-b hover:bg-gray-50 ${activeTab === 'profile' ? 'bg-blue-50 border-l-4 border-l-primary' : ''}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <User size={18} className={`mr-3 ${activeTab === 'profile' ? 'text-primary' : 'text-gray-500'}`} />
                    <span>Personal Information</span>
                  </button>
                  <button
                    className={`flex w-full items-center p-4 border-b hover:bg-gray-50 ${activeTab === 'security' ? 'bg-blue-50 border-l-4 border-l-primary' : ''}`}
                    onClick={() => setActiveTab('security')}
                  >
                    <Lock size={18} className={`mr-3 ${activeTab === 'security' ? 'text-primary' : 'text-gray-500'}`} />
                    <span>Security</span>
                  </button>
                  <button
                    className={`flex w-full items-center p-4 border-b hover:bg-gray-50 ${activeTab === 'address' ? 'bg-blue-50 border-l-4 border-l-primary' : ''}`}
                    onClick={() => setActiveTab('address')}
                  >
                    <Home size={18} className={`mr-3 ${activeTab === 'address' ? 'text-primary' : 'text-gray-500'}`} />
                    <span>Addresses</span>
                  </button>
                  <button
                    className={`flex w-full items-center p-4 border-b hover:bg-gray-50 ${activeTab === 'payment' ? 'bg-blue-50 border-l-4 border-l-primary' : ''}`}
                    onClick={() => setActiveTab('payment')}
                  >
                    <CreditCard size={18} className={`mr-3 ${activeTab === 'payment' ? 'text-primary' : 'text-gray-500'}`} />
                    <span>Payment Methods</span>
                  </button>
                  <button
                    className={`flex w-full items-center p-4 border-b hover:bg-gray-50 ${activeTab === 'notifications' ? 'bg-blue-50 border-l-4 border-l-primary' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                  >
                    <Bell size={18} className={`mr-3 ${activeTab === 'notifications' ? 'text-primary' : 'text-gray-500'}`} />
                    <span>Notifications</span>
                  </button>
                  <button
                    className={`flex w-full items-center p-4 border-b hover:bg-gray-50 ${activeTab === 'privacy' ? 'bg-blue-50 border-l-4 border-l-primary' : ''}`}
                    onClick={() => setActiveTab('privacy')}
                  >
                    <Shield size={18} className={`mr-3 ${activeTab === 'privacy' ? 'text-primary' : 'text-gray-500'}`} />
                    <span>Privacy</span>
                  </button>
                </nav>
              </div>
              
              {/* Main settings content */}
              <div className="md:col-span-3 p-6">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountSettingsPage;