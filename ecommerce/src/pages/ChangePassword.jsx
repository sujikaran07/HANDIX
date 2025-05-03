import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to change your password",
        variant: "destructive"
      });
      navigate('/login', { state: { from: '/change-password' } });
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);
  
  const validatePassword = (password) => {
    // Minimum 8 characters, at least 1 letter and 1 number
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Za-z]/.test(password)) {
      return "Password must contain at least one letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return "";
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate current password
    if (!currentPassword) {
      setError('Current password is required');
      return;
    }
    
    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    // Prevent changing to the same password
    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const userDataString = localStorage.getItem('user');
      const userData = userDataString ? JSON.parse(userDataString) : null;
      
      if (!token || !userData) {
        throw new Error('Authentication information missing');
      }
      
      const response = await axios.post(
        'http://localhost:5000/api/auth/change-password',
        {
          currentPassword,
          newPassword,
          email: userData.email  // Send email for additional verification
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Password change response:', response.data);
      
      if (response.data.success) {
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully. Please log in with your new password.",
        });
        
        // Clear form fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Clear token and user data to force re-login with new password
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('isAuthenticated');
          navigate('/login', { state: { passwordChanged: true } });
        }, 2000);
      } else {
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully",
        });
        
        // Clear form fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Redirect to profile page or dashboard
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error) {
      console.error('Password change error:', error);
      
      if (error.response?.status === 401) {
        setError('Current password is incorrect');
        toast({
          title: "Authentication Error",
          description: "Your current password is incorrect",
          variant: "destructive"
        });
      } else {
        setError('Something went wrong. Please try again.');
        toast({
          title: "Change Failed",
          description: error.response?.data?.message || "Failed to change password. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isAuthenticated) {
    return null; // Don't render anything until authentication check is complete
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow bg-gray-50 flex items-center justify-center py-12">
        <div className="container-custom max-w-md">  
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold mb-6 text-center">Change Your Password</h1>
            <p className="mb-6 text-gray-600 text-center">
              Keep your account secure by updating your password regularly
            </p>
          
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your current password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    disabled={isSubmitting}
                  >
                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Create new password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    disabled={isSubmitting}
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Minimum 8 characters, at least 1 letter and 1 number
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Confirm new password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-md bg-primary text-white hover:bg-primary-hover ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <Link to="/profile" className="text-gray-500 hover:underline text-sm">
                Back to Profile
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChangePasswordPage;
