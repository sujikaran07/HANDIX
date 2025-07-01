import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Upload, X } from 'lucide-react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addressLoaded, setAddressLoaded] = useState(false);

  // User state from localStorage
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profilePicture: null,
    c_id: ''
  });

  // Form state for profile editing
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    country: '',
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Validation helpers
  const validateName = (name) => /^[A-Za-z ]+$/.test(name.trim());
  const validatePhone = (phone) => /^\d{10}$/.test(phone);
  const validatePassword = (password) => password.length === 0 || password.length >= 8;

  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Load user and address data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setFormData(prevState => ({
            ...prevState,
            firstName: parsedUser.firstName || '',
            lastName: parsedUser.lastName || '',
            email: parsedUser.email || '',
            phone: parsedUser.phone || '',
          }));
          if (parsedUser.profilePicture) {
            setPreviewUrl(parsedUser.profilePicture);
          }
          // Fetch address if customer ID exists
          if (parsedUser.c_id) {
            try {
              const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
              const addressApiUrl = `${baseUrl}/api/addresses/customer/${parsedUser.c_id}`;
              const token = localStorage.getItem('token');
              const addressResponse = await axios.get(addressApiUrl, {
                headers: {
                  'Authorization': token ? `Bearer ${token}` : undefined
                }
              });
              if (addressResponse.data && Array.isArray(addressResponse.data) && addressResponse.data.length > 0) {
                const primaryAddress = addressResponse.data[0];
                setFormData(prevState => ({
                  ...prevState,
                  address: primaryAddress.street_address || '',
                  city: primaryAddress.city || '',
                  district: primaryAddress.district || '',
                  country: primaryAddress.country || 'Sri Lanka',
                }));
                setAddressLoaded(true);
              } else {
                setAddressLoaded(false);
              }
            } catch (apiError) {
              setAddressLoaded(false);
            }
          }
        }
      } catch (error) {
        // Handle user data load error
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;
    if (name === 'firstName' || name === 'lastName') {
      filteredValue = value.replace(/[^A-Za-z ]/g, '');
    }
    if (name === 'phone') {
      filteredValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    setFormData(prevState => ({
      ...prevState,
      [name]: filteredValue
    }));
  };

  // Handle profile picture file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Maximum size is 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    setProfilePicture(file);
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Remove selected profile picture
  const removeProfilePicture = () => {
    setProfilePicture(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle profile form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFirstNameError('');
    setLastNameError('');
    setPhoneError('');
    setPasswordError('');
    let valid = true;
    if (!validateName(formData.firstName)) {
      setFirstNameError('First name can only contain letters and spaces.');
      valid = false;
    }
    if (!validateName(formData.lastName)) {
      setLastNameError('Last name can only contain letters and spaces.');
      valid = false;
    }
    if (formData.phone && !validatePhone(formData.phone)) {
      setPhoneError('Phone number must be exactly 10 digits.');
      valid = false;
    }
    if (!valid) return;

    try {
      // Upload profile image if changed
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      let profileImageUrl = previewUrl;
      if (profilePicture && previewUrl) {
        try {
          const profileImageResponse = await axios.post(
            `${baseUrl}/api/profileImages/${user.c_id}`,
            { image: previewUrl },
            {
              headers: {
                'Authorization': token ? `Bearer ${token}` : undefined,
                'Content-Type': 'application/json'
              }
            }
          );
          profileImageUrl = profileImageResponse.data.image_url;
        } catch (imageError) {
          // Continue if image upload fails
        }
      }
      // Update user profile
      const userApiUrl = `${baseUrl}/api/customers/${user.c_id}`;
      await axios.put(userApiUrl, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      }, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined
        }
      });
      // Update or create address
      const addressData = {
        street_address: formData.address,
        city: formData.city,
        district: formData.district,
        country: formData.country || 'Sri Lanka',
        c_id: user.c_id,
        addressType: 'shipping'
      };
      let addressResponse;
      if (addressLoaded) {
        const getAddressesResponse = await axios.get(`${baseUrl}/api/addresses/customer/${user.c_id}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined
          }
        });
        if (getAddressesResponse.data && Array.isArray(getAddressesResponse.data) && getAddressesResponse.data.length > 0) {
          const addressId = getAddressesResponse.data[0].address_id;
          addressResponse = await axios.put(`${baseUrl}/api/addresses/${addressId}`, addressData, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : undefined
            }
          });
        } else {
          addressResponse = await axios.post(`${baseUrl}/api/addresses`, addressData, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : undefined
            }
          });
        }
      } else {
        addressResponse = await axios.post(`${baseUrl}/api/addresses`, addressData, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined
          }
        });
      }
      // Update localStorage with new user data
      const addressParts = [
        formData.address,
        formData.district,
        formData.country
      ].filter(Boolean);
      const formattedAddress = addressParts.join(', ');
      const updatedUser = {
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        profilePicture: profileImageUrl,
        address: formattedAddress
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      // Handle profile update error
      let errorMessage = 'An error occurred while updating your profile.';
      if (error.response?.status === 404) {
        errorMessage += ' The address update endpoint was not found.';
      } else if (error.response?.status === 401) {
        errorMessage += ' You may need to log in again.';
      }
      alert(errorMessage + ' Please try again.');
    }
  };

  // Cancel and go back to profile page
  const handleCancel = () => {
    navigate('/profile');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow bg-gray-50 py-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile information...</p>
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
          <div className="flex items-center mb-6">
            <button 
              onClick={handleCancel}
              className="mr-3 p-1 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Back to profile"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold">Edit Profile</h1>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Picture Section */}
              <div className="w-full md:w-1/3 flex flex-col items-center">
                {previewUrl ? (
                  <div className="relative">
                    <img 
                      src={previewUrl} 
                      alt="Profile" 
                      className="h-32 w-32 rounded-full object-cover"
                    />
                    <button 
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      onClick={removeProfilePicture}
                      aria-label="Remove profile picture"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={64} className="text-gray-400" />
                  </div>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                <button 
                  className="mt-4 py-2 px-4 border border-primary text-primary rounded-md hover:bg-blue-50 transition-colors flex items-center gap-2"
                  onClick={triggerFileInput}
                >
                  <Upload size={16} />
                  {previewUrl ? 'Change Photo' : 'Upload Photo'}
                </button>
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Maximum file size: 5MB<br/>
                  Supported formats: JPEG, PNG
                </p>
              </div>
              
              {/* Form Section */}
              <div className="w-full md:w-2/3">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        required
                      />
                      {firstNameError && <div className="text-danger small">{firstNameError}</div>}
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        required
                      />
                      {lastNameError && <div className="text-danger small">{lastNameError}</div>}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary bg-gray-50"
                        disabled
                        title="Email address cannot be changed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Contact support to change email</p>
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                      {phoneError && <div className="text-danger small">{phoneError}</div>}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">District</label>
                      <input
                        type="text"
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="py-2 px-6 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-6 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditProfilePage;
