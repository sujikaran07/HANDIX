import React from "react";
import { Form, Button } from "react-bootstrap";
import "../styles/Login.css";
import { FaUser, FaLock } from "react-icons/fa";
import Hlogo from "../assets/logo1.png";

const LoginForm = () => {
  return (
    <div className="login-form">
      <div className="form-header">
        <img src={Hlogo} alt="Logo" className="logo" />
        <h3>Welcome Back!</h3>
      </div>
      <Form>
        <Form.Group className="mb-3" controlId="formUsername">
          <Form.Label>Username</Form.Label>
          <div className="input-group">
            <span className="input-icon">
              <FaUser />
            </span>
            <Form.Control type="text" placeholder="Enter Username" />
          </div>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <div className="input-group">
            <span className="input-icon">
              <FaLock />
            </span>
            <Form.Control type="password" placeholder="Enter Password" />
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
