import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageLogout from '../../components/ManageLogout';
import '../../styles/admin/AdminLogout.css';

const AdminLogoutPage = () => {
  return (
    <div className="admin-logout-page-unique">
      <AdminSidebar />
      <div className="main-content-unique">
        <AdminTopbar />
        <ManageLogout />
      </div>
    </div>
  );
};

export default AdminLogoutPage;
