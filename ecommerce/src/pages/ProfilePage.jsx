import React from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const ProfilePage = () => {
  // Mock user data
  const user = {
    name: 'Sujikaran Mahenthiran',
    email: 'sujikaran@example.com',
    phone: '+94 71 234 5678',
    address: '123 Main Street, Colombo, Sri Lanka',
    joinDate: 'January 2023'
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow bg-gray-50 py-16">
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>
          
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="w-full md:w-1/3 flex flex-col items-center">
                <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <User size={64} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-gray-500">Member since {user.joinDate}</p>
                
                <button className="mt-4 py-2 px-4 border border-primary text-primary rounded-md hover:bg-blue-50 transition-colors">
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