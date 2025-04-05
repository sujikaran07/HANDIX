import React from 'react';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopbar from '../../components/artisan/ArtisanTopbar'; // Corrected path
import ManageArtisanLogout from '../../components/artisan/ManageArtisanLogout';
import '../../styles/artisan/ArtisanLogout.css';

const ArtisanLogoutPage = () => {
  return (
    <div className="artisan-logout-page-unique">
      <ArtisanSidebar />
      <div className="main-content-unique">
        <ArtisanTopbar />
        <ManageArtisanLogout />
      </div>
    </div>
  );
};

export default ArtisanLogoutPage;
