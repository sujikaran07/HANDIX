import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShoppingBag, Building2 } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'personal', 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [verificationLink, setVerificationLink] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.accountType) {
      newErrors.accountType = 'Please select an account type';
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the Terms of Service and Privacy Policy';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      
      try {
        // Trim password fields before sending
        const trimmedPassword = formData.password.trim();
        
        console.log('Submitting registration with trimmed password length:', trimmedPassword.length);
        
        // Prepare data for backend
        const customerData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          // Always send password as a string
          password: String(trimmedPassword),
          accountType: formData.accountType === 'personal' ? 'Personal' : 'Business',
          phone: '',
          accountStatus: 'Pending',
          country: '',
          city: '',
          state: '',
          postalCode: ''
        };
        
        // Make API call to create customer
        const response = await axios.post('http://localhost:5000/api/customers', customerData);
        
        toast({
          title: "Registration Successful",
          description: "Please check your email for the verification code.",
          duration: 5000,
        });
        
        // Navigate to OTP verification page with email
        navigate('/verify-otp', { 
          state: { 
            email: customerData.email
          } 
        });
        
      } catch (error) {
        console.error('Registration error:', error);
        if (error.response && error.response.data) {
          // Handle specific error responses
          if (error.response.status === 409) {
            setErrors({ email: 'This email is already registered' });
            toast({
              title: "Registration Failed",
              description: "This email address is already registered. Please login or use a different email.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Registration Failed",
              description: error.response.data.message || "Failed to create account. Please try again.",
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
  
  if (registrationComplete) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        
        <main className="flex-grow bg-gray-50 py-12">
          <div className="container-custom max-w-lg">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h1 className="text-2xl font-bold mb-6">Email Verification Required</h1>
              
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="24" className="fill-primary" rx="12" />
                    <path d="M7 13L10 16L17 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-lg font-medium mb-2">Registration Successful!</p>
                <p className="text-gray-600 mb-4">
                  We've sent a verification link to <span className="font-medium">{formData.email}</span>. 
                  Please check your inbox and click the link to verify your email address and activate your account.
                </p>
                
                {/* Show verification link directly for local testing */}
                {verificationLink && (
                  <div className="my-6 p-4 bg-gray-100 rounded-md text-left">
                    <p className="font-medium mb-2">Since you're in development mode, you can use this link to verify your account:</p>
                    <div className="overflow-x-auto">
                      <a 
                        href={verificationLink} 
                        className="text-primary break-all hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {verificationLink}
                      </a>
                    </div>
                    <button 
                      onClick={() => window.open(verificationLink, '_blank')}
                      className="mt-3 px-4 py-1 bg-primary text-white text-sm rounded"
                    >
                      Open Verification Link
                    </button>
                  </div>
                )}
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-sm text-blue-700 mt-4 text-left">
                  <p className="font-medium">Important:</p>
                  <p>You must verify your email before you can log in. If you don't see our email, please check your spam folder.</p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row justify-center space-y-3 md:space-y-0 md:space-x-4">
                <Link 
                  to="/login" 
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Go to Login
                </Link>
                <button
                  onClick={() => navigate('/check-email')}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
                >
                  Open Email Client
                </button>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container-custom max-w-lg">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>
            
            <form onSubmit={handleSubmit}>
              {/* Account Type with small icons */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Account Type</label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="accountType"
                      value="personal"
                      checked={formData.accountType === 'personal'}
                      onChange={handleChange}
                      className="mr-2 accent-primary h-4 w-4"
                    />
                    <div className="flex items-center">
                      <ShoppingBag size={16} className="mr-1 text-primary" />
                      <span>Personal</span>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="accountType"
                      value="business"
                      checked={formData.accountType === 'business'}
                      onChange={handleChange}
                      className="mr-2 accent-primary h-4 w-4"
                    />
                    <div className="flex items-center">
                      <Building2 size={16} className="mr-1 text-primary" />
                      <span>Business</span>
                    </div>
                  </label>
                </div>
                {errors.accountType && (
                  <p className="text-red-500 text-sm mt-1">{errors.accountType}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* First Name */}
                <div>
                  <label className="block text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full p-3 border ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>
                
                {/* Last Name */}
                <div>
                  <label className="block text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full p-3 border ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>
              
              {/* Email */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-3 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              
              {/* Password */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full p-3 border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
              
              {/* Confirm Password */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full p-3 border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
              
              {/* Terms & Conditions */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className={`mr-2 accent-primary ${errors.terms ? 'border-red-500' : ''}`}
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                  />
                  <span className="text-sm">
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>
                    {' '}and{' '}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-red-500 text-sm mt-1">{errors.terms}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-md bg-primary text-white hover:bg-primary-hover ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RegisterPage;