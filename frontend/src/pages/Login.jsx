import React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import "../styles/Login.css";

// Main login page with role-based authentication and routing
const Login = () => {
  const navigate = useNavigate();

  // Handle successful login and redirect based on user role
  const handleLoginSuccess = (redirectUrl) => {
    navigate(redirectUrl); 
  };

  return (
    <div className="login-container">
      {/* Left panel for branding/design */}
      <div className="left-panel">
      </div>
      {/* Right panel containing login form */}
      <div className="right-panel">
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default Login;
