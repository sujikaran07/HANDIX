import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageTransactions from '../../components/ManageTransactions';
import TransactionViewForm from '../../components/TransactionViewForm';
import '../../styles/admin/AdminTransaction.css';

const AdminTransactionPage = () => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [currentView, setCurrentView] = useState('transactions'); 

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setCurrentView('details');
  };

  const handleBackToTransactions = () => {
    setSelectedTransaction(null);
    setCurrentView('transactions');
  };

  return (
    <div className="admin-transaction-page">
      <AdminSidebar />
      <div className="main-content">
        <AdminTopbar />
        {currentView === 'transactions' && (
          <ManageTransactions 
            onViewTransaction={handleViewTransaction}
          />
        )}
        {currentView === 'details' && selectedTransaction && (
          <TransactionViewForm 
            transaction={selectedTransaction} 
            onBack={handleBackToTransactions} 
          />
        )}
      </div>
    </div>
  );
};

export default AdminTransactionPage; 