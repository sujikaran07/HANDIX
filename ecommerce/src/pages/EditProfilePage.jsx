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
  
  // Get user data from localStorage
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profilePicture: null,
    c_id: ''
  });
  
  // State for form data and profile picture
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '', // street_address in the DB
    city: '',
    district: '', // district in the DB (not state)
    country: '',
  });
  
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Load user data from localStorage and fetch address from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const userData = localStorage.getItem('user');
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          console.log('User data from localStorage:', parsedUser);
          
          // Initialize form data with user data
          setFormData(prevState => ({
            ...prevState,
            firstName: parsedUser.firstName || '',
            lastName: parsedUser.lastName || '',
            email: parsedUser.email || '',
            phone: parsedUser.phone || '',
          }));
          
          // Set profile picture if it exists
          if (parsedUser.profilePicture) {
            setPreviewUrl(parsedUser.profilePicture);
          }
          
          // If we have a customer ID, fetch address directly from the address table
          if (parsedUser.c_id) {
            console.log('Customer ID found:', parsedUser.c_id);
            
            try {
              // Direct API endpoint for addresses by customer ID - with more detailed logging
              // Use import.meta.env instead of process.env for Vite
              const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
              const addressApiUrl = `${baseUrl}/api/addresses/customer/${parsedUser.c_id}`;
              console.log('Fetching address from URL:', addressApiUrl);
              
              const token = localStorage.getItem('token');
              console.log('Using auth token:', token ? 'Present' : 'Missing');
              
              const addressResponse = await axios.get(addressApiUrl, {
                headers: {
                  'Authorization': token ? `Bearer ${token}` : undefined
                }
              });
              
              console.log('Address API response status:', addressResponse.status);
              console.log('Address API response data:', JSON.stringify(addressResponse.data));
              
              // If addresses found, use the first one (or default)
              if (addressResponse.data && Array.isArray(addressResponse.data) && addressResponse.data.length > 0) {
                // Look for default address first
                const primaryAddress = addressResponse.data[0];
                
                console.log('Selected address for form:', JSON.stringify(primaryAddress));
                
                // Check if fields exist in the primaryAddress object
                console.log('street_address exists:', !!primaryAddress.street_address);
                console.log('city exists:', !!primaryAddress.city);
                console.log('district exists:', !!primaryAddress.district);
                console.log('country exists:', !!primaryAddress.country);
                
                setFormData(prevState => ({
                  ...prevState,
                  address: primaryAddress.street_address || '',
                  city: primaryAddress.city || '',
                  district: primaryAddress.district || '', 
                  country: primaryAddress.country || 'Sri Lanka',
                }));
                
                setAddressLoaded(true);
                console.log('Address loaded from address table');
              } else {
                console.log('No addresses found for customer ID:', parsedUser.c_id);
                setAddressLoaded(false);
              }
            } catch (apiError) {
              console.error('Error fetching address data:', apiError);
              console.error('Error details:', apiError.response?.data || 'No response data');
              console.error('Error status:', apiError.response?.status);
              setAddressLoaded(false);
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Maximum size is 5MB.');
      return;
    }
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Store file for upload
    setProfilePicture(file);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  const removeProfilePicture = () => {
    setProfilePicture(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Submitting form data:', formData);
      
      if (!user.c_id) {
        alert('Customer ID is missing. Please log in again.');
        return;
      }
      
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // 1. If profile picture was changed, upload it first
      let profileImageUrl = previewUrl;
      if (profilePicture && previewUrl) {
        console.log('Uploading profile image to server');
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
          
          console.log('Profile image upload response:', profileImageResponse.data);
          profileImageUrl = profileImageResponse.data.image_url;
        } catch (imageError) {
          console.error('Error uploading profile image:', imageError);
          // Continue with other updates even if image upload fails
        }
      }
      
      // 2. Update user profile (name and phone)
      const userApiUrl = `${baseUrl}/api/customers/${user.c_id}`;
      console.log('Updating user data at:', userApiUrl);
      
      const userResponse = await axios.put(userApiUrl, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        // Don't include email as it can't be changed here
      }, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined
        }
      });
      
      console.log('User update response:', userResponse.data);
      
      // 3. Update or create address
      const addressData = {
        street_address: formData.address,
        city: formData.city,
        district: formData.district,
        country: formData.country || 'Sri Lanka',
        c_id: user.c_id,
        addressType: 'shipping'
      };
      
      console.log('Sending address data to API:', addressData);
      
      // Use the appropriate endpoint
      const addressUrl = addressLoaded 
        ? `${baseUrl}/api/addresses/customer/${user.c_id}`
        : `${baseUrl}/api/addresses`;
      
      console.log('Using address endpoint:', addressUrl);
      
      if (addressLoaded) {
        // Update existing address
        const addressResponse = await axios.put(addressUrl, addressData, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined
          }
        });
        console.log('Address update response:', addressResponse.data);
      } else {
        // Create new address
        const addressResponse = await axios.post(addressUrl, addressData, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined
          }
        });
        console.log('Address create response:', addressResponse.data);
      }
      
      // 4. Format address for local storage and display
      const addressParts = [
        formData.address,
        formData.district,
        formData.country
      ].filter(Boolean);
      
      const formattedAddress = addressParts.join(', ');
      
      // 5. Update localStorage with latest data
      const updatedUser = {
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        profilePicture: profileImageUrl, // Use the URL from Cloudinary
        address: formattedAddress
      };
      
      console.log('Updating localStorage with:', updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('Profile and address updated successfully');
      
      // Show success message
      alert('Profile updated successfully!');
      
      // Navigate back to profile page
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error details:', error.response?.data || 'No response data');
      alert('An error occurred while updating your profile. Please try again.');
    }
  };
  
  const handleCancel = () => {
    navigate('/profile'); // Go back to profile page without saving
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
