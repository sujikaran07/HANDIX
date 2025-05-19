import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import DiscountManagement from '../../components/pricing/DiscountManagement';
import ShippingManagement from '../../components/pricing/ShippingManagement';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTags, faShippingFast, faDownload } from '@fortawesome/free-solid-svg-icons';
import '../../styles/admin/AdminPricing.css';

const AdminPricingPage = () => {
  const [currentTab, setCurrentTab] = useState('discounts');

  return (
    <div className="admin-inventory-page pricing-page">
      <AdminSidebar />
      <div className="main-content">
        <AdminTopbar />
        <div className="container mt-4" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
          <div className="card p-4" style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', height: '100%' }}>
            <div className="manage-inventory-header d-flex justify-content-between align-items-center mb-3">
              <div className="title-section">
                <div className="icon-and-title">
                  <FontAwesomeIcon icon={currentTab === 'discounts' ? faTags : faShippingFast} className="inventory-icon" />
                  <div className="text-section">
                    <h2>Pricing Management</h2>
                    <p>Manage discounts and shipping fees</p>
                  </div>
                </div>
              </div>
              <div>
                <button className="export-btn">
                  <FontAwesomeIcon icon={faDownload} /> Export Data
                </button>
              </div>
            </div>
            
            <div className="filter-section mb-3">
              <div className="segmented-control">
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn ${currentTab === 'discounts' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setCurrentTab('discounts')}
                  >
                    <FontAwesomeIcon icon={faTags} className="me-2" /> Discount Codes
                  </button>
                  <button
                    type="button"
                    className={`btn ${currentTab === 'shipping' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setCurrentTab('shipping')}
                  >
                    <FontAwesomeIcon icon={faShippingFast} className="me-2" /> Shipping Rates
                  </button>
                </div>
              </div>
            </div>
            
            <div className="pricing-content" style={{ height: 'calc(100% - 150px)' }}>
              {currentTab === 'discounts' ? <DiscountManagement /> : <ShippingManagement />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPricingPage;
