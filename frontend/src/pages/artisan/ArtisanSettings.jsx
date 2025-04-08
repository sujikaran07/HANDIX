import React, { useState } from 'react';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopbar';
import ManageArtisanSettings from '../../components/artisan/ManageArtisanSettings';
import '../../styles/artisan/ArtisanSettings.css';

const ArtisanSettingsPage = () => {
  const [selectedSetting, setSelectedSetting] = useState(null);

  const handleViewSetting = (setting) => {
    setSelectedSetting(setting);
  };

  const handleBackToSettings = () => {
    setSelectedSetting(null);
  };

  return (
    <div className="artisan-settings-page">
      <ArtisanSidebar />
      <div className="artisan-main-content">
        <ArtisanTopBar />
        {selectedSetting ? (
          <div>
            <button onClick={handleBackToSettings}>Back to Settings</button>
          </div>
        ) : (
          <ManageArtisanSettings onViewSetting={handleViewSetting} />
        )}
      </div>
    </div>
  );
};

export default ArtisanSettingsPage;
