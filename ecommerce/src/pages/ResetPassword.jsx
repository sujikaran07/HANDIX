import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get reset token from location state or session storage
  const [resetToken, setResetToken] = useState(() => {
    return location.state?.resetToken || sessionStorage.getItem('resetToken') || '';
  });

  // If token isn't available, redirect to forgot password page
  useEffect(() => {
    if (!resetToken) {
      toast({
        title: "Error",
        description: "Reset token missing. Please restart the password reset process.",
        variant: "destructive"
      });
      navigate('/forgot-password');
    }
  }, [resetToken, navigate]);

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
    
    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Determine API URL with more reliable method
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const apiUrl = `${baseUrl}/api/auth/reset-password`;
      
      console.log('Resetting password with:', { 
        resetToken, 
        newPassword: '******' // Log masked password for security
      });
      console.log('Using API endpoint:', apiUrl);
      
      const response = await axios.post(apiUrl, {
        resetToken,
        newPassword: password // Send password exactly as entered
      });
      
      console.log('Password reset response:', response.data);
      
      setCompleted(true);
      
      // Clear stored token
      sessionStorage.removeItem('resetToken');
      sessionStorage.removeItem('resetEmail');
      
      toast({
        title: "Password Reset Complete",
        description: "Your password has been updated successfully. You can now log in.",
      });
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login', { 
          state: { passwordChanged: true } 
        });
      }, 2000);
      
    } catch (error) {
      console.error('Password reset error:', error);
      
      // Show more specific error messages based on the response
      let errorMessage = "Failed to reset password. Please try again.";
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Your reset token has expired. Please start again.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        
        // Check for database column missing error
        if (error.response.data && error.response.data.error && 
            error.response.data.error.includes('column')) {
          errorMessage = "The server database needs to be updated. Please contact support.";
        }
      }
      
      setError(`Something went wrong. ${errorMessage}`);
      
      toast({
        title: "Reset Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow bg-gray-50 flex items-center justify-center py-12">
        <div className="container-custom max-w-md">  
          <div className="bg-white rounded-lg shadow-sm p-8">
            {completed ? (
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Password Updated</h1>
                <p className="mb-6 text-gray-600">
                  Your password has been reset successfully.
                </p>
                
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 px-6 rounded-md bg-primary text-white hover:bg-primary-hover"
                >
                  Log In Now
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-6 text-center">Reset Your Password</h1>
                <p className="mb-6 text-gray-600 text-center">
                  Create a new secure password for your account
                </p>
              
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Create new password"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        disabled={isSubmitting}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Minimum 8 characters, at least 1 letter and 1 number
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-1">Confirm Password</label>
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
                        onClick={toggleConfirmPasswordVisibility}
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
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ResetPasswordPage;
