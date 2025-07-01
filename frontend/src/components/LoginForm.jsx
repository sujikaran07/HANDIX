import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Hlogo from "../assets/logo1.png";
import axios from 'axios';

// Login form component with authentication and role-based routing
const LoginForm = ({ onLoginSuccess }) => {
  // State management for form inputs and validation
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Handle login form submission and authentication
  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError(false);
    setPasswordError(false);
    setErrorMessage('');
    
    try {
      // Clear any existing authorization headers
      delete axios.defaults.headers.common['Authorization'];
      
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      
      if (response.status === 200 && response.data) {
        const { token, redirectUrl, tokenKey } = response.data;
        
        if (!token) {
          setErrorMessage('Authentication failed - no token received');
          setEmailError(true);
          setPasswordError(true);
          return;
        }
        
        if (!tokenKey) {
          setErrorMessage('Authentication failed - invalid role');
          setEmailError(true);
          setPasswordError(true);
          return;
        }
        
        // Store token with role-specific key
        localStorage.removeItem(tokenKey);
        localStorage.setItem(tokenKey, token);
        
        // Verify token storage
        const storedToken = localStorage.getItem(tokenKey);
        if (!storedToken) {
          setErrorMessage('Failed to store authentication token');
          return;
        }
        
        // Set authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        onLoginSuccess(redirectUrl);
      } else {
        setErrorMessage('Login failed - unexpected response');
        setEmailError(true);
        setPasswordError(true);
      }
    } catch (error) {
      // Handle different types of errors
      if (error.response) {
        setErrorMessage(error.response.data.message || 'Authentication failed');
      } else if (error.request) {
        setErrorMessage('No response from server - check your connection');
      } else {
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
      {/* Form header with logo */}
      <div className="form-header">
        <img src={Hlogo} alt="Logo" className="logo" />
        <h3>Welcome Back!</h3>
      </div>
      
      {/* Error message display */}
      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}
      
      <Form onSubmit={handleLogin}>
        {/* Email input field */}
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

        {/* Password input field with toggle visibility */}
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
