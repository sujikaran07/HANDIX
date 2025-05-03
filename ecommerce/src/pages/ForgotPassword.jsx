import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate email
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      
      console.log('Password reset response:', response.data);
      
      // Even if email doesn't exist, we show success for security
      setSubmitted(true);
      
      // Store email in session for the next step
      sessionStorage.setItem('resetEmail', email);
      
      // For development environments, if OTP is returned, show in toast
      if (response.data.otpForTesting) {
        toast({
          title: "Development OTP",
          description: `Reset code: ${response.data.otpForTesting}`,
          variant: "default"
        });
      }
      
      // Navigate to OTP verification page
      navigate('/verify-reset-code', { 
        state: { email: email }
      });
      
    } catch (error) {
      console.error('Forgot password error:', error);
      
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again later.",
        variant: "destructive"
      });
      
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow bg-gray-50 flex items-center justify-center py-12">
        <div className="container-custom max-w-md">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {submitted ? (
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Check Your Email</h1>
                <p className="mb-6 text-gray-600">
                  If an account with email <strong>{email}</strong> exists in our system, 
                  we've sent a password reset code.
                </p>
                
                <button
                  onClick={() => navigate('/verify-reset-code', { state: { email } })}
                  className="w-full py-3 px-6 rounded-md bg-primary text-white hover:bg-primary-hover"
                >
                  Enter Reset Code
                </button>
                
                <div className="mt-6 text-center">
                  <p>
                    Didn't receive the email?{' '}
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="text-primary hover:underline"
                    >
                      Try again
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-6 text-center">Forgot Password</h1>
                <p className="mb-6 text-gray-600 text-center">
                  Enter your email address and we'll send you a code to reset your password.
                </p>
              
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full p-3 border ${
                        error ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                      placeholder="your.email@example.com"
                      disabled={isSubmitting}
                    />
                    {error && (
                      <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-6 rounded-md bg-primary text-white hover:bg-primary-hover ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </form>
                
                <div className="mt-6 text-center">
                  <p>
                    Remember your password?{' '}
                    <Link to="/login" className="text-primary hover:underline">
                      Login here
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
