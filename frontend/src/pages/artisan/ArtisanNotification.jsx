import React, { useState, useEffect } from 'react';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import { FaBell, FaCheckCircle, FaTimesCircle, FaShippingFast, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import '../../styles/artisan/ArtisanDashboard.css';
import '../../styles/artisan/ArtisanNotification.css';

const ArtisanNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('artisanToken');
        if (!token) {
          console.error('No token found for artisan');
          return;
        }

        // In a real app, replace this with actual API call
        // const response = await fetch('http://localhost:5000/api/artisan/notifications', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        
        // Simulate API response
        setTimeout(() => {
          // Dummy data
          const data = [
            {
              id: 1,
              type: 'order_assigned',
              message: 'New order #O325 has been assigned to you',
              timestamp: '2023-08-01T09:30:00',
              read: false,
              priority: 'high'
            },
            {
              id: 2,
              type: 'order_status',
              message: 'Order #O312 has been shipped to the customer',
              timestamp: '2023-08-01T08:15:00',
              read: true,
              priority: 'medium'
            },
            {
              id: 3,
              type: 'urgent',
              message: 'Urgent: Please complete Order #O318 before tomorrow',
              timestamp: '2023-07-31T16:45:00',
              read: false,
              priority: 'high'
            },
            {
              id: 4,
              type: 'product_approved',
              message: 'Your product "Handwoven Basket" has been approved',
              timestamp: '2023-07-30T14:20:00',
              read: true,
              priority: 'medium'
            },
            {
              id: 5, 
              type: 'product_rejected',
              message: 'Your product "Wooden Sculpture" needs revisions before approval',
              timestamp: '2023-07-29T11:10:00',
              read: true,
              priority: 'medium'
            },
            {
              id: 6,
              type: 'info',
              message: 'The system will be under maintenance on August 5th from 2-4 AM',
              timestamp: '2023-07-28T09:00:00',
              read: true,
              priority: 'low'
            }
          ];
          
          setNotifications(data);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const renderIcon = (type) => {
    switch(type) {
      case 'order_assigned':
        return <FaBell className="text-primary" size={18} />;
      case 'order_status':
        return <FaShippingFast className="text-info" size={18} />;
      case 'urgent':
        return <FaExclamationCircle className="text-danger" size={18} />;
      case 'product_approved':
        return <FaCheckCircle className="text-success" size={18} />;
      case 'product_rejected':
        return <FaTimesCircle className="text-danger" size={18} />;
      default:
        return <FaInfoCircle className="text-secondary" size={18} />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    
    // If yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise show date and time
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + 
           date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="artisan-notification-page">
      <ArtisanSidebar />
      <div className="artisan-main-content">
        <ArtisanTopBar />
        
        <div className="container mt-4 notification-container">
          <div className="card p-4 notification-card">
            <div className="manage-orders-header d-flex justify-content-between align-items-center mb-3">
              <div className="title-section">
                <div className="icon-and-title">
                  <FaBell className="notification-icon" />
                  <div className="text-section">
                    <h2>Notifications</h2>
                    <p>Stay updated with your latest activities</p>
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center">
                {notifications.length > 0 && (
                  <div className="btn-group">
                    <button className="btn btn-outline-primary btn-sm me-2" onClick={markAllAsRead}>
                      Mark all as read
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={clearAllNotifications}>
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="notification-content">
              {isLoading ? (
                <div className="text-center my-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading notifications...</p>
                </div>
              ) : (
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-0">
                    {notifications.length === 0 ? (
                      <div className="text-center py-5">
                        <FaBell size={48} className="text-muted mb-3" />
                        <h5>No notifications yet</h5>
                        <p className="text-muted">You're all caught up! Check back later for new updates.</p>
                      </div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`list-group-item list-group-item-action d-flex ${!notification.read ? 'bg-light' : ''}`}
                          >
                            <div className="me-3 pt-1">
                              {renderIcon(notification.type)}
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-center">
                                <h6 className={`mb-1 ${!notification.read ? 'fw-bold' : ''}`}>
                                  {notification.message}
                                </h6>
                                <small className="text-muted">
                                  {formatTimestamp(notification.timestamp)}
                                </small>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                  {notification.priority === 'high' && (
                                    <span className="text-danger">High priority</span>
                                  )}
                                </small>
                                <div>
                                  {!notification.read && (
                                    <button 
                                      className="btn btn-sm btn-link p-0 me-2" 
                                      onClick={() => markAsRead(notification.id)}
                                    >
                                      Mark as read
                                    </button>
                                  )}
                                  <button 
                                    className="btn btn-sm btn-link text-danger p-0" 
                                    onClick={() => deleteNotification(notification.id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisanNotification;
