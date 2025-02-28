import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import 'bootstrap/dist/css/bootstrap.min.css';
import '.././styles/admin/AdminCustomer.css';
import axios from 'axios';

const AddCustomerForm = ({ onSave, onCancel, selectedCustomer }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cId, setCId] = useState(selectedCustomer ? selectedCustomer.c_id : '');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');  
  const [country, setCountry] = useState('Sri Lanka');
  const [accountType, setAccountType] = useState('Retail');
  const [password, setPassword] = useState(uuidv4().slice(0, 8));
  const [registrationDate, setRegistrationDate] = useState(new Date().toLocaleDateString());
  const [error, setError] = useState('');

  const handleSave = async () => {
    const newCustomer = {
      c_id: cId,
      firstName, 
      lastName,  
      email,
      phone: phoneNumber,  
      country,
      accountType,
      password,
      registrationDate,
      accountStatus: accountType === 'Retail' ? 'Approved' : 'Pending', 
    };
    try {
      console.log('Saving customer with data:', newCustomer); 
      await axios.post('http://localhost:5000/api/customers', newCustomer);
      onSave(newCustomer); 
      onCancel(); 
    } catch (error) {
      console.error('Error saving customer:', error);
      if (error.response && error.response.data.message === 'Email already exists') {
        setError('Email already exists. Please use a different email.');
      } else {
        setError('Error saving customer. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setCId(uuidv4());
    setEmail('');
    setPhoneNumber('');
    setCountry('Sri Lanka');
    setAccountType('Retail');
    setPassword(uuidv4().slice(0, 8));
    setRegistrationDate(new Date().toLocaleDateString());
  };

  return (
    <>
      <h4 className="mb-4">Add New Customer</h4>
      {error && <div className="alert alert-danger">{error}</div>}
      <form>
        <div className="row mb-3 form-group">
          <div className="col-md-4">
            <label htmlFor="firstName" className="form-label">First Name</label>
            <input
              type="text"
              className="form-control"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="lastName" className="form-label">Last Name</label>
            <input
              type="text"
              className="form-control"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="cId" className="form-label">C-ID</label>
            <input
              type="text"
              className="form-control"
              id="cId"
              value={cId}
              readOnly
            />
          </div>
        </div>
        <div className="row mb-3 form-group">
          <div className="col-md-4">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-control"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="country" className="form-label">Country</label>
            <input
              type="text"
              className="form-control"
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
        </div>
        <div className="row mb-3 form-group">
          <div className="col-md-4">
            <label htmlFor="accountType" className="form-label">Account Type</label>
            <select
              className="form-select"
              id="accountType"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
            >
              <option value="Retail">Retail</option>
              <option value="Wholesale">Wholesale</option>
            </select>
          </div>
          <div className="col-md-4">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="text"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="col-md-4">
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
        <div className="d-flex justify-content-between mt-3 button-group">
          <div>
            <button type="button" className="btn btn-success me-2" onClick={handleSave}>Save</button>
          </div>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </>
  );
};

export default AddCustomerForm;