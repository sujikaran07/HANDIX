import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageCustomer from '../../components/ManageCustomer';
import AddCustomerForm from '../../components/AddCustomerForm';
import EditCustomerForm from '../../components/EditCustomerForm';
import '../../styles/admin/AdminCustomer.css';
import axios from 'axios';

const AdminCustomerPage = () => {
  // State for customer list
  const [customers, setCustomers] = useState([]);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [showEditCustomerForm, setShowEditCustomerForm] = useState(false);

  useEffect(() => {
    // Fetch all customers on mount
    fetchCustomers();
  }, []);

  // Fetch all customers from backend
  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/customers');
      // Set customers state with fetched data
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // View customer details
  const handleViewCustomer = async (customer) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/customers/${customer.c_id}`);
      setSelectedCustomer(response.data); 
      setShowCustomerDetails(true);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  // Back to customer list from details
  const handleBackToList = () => {
    setShowCustomerDetails(false);
    setSelectedCustomer(null);
  };

  // Generate a new unique customer ID
  const generateNewCustomerId = () => {
    const existingIds = customers.map(customer => customer.c_id);
    let newId;
    let counter = customers.length + 1;
    do {
      newId = `C${String(counter).padStart(3, '0')}`;
      counter++;
    } while (existingIds.includes(newId));
    return newId;
  };

  // Show add customer form
  const handleAddCustomer = () => {
    const newCustomerId = generateNewCustomerId();
    setSelectedCustomer({ c_id: newCustomerId });
    setShowAddCustomerForm(true);
  };

  // Cancel add customer form
  const handleCancelAddCustomer = () => {
    setShowAddCustomerForm(false);
  };

  // Save new customer to backend
  const handleSaveCustomer = async (newCustomer) => {
    try {
      await axios.post('http://localhost:5000/api/customers', newCustomer);
      fetchCustomers();
      setShowAddCustomerForm(false);
      setSelectedCustomer(null); 
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  // Save and add another customer
  const handleSaveAndAddAnotherCustomer = async (newCustomer) => {
    try {
      await axios.post('http://localhost:5000/api/customers', newCustomer);
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  // Edit customer
  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowEditCustomerForm(true);
  };

  // Cancel edit customer form
  const handleCancelEditCustomer = () => {
    setShowEditCustomerForm(false); 
    setSelectedCustomer(null); 
  };

  // Update customer in backend
  const handleUpdateCustomer = async (updatedCustomer) => {
    try {
      await axios.put(`http://localhost:5000/api/customers/${updatedCustomer.c_id}`, updatedCustomer);
      fetchCustomers(); 
      setShowEditCustomerForm(false); 
      setSelectedCustomer(null); 
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  // Approve customer
  const handleApproveCustomer = async (c_id) => {
    try {
      await axios.put(`http://localhost:5000/api/customers/${c_id}/approve`);
      fetchCustomers();
    } catch (error) {
      console.error('Error approving customer:', error);
    }
  };

  // Reject customer
  const handleRejectCustomer = async (c_id) => {
    try {
      await axios.put(`http://localhost:5000/api/customers/${c_id}/reject`);
      fetchCustomers();
    } catch (error) {
      console.error('Error rejecting customer:', error);
    }
  };

  // Delete customer
  const handleDeleteCustomer = async (c_id) => {
    try {
      await axios.delete(`http://localhost:5000/api/customers/${c_id}`);
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  return (
    <div className="admin-customer-page">
      <AdminSidebar />
      <div className="main-content">
        <AdminTopbar />
        {showCustomerDetails ? (
          <div>
            {/* Customer details view */}
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
            customers={customers}
            onViewCustomer={handleViewCustomer}
            onAddCustomer={handleAddCustomer}
            showAddCustomerForm={showAddCustomerForm}
            onCancelAddCustomer={handleCancelAddCustomer}
            onSaveCustomer={handleSaveCustomer}
            onSaveAndAddAnotherCustomer={handleSaveAndAddAnotherCustomer}
            onEditCustomer={handleEditCustomer}
            selectedCustomer={selectedCustomer} 
            onApproveCustomer={handleApproveCustomer} 
            onRejectCustomer={handleRejectCustomer} 
            onDeleteCustomer={handleDeleteCustomer} 
          />
        )}
      </div>
    </div>
  );
};

export default AdminCustomerPage;
