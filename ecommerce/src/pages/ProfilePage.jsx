import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    joinDate: '',
    profilePicture: null,
    c_id: ''
  });

  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          
          // Extract customer ID for API calls
          const customerId = parsedUser.c_id;
          
          // Update user state with basic info from localStorage
          setUser(prev => ({
            ...prev,
            name: `${parsedUser.firstName} ${parsedUser.lastName}`,
            email: parsedUser.email || prev.email,
            phone: parsedUser.phone || prev.phone,
            profilePicture: parsedUser.profilePicture || null,
            c_id: customerId
          }));
          
          // If we have c_id, fetch address and customer details
          if (customerId) {
            try {
              const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
              const token = localStorage.getItem('token');
              
              // 1. Fetch address data
              try {
                const addressResponse = await axios.get(`${baseUrl}/api/addresses/customer/${customerId}`);
                
                if (addressResponse.data && addressResponse.data.length > 0) {
                  // Get first address
                  const address = addressResponse.data[0];
                  
                  // Create formatted address string - without separating city
                  // Just combine all address components into a single string
                  const addressParts = [];
                  
                  if (address.street_address) {
                    addressParts.push(address.street_address);
                  }
                  
                  if (address.district) {
                    addressParts.push(address.district);
                  }
                  
                  if (address.country) {
                    addressParts.push(address.country);
                  }
                  
                  const formattedAddress = addressParts.join(', ');
                  
                  setUser(prev => ({
                    ...prev,
                    address: formattedAddress
                  }));
                }
              } catch (addressError) {
                console.error("Error fetching address:", addressError);
              }
              
              // 2. Fetch customer details to get registration date
              try {
                const customerResponse = await axios.get(`${baseUrl}/api/customers/${customerId}`, {
                  headers: {
                    'Authorization': token ? `Bearer ${token}` : undefined
                  }
                });
                
                if (customerResponse.data) {
                  const customer = customerResponse.data;
                  
                  // Format the registration date
                  let memberSince;
                  if (customer.registrationDate) {
                    // Format the date (e.g., January 2023)
                    memberSince = new Date(customer.registrationDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long'
                    });
                  } else if (customer.createdAt) {
                    // Use createdAt as fallback
                    memberSince = new Date(customer.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long'
                    });
                  } else {
                    // Default fallback
                    memberSince = 'January 2023';
                  }
                  
                  setUser(prev => ({
                    ...prev,
                    joinDate: memberSince
                  }));
                }
              } catch (customerError) {
                console.error("Error fetching customer details:", customerError);
              }
            } catch (error) {
              console.error("Error fetching data:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Function to handle edit profile button click
  const handleEditProfile = () => {
    navigate('/edit-profile'); // Navigate to the edit profile page
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
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>
          
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="w-full md:w-1/3 flex flex-col items-center">
                {user.profilePicture ? (
                  <div className="h-32 w-32 rounded-full overflow-hidden mb-4">
                    <img 
                      src={user.profilePicture} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                    <User size={64} className="text-gray-400" />
                  </div>
                )}
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-gray-500">Member since {user.joinDate}</p>
                
                <button 
                  className="mt-4 py-2 px-4 border border-primary text-primary rounded-md hover:bg-blue-50 transition-colors"
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </button>
              </div>
              
              <div className="w-full md:w-2/3">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="text-gray-500" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p>{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="text-gray-500" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p>{user.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="text-gray-500 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p>{user.address}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Account Security</h3>
                  
                  <button className="mb-3 py-2 px-4 border border-primary text-primary rounded-md hover:bg-blue-50 transition-colors">
                    Change Password
                  </button>
                  
                  <p className="text-sm text-gray-500">
                    Last password change: 3 months ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;