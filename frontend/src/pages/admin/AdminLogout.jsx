import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageLogout from '../../components/ManageLogout';
import '../../styles/admin/AdminLogout.css';

// Admin logout page with confirmation functionality
const AdminLogoutPage = () => {
  return (
    <div className="admin-logout-page-unique">
      {/* Admin navigation sidebar */}
      <AdminSidebar />
      <div className="main-content-unique">
        {/* Top navigation bar */}
        <AdminTopbar />
        {/* Logout confirmation component */}
        <ManageLogout />
      </div>
    </div>
  );
};

export default AdminLogoutPage;
