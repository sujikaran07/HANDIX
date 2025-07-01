import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '.././styles/admin/AdminCustomer.css';
import axios from 'axios';

const EditCustomerForm = ({ onSave, onCancel, customer }) => {
  // State for form fields 
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accountType, setAccountType] = useState('');
  const [password, setPassword] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');
  const [emailError, setEmailError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    // Populate form fields with customer data when editing
    if (customer) {
      setFirstName(customer.firstName);
      setLastName(customer.lastName);
      setUserId(customer.c_id);
      setEmail(customer.email);
      setPhoneNumber(customer.phone);
      setAccountType(customer.accountType);
      setPassword(customer.password);
      setRegistrationDate(customer.registrationDate);
    }
  }, [customer]);

  // Validation functions
  const validateName = (name) => /^[A-Za-z ]+$/.test(name.trim());
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(phone);

  // Handle save button click with validation and API call
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
    const updatedCustomer = {
      c_id: userId,
      firstName,
      lastName,
      email,
      phone: phoneNumber,
      accountType,
      password,
      registrationDate,
    };
    try {
      await axios.put(`http://localhost:5000/api/customers/${userId}`, updatedCustomer);
      onSave(updatedCustomer);
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  return (
    <div className="container mt-3">
      <div className="add-customer-form-container p-4 edit-customer-form">
        <h4 className="mb-4">Edit Customer</h4>
        <form>
          <div className="row mb-4">
            <div className="col-md-6">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input
                type="text"
                className="form-control"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
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
                onChange={(e) => setLastName(e.target.value)}
                pattern="[A-Za-z ]*"
              />
              {lastNameError && <div className="text-danger small">{lastNameError}</div>}
            </div>
          </div>
          <div className="row mb-3">
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
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                inputMode="numeric"
                pattern="[0-9]{10}"
              />
              {phoneError && <div className="text-danger small">{phoneError}</div>}
            </div>
            <div className="col-md-6">
              <label htmlFor="accountType" className="form-label">Account Type</label>
              <select
                className="form-select"
                id="accountType"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
              >
                <option value="Personal">Personal</option>
                <option value="Business">Business</option>
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="text"
                className="form-control"
                id="password"
                value={password}
                readOnly
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="registrationDate" className="form-label">Registration Date</label>
              <input
                type="text"
                className="form-control"
                id="registrationDate"
                value={registrationDate}
                readOnly
              />
            </div>
          </div>
          <div className="d-flex justify-content-end mt-2">
            <button type="button" className="btn btn-success me-2" onClick={handleSave}>Update</button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerForm;
