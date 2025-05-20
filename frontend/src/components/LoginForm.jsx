import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Hlogo from "../assets/logo1.png";
import axios from 'axios';

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError(false);
    setPasswordError(false);
    setErrorMessage('');
    
    try {
      console.log('Sending login request:', { email, password });
      
      // Clear axios headers before setting new ones
      delete axios.defaults.headers.common['Authorization'];
      
      console.log('Authorization headers cleared before login');
      
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      console.log('Login response received:', response);
      
      if (response.status === 200 && response.data) {
        const { token, redirectUrl, tokenKey } = response.data;
        
        if (!token) {
          console.error('No token received from server');
          setErrorMessage('Authentication failed - no token received');
          setEmailError(true);
          setPasswordError(true);
          return;
        }
        
        if (!tokenKey) {
          console.error('No tokenKey received from server');
          setErrorMessage('Authentication failed - invalid role');
          setEmailError(true);
          setPasswordError(true);
          return;
        }
        
        // Only clear the specific token we're about to set
        localStorage.removeItem(tokenKey);
        
        // Store token in the role-specific key
        console.log(`Storing token as ${tokenKey} with value:`, token.substring(0, 10) + '...');
        localStorage.setItem(tokenKey, token);
        
        // Verify token was stored
        const storedToken = localStorage.getItem(tokenKey);
        if (storedToken) {
          console.log(`Token successfully stored as ${tokenKey}`);
        } else {
          console.error(`Failed to store token as ${tokenKey}`);
        }
        
        // Set authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('Redirecting to:', redirectUrl);
        onLoginSuccess(redirectUrl);
      } else {
        console.error('Unexpected response status:', response.status);
        setErrorMessage('Login failed - unexpected response');
        setEmailError(true);
        setPasswordError(true);
      }
    } catch (error) {
      console.error('Error during login:', error);
      
      if (error.response) {
        console.error('Server response error:', error.response.data);
        setErrorMessage(error.response.data.message || 'Authentication failed');
      } else if (error.request) {
        console.error('No response from server');
        setErrorMessage('No response from server - check your connection');
      } else {
        console.error('Error setting up request:', error.message);
        setErrorMessage('Error setting up request');
      }
      
      setEmailError(true);
      setPasswordError(true);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-form">
      <div className="form-header">
        <img src={Hlogo} alt="Logo" className="logo" />
        <h3>Welcome Back!</h3>
      </div>
      
      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}
      
      <Form onSubmit={handleLogin}>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <div className="input-group">
            <span className="input-icon">
              <FaUser />
            </span>
            <Form.Control 
              type="email" 
              placeholder="Enter Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              isInvalid={emailError}
            />
          </div>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <div className="input-group">
            <span className="input-icon">
              <FaLock />
            </span>
            <Form.Control 
              type={showPassword ? "text" : "password"} 
              placeholder="Enter Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              isInvalid={passwordError}
            />
            <span className="input-icon" onClick={toggleShowPassword} style={{ cursor: 'pointer' }}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </Form.Group>

        <Button variant="success" type="submit" className="login-btn">
          Login →
        </Button>

        <div className="form-footer">
        </div>
      </Form>
    </div>
  );
};

export default LoginForm;
