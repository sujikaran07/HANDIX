import React, { useState } from 'react';
import { User, Lock, CreditCard, Bell, Shield, Mail, Home } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const AccountSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Mock user data
  const userData = {
    name: 'Sujikaran Mahenthiran',
    email: 'sujikaran@example.com',
    phone: '+94 71 234 5678',
    notifications: {
      email: true,
      orders: true,
      offers: false,
      newsletter: true
    },
    addresses: [
      {
        id: 'addr1',
        name: 'Home',
        street: '123 Main Street',
        city: 'Colombo',
        state: 'Western Province',
        postalCode: '00100',
        country: 'Sri Lanka',
        isDefault: true
      },
      {
        id: 'addr2',
        name: 'Office',
        street: '456 Business Avenue',
        city: 'Colombo',
        state: 'Western Province',
        postalCode: '00200',
        country: 'Sri Lanka',
        isDefault: false
      }
    ],
    paymentMethods: [
      {
        id: 'card1',
        type: 'Visa',
        last4: '4242',
        expiry: '04/25',
        isDefault: true
      },
      {
        id: 'card2',
        type: 'Mastercard',
        last4: '5555',
        expiry: '07/26',
        isDefault: false
      }
    ]
  };
  
  const [profileForm, setProfileForm] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notifications, setNotifications] = useState(userData.notifications);
  
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would update the user profile
    alert('Profile updated successfully!');
  };
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    // In a real app, this would update the password
    alert('Password changed successfully!');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
            <form onSubmit={handleProfileSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full p-2 border rounded-md"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
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
                  <input
                    id="currentPassword"
                    type="password"
                    className="w-full p-2 border rounded-md"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    className="w-full p-2 border rounded-md"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="w-full p-2 border rounded-md"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </form>
            
            <div className="mt-10 border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
              <p className="text-gray-600 mb-4">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
              <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">
                Enable 2FA
              </button>
            </div>
          </div>
        );
        
      case 'payment':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">Payment Methods</h2>
            
            <div className="space-y-4">
              {userData.paymentMethods.map((method) => (
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
                    <button className="text-sm text-gray-600 hover:text-primary">
                      Edit
                    </button>
                    <button className="text-sm text-red-600 hover:text-red-800">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <button className="border border-primary text-primary px-4 py-2 rounded-md hover:bg-blue-50 transition-colors">
                Add Payment Method
              </button>
            </div>
          </div>
        );
        
      case 'address':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">Shipping Addresses</h2>
            
            <div className="space-y-4">
              {userData.addresses.map((address) => (
                <div key={address.id} className="border rounded-md p-4">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">{address.name}</h3>
                    <div className="flex items-center gap-2">
                      {address.isDefault && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                      <button className="text-sm text-gray-600 hover:text-primary">
                        Edit
                      </button>
                      <button className="text-sm text-red-600 hover:text-red-800">
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600">{address.street}</p>
                  <p className="text-gray-600">{address.city}, {address.state} {address.postalCode}</p>
                  <p className="text-gray-600">{address.country}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <button className="border border-primary text-primary px-4 py-2 rounded-md hover:bg-blue-50 transition-colors">
                Add New Address
              </button>
            </div>
          </div>
        );
        
      case 'notifications':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h3 className="font-medium">Order Updates</h3>
                  <p className="text-sm text-gray-500">Receive updates about your orders</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.orders}
                    onChange={() => setNotifications({ ...notifications, orders: !notifications.orders })}
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
                    checked={notifications.offers}
                    onChange={() => setNotifications({ ...notifications, offers: !notifications.offers })}
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
                    checked={notifications.email}
                    onChange={() => setNotifications({ ...notifications, email: !notifications.email })}
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
                    checked={notifications.newsletter}
                    onChange={() => setNotifications({ ...notifications, newsletter: !notifications.newsletter })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors"
                onClick={() => alert('Notification preferences saved!')}
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
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      defaultChecked
                    />
                    <label htmlFor="analytics" className="ml-2 block text-sm text-gray-700">
                      Allow usage data collection for service improvement
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="marketing"
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="marketing" className="ml-2 block text-sm text-gray-700">
                      Allow data sharing with marketing partners
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Account Data</h3>
                <p className="text-gray-600 mb-4">
                  Download or delete your account data.
                </p>
                <div className="space-x-4">
                  <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">
                    Download Data
                  </button>
                  <button className="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-3">Cookies Preferences</h3>
                <p className="text-gray-600 mb-3">
                  Manage how we use cookies when you visit our website.
                </p>
                <button className="border text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                  Manage Cookie Preferences
                </button>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow bg-gray-50 py-16">
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
          <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
          
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="grid md:grid-cols-4">
              {/* Settings Sidebar */}
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
              
              {/* Settings Content */}
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