import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const VerifyResetCodePage = () => {
  // State for OTP, email, loading, error
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get email from location state or session storage
  const [email, setEmail] = useState(() => {
    return location.state?.email || sessionStorage.getItem('resetEmail') || '';
  });

  // Redirect if email is missing
  useEffect(() => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please provide your email address first",
        variant: "destructive"
      });
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, []);

  // Handle OTP input change
  const handleChange = (index, value) => {
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-move to next input if current one is filled
      if (value !== '' && index < 3) {
        inputRefs[index + 1].current.focus();
      }
    }
  };

  // Handle backspace in OTP input
  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  // Handle OTP form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const otpCode = otp.join('');
    if (otpCode.length !== 4 || !/^\d{4}$/.test(otpCode)) {
      setError('Please enter a valid 4-digit code');
      return;
    }
    
    setIsVerifying(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-reset-otp', {
        email,
        otp: otpCode
      });
      
      console.log('OTP verification response:', response.data);
      
      if (response.data.resetToken) {
        toast({
          title: "Code Verified",
          description: "You can now set a new password",
        });
        
        // Store token and email for the reset password page
        sessionStorage.setItem('resetToken', response.data.resetToken);
        
        // Navigate to reset password page
        navigate('/reset-password', { 
          state: { resetToken: response.data.resetToken, email }
        });
      }
      
    } catch (error) {
      console.error('OTP verification error:', error);
      
      if (error.response?.status === 400) {
        setError('Invalid or expired code. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
      
      toast({
        title: "Verification Failed",
        description: error.response?.data?.message || "Failed to verify code. Please try again.",
        variant: "destructive"
      });
      
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email address is missing",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsVerifying(true);
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      
      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email",
      });
      
      // For development environments, if OTP is returned, show in toast
      if (response.data.otpForTesting) {
        toast({
          title: "Development OTP",
          description: `New reset code: ${response.data.otpForTesting}`,
          variant: "default"
        });
      }
      
    } catch (error) {
      toast({
        title: "Failed to Resend",
        description: "Could not send a new code. Please try again later.",
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
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold mb-4 text-center">Verification Code</h1>
            <p className="mb-6 text-gray-600 text-center">
              Enter the 4-digit code sent to <strong>{email}</strong>
            </p>
          
            <form onSubmit={handleSubmit}>
              <div className="flex justify-center gap-3 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-14 h-14 text-center text-xl font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isVerifying}
                  />
                ))}
              </div>
              
              {error && (
                <p className="text-red-500 text-sm text-center mb-4">{error}</p>
              )}
              
              <button
                type="submit"
                disabled={isVerifying}
                className={`w-full py-3 px-6 rounded-md bg-primary text-white hover:bg-primary-hover ${
                  isVerifying ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isVerifying ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p>
                Didn't receive the code?{' '}
                <button 
                  onClick={handleResendCode}
                  disabled={isVerifying}
                  className="text-primary hover:underline"
                >
                  Resend Code
                </button>
              </p>
            </div>
            
            <div className="mt-4 text-center">
              <Link to="/forgot-password" className="text-gray-500 hover:underline text-sm">
                Change email address
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VerifyResetCodePage;
