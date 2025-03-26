import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '.././styles/admin/AdminEmployee.css';

const AddEmployeeForm = ({ onSave, onCancel }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobRole, setJobRole] = useState('Artisan');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [existingEIds, setExistingEIds] = useState([]);

  useEffect(() => {
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

  const generateUniqueEId = (existingEIds) => {
    let newEId;
    let counter = existingEIds.length + 1;
    do {
      newEId = `E${String(counter).padStart(3, '0')}`;
      counter++;
    } while (existingEIds.includes(newEId));
    setUserId(newEId);
  };

  const generatePassword = () => {
    const newPassword = Math.random().toString(36).slice(-8);
    setPassword(newPassword);
  };

  const handleSave = async () => {
    const newEmployee = {
      eId: userId, 
      firstName,
      lastName,
      email,
      phone: phoneNumber,
      role: jobRole === 'Admin' ? 1 : 2, // Map jobRole to roleId (1 for Admin, 2 for Artisan)
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
    generatePassword();
  }, []);

  return (
    <div className="add-employee-form">
      <h4 className="mb-4">Add New Employee</h4>
      <form>
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="firstName" className="form-label">First Name</label>
            <input
              type="text"
              className="form-control"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="lastName" className="form-label">Last Name</label>
            <input
              type="text"
              className="form-control"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
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
          </div>
          <div className="col-md-6">
            <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-control"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        </div>
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
          </div>
        </div>
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