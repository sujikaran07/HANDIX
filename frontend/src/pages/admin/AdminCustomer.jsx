import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageCustomer from '../../components/ManageCustomer';
import AddCustomerForm from '../../components/AddCustomerForm';
import EditCustomerForm from '../../components/EditCustomerForm';
import '../../styles/admin/AdminCustomer.css';

const AdminCustomerPage = () => {
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [showEditCustomerForm, setShowEditCustomerForm] = useState(false);

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  const handleBackToList = () => {
    setShowCustomerDetails(false);
    setSelectedCustomer(null);
  };

  const handleAddCustomer = () => {
    setShowAddCustomerForm(true);
  };

  const handleCancelAddCustomer = () => {
    setShowAddCustomerForm(false);
  };

  const handleSaveCustomer = (newCustomer) => {
    // Handle saving the new customer (e.g., update state or make API call)
    setShowAddCustomerForm(false);
  };

  const handleSaveAndAddAnotherCustomer = (newCustomer) => {
    // Handle saving the new customer (e.g., update state or make API call)
    // Keep the form open for adding another customer
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowEditCustomerForm(true);
  };

  const handleCancelEditCustomer = () => {
    setShowEditCustomerForm(false);
    setSelectedCustomer(null);
  };

  const handleUpdateCustomer = (updatedCustomer) => {
    // Handle updating the customer (e.g., update state or make API call)
    setShowEditCustomerForm(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="admin-customer-page">
      <AdminSidebar />
      <div className="main-content">
        <AdminTopbar />
        {showCustomerDetails ? (
          <div>
            {/* Render customer details here */}
            <button onClick={handleBackToList}>Back to List</button>
          </div>
        ) : showEditCustomerForm ? (
          <EditCustomerForm
            customer={selectedCustomer}
            onSave={handleUpdateCustomer}
            onCancel={handleCancelEditCustomer}
          />
        ) : (
          <ManageCustomer
            onViewCustomer={handleViewCustomer}
            onAddCustomer={handleAddCustomer}
            showAddCustomerForm={showAddCustomerForm}
            onCancelAddCustomer={handleCancelAddCustomer}
            onSaveCustomer={handleSaveCustomer}
            onSaveAndAddAnotherCustomer={handleSaveAndAddAnotherCustomer}
            onEditCustomer={handleEditCustomer}
          />
        )}
      </div>
    </div>
  );
};

export default AdminCustomerPage;
