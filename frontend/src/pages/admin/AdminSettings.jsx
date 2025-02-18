import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ManageSettings from '../../components/ManageSettings';
import '../../styles/admin/AdminSettings.css';

const AdminSettingsPage = () => {
  const [selectedSetting, setSelectedSetting] = useState(null);

  const handleViewSetting = (setting) => {
    setSelectedSetting(setting);
  };

  const handleBackToSettings = () => {
    setSelectedSetting(null);
  };

  return (
    <div className="admin-settings-page">
      <AdminSidebar />
      <div className="main-content">
        <AdminTopbar />
        {selectedSetting ? (
          <div> 
            <button onClick={handleBackToSettings}>Back to Settings</button>
          </div>
        ) : (
          <ManageSettings onViewSetting={handleViewSetting} />
        )}
      </div>
    </div>
  );
};

export default AdminSettingsPage;
