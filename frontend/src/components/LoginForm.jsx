import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Hlogo from "../assets/logo1.png";
import axios from 'axios';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError(false);
    setPasswordError(false);
    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      if (response.status === 200) {
        // Store the token in local storage
        localStorage.setItem('token', response.data.token);
        navigate('/admin/dashboard');
      } else {
        setEmailError(true);
        setPasswordError(true);
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      setEmailError(true);
      setPasswordError(true);
      setEmail('');
      setPassword('');
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
          <p>
            Forgot your password? <a href="#">Click Here</a>
          </p>
        </div>
      </Form>
    </div>
  );
};

export default LoginForm;
