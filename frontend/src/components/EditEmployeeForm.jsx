import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '.././styles/admin/AdminEmployee.css'; 
import axios from 'axios';

const EditEmployeeForm = ({ employee, onSave, onCancel }) => {
  // State for form fields 
  const [firstName, setFirstName] = useState(employee.firstName);
  const [lastName, setLastName] = useState(employee.lastName);
  const [jobRole, setJobRole] = useState(employee.role);
  const [userId, setUserId] = useState(employee.eId); 
  const [email, setEmail] = useState(employee.email);
  const [phoneNumber, setPhoneNumber] = useState(employee.phone);
  const [password, setPassword] = useState(employee.password);
  const [emailError, setEmailError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Validation functions
  const validateName = (name) => /^[A-Za-z ]+$/.test(name.trim());
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(phone);

  // Handle save button click
  const handleSave = async () => {
    let valid = true;
    setFirstNameError('');
    setLastNameError('');
    setEmailError('');
    setPhoneError('');
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
    if (!valid) return;

    const updatedEmployee = {
      firstName,
      lastName,
      email,
      phone: phoneNumber,
      roleId: jobRole === 'Admin' ? 1 : 2, 
    };

    try {
      const response = await axios.put(`http://localhost:5000/api/employees/${userId}`, updatedEmployee);
      if (response.status === 200) {
        console.log('Employee updated successfully:', response.data); 
        onSave({ ...employee, ...updatedEmployee }); 
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      console.error('Error updating employee:', error.response || error.message); 
      alert('Failed to update employee. Please try again.');
    }
  };

  return (
    <div className="edit-employee-form">
      <h4 className="mb-4">Edit Employee</h4>
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
        {/* Job Role and User ID */}
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
            <label htmlFor="userId" className="form-label">User ID</label>
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
              readOnly
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
              readOnly 
            />
          </div>
        </div>
        {/* Update/Cancel Buttons */}
        <div className="d-flex justify-content-between">
          <button type="button" className="btn btn-success me-2" onClick={handleSave}>Update</button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditEmployeeForm;
