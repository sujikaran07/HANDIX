import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for handling OTP input
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState(null); // null, success, error
  
  // Reference for input fields
  const otpInputs = useRef([]);
  
  // Initialize from location state (if available)
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    
    // Auto-focus first input field
    if (otpInputs.current[0]) {
      otpInputs.current[0].focus();
    }
  }, [location.state]);
  
  // Handle countdown for resend cooldown
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
    
    return () => clearInterval(timer);
  }, [countdown, resendDisabled]);
  
  // Auto-redirect on success after delay
  useEffect(() => {
    let timer;
    if (verificationStatus === 'success') {
      timer = setTimeout(() => {
        navigate('/login', { 
          state: { verificationSuccess: true }
        });
      }, 3000);
    }
    
    return () => clearTimeout(timer);
  }, [verificationStatus, navigate]);
  
  // Handle input change
  const handleChange = (index, e) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (!/^[0-9]*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(0, 1);
    setOtp(newOtp);
    
    // Auto-move to next input
    if (value && index < 3) {
      otpInputs.current[index + 1].focus();
    }
  };
  
  // Handle backspace for empty field
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };
  
  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    
    if (/^\d{4}$/.test(pasteData)) {
      setOtp(pasteData.split(''));
      
      // Focus last input after paste
      otpInputs.current[3].focus();
    }
  };
  
  const handleVerify = async () => {
    // Check if OTP is complete
    if (otp.some(digit => !digit)) {
      toast({
        title: "Incomplete Code",
        description: "Please enter all 4 digits of the verification code",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/customers/verify-otp', {
        email,
        otp: otp.join('')
      });
      
      // Show success message
      toast({
        title: "Email Verified",
        description: "Your email has been verified successfully. You can now log in.",
      });
      
      // Set verification status and start redirect countdown
      setVerificationStatus('success');
      
    } catch (error) {
      // Show error message
      toast({
        title: "Verification Failed",
        description: error.response?.data?.message || "Invalid verification code",
        variant: "destructive"
      });
      
      setVerificationStatus('error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOTP = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "We need your email to resend the verification code",
        variant: "destructive"
      });
      return;
    }
    
    setResendLoading(true);
    setResendDisabled(true);
    
    try {
      await axios.post('http://localhost:5000/api/customers/resend-otp', { email });
      
      // Start countdown
      setCountdown(60);
      
      toast({
        title: "Code Sent",
        description: "A new verification code has been sent to your email",
      });
      
      // Clear current OTP fields
      setOtp(['', '', '', '']);
      
      // Focus on first input
      if (otpInputs.current[0]) {
        otpInputs.current[0].focus();
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send verification code",
        variant: "destructive"
      });
      setResendDisabled(false);
    } finally {
      setResendLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12">
        <div className="container-custom max-w-md">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {verificationStatus === 'success' ? (
              <div className="flex flex-col items-center space-y-4 py-8">
                <CheckCircle size={56} className="text-green-500" />
                <h2 className="text-2xl font-bold">Email Verified!</h2>
                <p className="text-gray-600 text-center">
                  Your account is now active. You'll be redirected to the login page shortly.
                </p>
                <button 
                  onClick={() => navigate('/login')}
                  className="mt-4 flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover transition-colors"
                >
                  Go to Login <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-center mb-2">Verify Your Email</h1>
                <p className="text-center text-gray-600 mb-6">
                  We sent a 4-digit code to <br />
                  <span className="font-medium">{email}</span>
                </p>
                
                <div className="mb-8">
                  <div className="flex justify-center space-x-3 mb-6">
                    {[0, 1, 2, 3].map(index => (
                      <input
                        key={index}
                        ref={el => otpInputs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otp[index]}
                        onChange={e => handleChange(index, e)}
                        onKeyDown={e => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="w-12 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={handleVerify}
                    disabled={loading || otp.some(digit => !digit)}
                    className={`w-full py-3 rounded-md bg-primary text-white font-medium hover:bg-primary-hover transition-colors relative ${
                      loading || otp.some(digit => !digit) ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Loader2 className="animate-spin" size={20} />
                      </span>
                    ) : null}
                    <span className={loading ? 'invisible' : ''}>
                      Verify
                    </span>
                  </button>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">Didn't receive a code?</p>
                  <button
                    onClick={handleResendOTP}
                    disabled={resendDisabled || resendLoading}
                    className={`text-primary hover:underline inline-flex items-center ${
                      resendDisabled || resendLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={14} />
                        Sending...
                      </>
                    ) : resendDisabled ? (
                      `Resend code (${countdown}s)`
                    ) : (
                      'Resend code'
                    )}
                  </button>
                </div>
                
                {verificationStatus === 'error' && (
                  <div className="mt-6 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm">
                    <p className="font-medium">Verification Failed</p>
                    <p>Please double-check the code and try again. You can also request a new code.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VerifyOTP;
