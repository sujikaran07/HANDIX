import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !email) {
        setStatus('error');
        toast({
          title: "Verification Failed",
          description: "Invalid verification link. Please request a new one.",
          variant: "destructive",
        });
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/customers/verify-email`, {
          params: { token, email }
        });
        
        setStatus('success');
        toast({
          title: "Email Verified Successfully",
          description: response.data.isApproved 
            ? "Your account has been activated!"
            : "Your email has been verified. A administrator will review your application.",
        });
        
        // Start countdown to redirect
        setCountdown(5);
      } catch (error) {
        setStatus('error');
        toast({
          title: "Verification Failed",
          description: error.response?.data?.message || "Failed to verify email. The link may have expired.",
          variant: "destructive",
        });
      }
    };

    verifyEmail();
  }, [token, email, toast]);

  // Countdown effect
  useEffect(() => {
    let timer;
    if (status === 'success' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (status === 'success' && countdown === 0) {
      navigate('/login');
    }

    return () => clearInterval(timer);
  }, [status, countdown, navigate]);

  // Resend verification email
  const handleResendVerification = async () => {
    if (!email) return;
    
    try {
      await axios.post('http://localhost:5000/api/auth/resend-verification', { email });
      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox for the new verification link",
      });
    } catch (error) {
      toast({
        title: "Failed to Resend",
        description: error.response?.data?.message || "Could not resend verification email",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12">
        <div className="container-custom max-w-lg">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            {status === 'verifying' && (
              <div className="flex flex-col items-center space-y-4 py-8">
                <Loader2 size={48} className="text-primary animate-spin" />
                <h1 className="text-2xl font-bold">Verifying Your Email</h1>
                <p className="text-gray-600">Please wait while we verify your email address...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center space-y-4 py-8">
                <CheckCircle size={48} className="text-green-500" />
                <h1 className="text-2xl font-bold">Email Verified Successfully!</h1>
                <p className="text-gray-600 max-w-sm">
                  Your email has been verified and your account is now active. You can now log in to your account.
                </p>
                <div className="mt-6 font-medium">
                  Redirecting to login page in {countdown} seconds...
                </div>
                <button 
                  onClick={() => navigate('/login')}
                  className="mt-4 flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover transition-colors"
                >
                  Go to Login <ArrowRight size={16} />
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center space-y-4 py-8">
                <AlertCircle size={48} className="text-red-500" />
                <h1 className="text-2xl font-bold">Verification Failed</h1>
                <p className="text-gray-600 max-w-sm">
                  We couldn't verify your email. The verification link may be invalid or expired.
                </p>
                <div className="space-y-4 mt-4">
                  <button 
                    onClick={handleResendVerification}
                    className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover transition-colors"
                  >
                    Resend Verification Email
                  </button>
                  <div className="mt-4">
                    <button 
                      onClick={() => navigate('/login')}
                      className="text-primary hover:underline"
                    >
                      Return to login
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VerifyEmailPage;
