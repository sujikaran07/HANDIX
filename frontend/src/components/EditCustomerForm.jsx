import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '.././styles/admin/AdminCustomer.css';

const EditCustomerForm = ({ onSave, onCancel, customer }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('Sri Lanka');
  const [accountType, setAccountType] = useState('Retail');
  const [password, setPassword] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');

  useEffect(() => {
    if (customer) {
      setFirstName(customer.name.split(' ')[0]);
      setLastName(customer.name.split(' ')[1]);
      setUserId(customer.id);
      setEmail(customer.email);
      setPhoneNumber(customer.phone);
      setCountry(customer.country);
      setAccountType(customer.accountType);
      setPassword(customer.password);
      setRegistrationDate(customer.registrationDate);
    }
  }, [customer]);

  const handleSave = () => {
    const updatedCustomer = {
      id: userId,
      name: `${firstName} ${lastName}`,
      email,
      phone: phoneNumber,
      country,
      accountType,
      password,
      registrationDate,
    };
    onSave(updatedCustomer);
  };

  return (
    <>
      <h4 className="mb-4">Edit Customer</h4>
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
        </div>
        <div className="row mb-3 form-group">
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
            <button type="button" className="btn btn-success me-2" onClick={handleSave}>Update</button>
          </div>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </>
  );
};

export default EditCustomerForm;
