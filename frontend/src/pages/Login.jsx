import React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = (redirectUrl) => {
    navigate(redirectUrl); // Redirect to the appropriate panel
  };

  return (
    <div className="login-container">
      <div className="left-panel">
      </div>
      <div className="right-panel">
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default Login;
