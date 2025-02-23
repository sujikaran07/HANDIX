import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageCustomer from '../../components/ManageCustomer';
import AddCustomerForm from '../../components/AddCustomerForm';
import EditCustomerForm from '../../components/EditCustomerForm';
import '../../styles/admin/AdminCustomer.css';
import axios from 'axios';

const AdminCustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [showEditCustomerForm, setShowEditCustomerForm] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/customers');
      console.log('Fetched customers:', response.data); 
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  const handleBackToList = () => {
    setShowCustomerDetails(false);
    setSelectedCustomer(null);
  };

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

  const handleAddCustomer = () => {
    const newCustomerId = generateNewCustomerId();
    setSelectedCustomer({ c_id: newCustomerId });
    setShowAddCustomerForm(true);
  };

  const handleCancelAddCustomer = () => {
    setShowAddCustomerForm(false);
  };

  const handleSaveCustomer = async (newCustomer) => {
    try {
      await axios.post('http://localhost:5000/api/customers', newCustomer);
      fetchCustomers();
      setShowAddCustomerForm(false);
      setSelectedCustomer(null); // Reset selected customer
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleSaveAndAddAnotherCustomer = async (newCustomer) => {
    try {
      await axios.post('http://localhost:5000/api/customers', newCustomer);
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowEditCustomerForm(true);
  };

  const handleCancelEditCustomer = () => {
    setShowEditCustomerForm(false);
    setSelectedCustomer(null);
  };

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

  const handleApproveCustomer = async (c_id) => {
    try {
      await axios.put(`http://localhost:5000/api/customers/${c_id}/approve`);
      fetchCustomers();
    } catch (error) {
      console.error('Error approving customer:', error);
    }
  };

  const handleRejectCustomer = async (c_id) => {
    try {
      await axios.put(`http://localhost:5000/api/customers/${c_id}/reject`);
      fetchCustomers();
    } catch (error) {
      console.error('Error rejecting customer:', error);
    }
  };

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
            customers={customers}
            onViewCustomer={handleViewCustomer}
            onAddCustomer={handleAddCustomer}
            showAddCustomerForm={showAddCustomerForm}
            onCancelAddCustomer={handleCancelAddCustomer}
            onSaveCustomer={handleSaveCustomer}
            onSaveAndAddAnotherCustomer={handleSaveAndAddAnotherCustomer}
            onEditCustomer={handleEditCustomer}
            selectedCustomer={selectedCustomer} // Pass selectedCustomer to ManageCustomer
            onApproveCustomer={handleApproveCustomer} // Pass approve function
            onRejectCustomer={handleRejectCustomer} // Pass reject function
            onDeleteCustomer={handleDeleteCustomer} // Pass delete function
          />
        )}
      </div>
    </div>
  );
};

export default AdminCustomerPage;
