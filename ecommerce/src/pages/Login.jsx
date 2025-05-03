import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [manualVerifyEmail, setManualVerifyEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if user was redirected after successful verification or password change
  useEffect(() => {
    if (location.state?.verificationSuccess) {
      toast({
        title: "Email Verified",
        description: "Your email has been verified. You can now log in.",
      });
    } else if (location.state?.passwordChanged) {
      toast({
        title: "Password Changed",
        description: "Please log in with your new password.",
        variant: "default"
      });
    }
  }, [location.state]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      try {
        console.log('Attempting login with:', { email, password: '******' });
        
        // Connect to backend authentication endpoint with port 5000
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          email,
          password
        });
        
        console.log('Login response received:', response.status);
        
        if (response.data && response.data.token) {
          // Store user data and token in localStorage
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('isAuthenticated', 'true');
          
          toast({
            title: "Login Successful",
            description: "Welcome back to Handix!",
          });
          
          // Navigate to home page
          navigate('/');
        }
      } catch (error) {
        console.error('Login error details:', error);
        
        // Handle different error scenarios
        if (error.response) {
          const { status, data } = error.response;
          console.log('Error response data:', data);
          
          if (status === 401) {
            setErrors({ password: 'Invalid email or password' });
            toast({
              title: "Login Failed",
              description: "Invalid email or password",
              variant: "destructive"
            });
          } else if (status === 403 && data.reason === 'unverified') {
            setUnverifiedEmail(data.email || email);
            setShowResendVerification(true);
            toast({
              title: "Email Not Verified",
              description: "Please verify your email before logging in.",
              variant: "warning"
            });
          } else if (status === 403 && data.reason === 'pending') {
            toast({
              title: "Account Pending Approval",
              description: "Your account is pending approval from administrators",
              variant: "warning"
            });
          } else {
            toast({
              title: "Login Failed",
              description: data.message || "An error occurred during login",
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Connection Error",
            description: "Unable to connect to the server. Please try again.",
            variant: "destructive"
          });
        }
      } finally {
        setLoading(false);
      }
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleLogin = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Google login will be implemented in a future update.",
      variant: "default"
    });
  };

  const handleFacebookLogin = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Facebook login will be implemented in a future update.",
      variant: "default"
    });
  };

  const handleXLogin = () => {
    toast({
      title: "Feature Coming Soon",
      description: "X login will be implemented in a future update.",
      variant: "default"
    });
  };

  const handleResendVerification = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/resend-verification', { 
        email: unverifiedEmail || email 
      });
      
      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox for the verification link.",
        variant: "default"
      });
      
      setShowResendVerification(false);
    } catch (error) {
      toast({
        title: "Failed to Resend",
        description: "Could not send verification email. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleManualVerify = async () => {
    if (!manualVerifyEmail.trim() || !/\S+@\S+\.\S+/.test(manualVerifyEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }      
    
    setIsVerifying(true);
    try {
      await axios.post('http://localhost:5000/api/customers/verify-manual', { 
        email: manualVerifyEmail 
      });
      
      toast({
        title: "Verification Successful",
        description: "Your email has been manually verified. You can now log in.",
      });
      
      setShowResendVerification(false);
      setManualVerifyEmail('');
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error.response?.data?.message || "Could not verify the email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow bg-gray-50 flex items-center justify-center py-12">
        <div className="container-custom max-w-md">  
          {showResendVerification ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Email Verification Required</h2>
              <p className="mb-6 text-gray-600">
                Your account needs to be verified before you can log in. 
                Please check your email for a verification link or click the button below to resend it.
              </p>
              
              <button
                onClick={handleResendVerification}
                className="w-full py-3 px-6 rounded-md bg-primary text-white hover:bg-primary-hover"
              >
                Resend Verification Email
              </button>
              
              {/* Local development manual verification option */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-lg mb-2">Manual Verification</h3>
                <p className="mb-4 text-gray-600 text-sm">For local testing only. Verify your email directly:</p>
                <div className="flex">
                  <input 
                    type="email" 
                    value={manualVerifyEmail} 
                    onChange={(e) => setManualVerifyEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 p-2 border border-gray-300 rounded-l-md"
                  />
                  <button
                    onClick={handleManualVerify}
                    disabled={isVerifying}
                    className="py-2 px-4 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    {isVerifying ? "Verifying..." : "Verify"}
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => setShowResendVerification(false)}
                className="w-full mt-6 py-3 px-6 rounded-md border border-gray-300 hover:bg-gray-50"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h1 className="text-2xl font-bold mb-6 text-center">Login to Your Account</h1>
            
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        const newErrors = { ...errors };
                        delete newErrors.email;
                        setErrors(newErrors);
                      }
                    }}
                    className={`w-full p-3 border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) {
                          const newErrors = { ...errors };
                          delete newErrors.password;
                          setErrors(newErrors);
                        }
                      }}
                      className={`w-full p-3 border ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2 accent-primary"
                    />
                    <span className="text-sm">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-6 rounded-md bg-primary text-white hover:bg-primary-hover ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <p>
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary hover:underline">
                    Register here
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LoginPage;