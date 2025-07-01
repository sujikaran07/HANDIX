import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '.././styles/admin/AdminEmployee.css';

const AddEmployeeForm = ({ onSave, onCancel }) => {
  // State for form fields 
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobRole, setJobRole] = useState('Artisan');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [existingEIds, setExistingEIds] = useState([]);
  const [emailError, setEmailError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    // Fetch existing E-IDs for unique generation
    const fetchExistingEIds = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/employees/eids');
        setExistingEIds(response.data);
        generateUniqueEId(response.data);
      } catch (error) {
        console.error('Error fetching existing E-IDs:', error);
      }
    };
    fetchExistingEIds();
  }, []);

  // Generate unique E-ID
  const generateUniqueEId = (existingEIds) => {
    let newEId;
    let counter = existingEIds.length + 1;
    do {
      newEId = `E${String(counter).padStart(3, '0')}`;
      counter++;
    } while (existingEIds.includes(newEId));
    setUserId(newEId);
  };

  // Generate random password
  const generatePassword = () => {
    const newPassword = Math.random().toString(36).slice(-8);
    setPassword(newPassword);
  };

  // Validation functions
  const validateName = (name) => /^[A-Za-z ]+$/.test(name.trim());
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(phone);
  const validatePassword = (password) => password.length >= 8;

  // Handle save button click
  const handleSave = async () => {
    let valid = true;
    setFirstNameError('');
    setLastNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    if (!validateName(firstName)) {
      setFirstNameError('First name can only contain letters and spaces.');
      valid = false;
    }
    if (!validateName(lastName)) {
      setLastNameError('Last name can only contain letters and spaces.');
      valid = false;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }
    if (!validatePhone(phoneNumber)) {
      setPhoneError('Phone number must be exactly 10 digits.');
      valid = false;
    }
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters.');
      valid = false;
    }
    if (!valid) return;
    const newEmployee = {
      eId: userId, 
      firstName,
      lastName,
      email,
      phone: phoneNumber,
      role: jobRole === 'Admin' ? 1 : 2, 
      password,
    };
    try {
      await onSave(newEmployee);
      resetForm();
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Failed to save employee. Please try again.');
    }
  };

  // Reset form fields
  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setJobRole('Artisan');
    generateUniqueEId(existingEIds);
    generatePassword();
    setEmail('');
    setPhoneNumber('');
  };

  useEffect(() => {
    // Generate password on mount
    generatePassword();
  }, []);

  return (
    <div className="add-employee-form">
      <h4 className="mb-4">Add New Employee</h4>
      <form>
        {/* First/Last Name */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="firstName" className="form-label">First Name</label>
            <input
              type="text"
              className="form-control"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value.replace(/[^A-Za-z ]/g, ''))}
              pattern="[A-Za-z ]*"
            />
            {firstNameError && <div className="text-danger small">{firstNameError}</div>}
          </div>
          <div className="col-md-6">
            <label htmlFor="lastName" className="form-label">Last Name</label>
            <input
              type="text"
              className="form-control"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value.replace(/[^A-Za-z ]/g, ''))}
              pattern="[A-Za-z ]*"
            />
            {lastNameError && <div className="text-danger small">{lastNameError}</div>}
          </div>
        </div>
        {/* Job Role and E-ID */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="jobRole" className="form-label">Job Role</label>
            <select
              className="form-select"
              id="jobRole"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
            >
              <option value="Artisan">Artisan</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="col-md-6">
            <label htmlFor="userId" className="form-label">E-ID</label>
            <input
              type="text"
              className="form-control"
              id="userId"
              value={userId}
              readOnly
            />
          </div>
        </div>
        {/* Email and Phone */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailError && <div className="text-danger small">{emailError}</div>}
          </div>
          <div className="col-md-6">
            <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-control"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
              inputMode="numeric"
              pattern="[0-9]{10}"
            />
            {phoneError && <div className="text-danger small">{phoneError}</div>}
          </div>
        </div>
        {/* Password */}
        <div className="row mb-3">
          <div className="col-md-12">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="text"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {passwordError && <div className="text-danger small">{passwordError}</div>}
          </div>
        </div>
        {/* Save/Cancel Buttons */}
        <div className="d-flex justify-content-between">
          <div>
            <button type="button" className="btn btn-success me-2" onClick={handleSave}>Save</button>
          </div>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployeeForm;