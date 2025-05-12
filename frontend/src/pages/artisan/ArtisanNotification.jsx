import React, { useState, useEffect } from 'react';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import { FaBell, FaCheckCircle, FaTimesCircle, FaShippingFast, FaExclamationCircle, FaInfoCircle, FaTrashAlt, FaCheck } from 'react-icons/fa';
import '../../styles/artisan/ArtisanDashboard.css';
import '../../styles/artisan/ArtisanNotification.css';

const ArtisanNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

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

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  // Group notifications by date
  const groupNotificationsByDate = () => {
    const grouped = {};
    
    filteredNotifications.forEach(notification => {
      const date = new Date(notification.timestamp);
      const dateKey = date.toDateString() === new Date().toDateString() 
        ? 'Today'
        : date.toDateString() === new Date(new Date().setDate(new Date().getDate() - 1)).toDateString()
          ? 'Yesterday'
          : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(notification);
    });
    
    return grouped;
  };

  const groupedNotifications = groupNotificationsByDate();

  return (
    <div className="artisan-notification-page">
      <ArtisanSidebar />
      <div className="artisan-main-content">
        <ArtisanTopBar />
        
        <div className="container mt-4 notification-container">
          <div className="card notification-card">
            <div className="notification-header d-flex justify-content-between align-items-center">
              <div className="title-section d-flex align-items-center">
                <FaBell className="notification-icon" />
                <div className="text-section">
                  <h2>Notifications</h2>
                  <p>Stay updated with your latest activities</p>
                </div>
              </div>
              <div className="d-flex align-items-center">
                {notifications.length > 0 && (
                  <div className="action-buttons">
                    <button className="btn btn-outline-primary action-btn" onClick={markAllAsRead}>
                      <FaCheck className="btn-icon" /> Mark all read
                    </button>
                    <button className="btn btn-outline-danger action-btn" onClick={clearAllNotifications}>
                      <FaTrashAlt className="btn-icon" /> Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="notification-filter-bar">
              <div className="filter-tabs">
                <button 
                  className={`filter-tab ${filter === 'all' ? 'active' : ''}`} 
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-tab ${filter === 'unread' ? 'active' : ''}`} 
                  onClick={() => setFilter('unread')}
                >
                  Unread
                </button>
                <button 
                  className={`filter-tab ${filter === 'read' ? 'active' : ''}`} 
                  onClick={() => setFilter('read')}
                >
                  Read
                </button>
              </div>
              <div className="notification-count">
                {filter === 'all' ? notifications.length : 
                 filter === 'unread' ? notifications.filter(n => !n.read).length :
                 notifications.filter(n => n.read).length} notifications
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
              ) : filteredNotifications.length === 0 ? (
                <div className="empty-state">
                  <FaBell size={48} className="text-muted mb-3" />
                  <h5>No notifications {filter !== 'all' ? `(${filter})` : ''}</h5>
                  <p className="text-muted">
                    {filter === 'all' 
                      ? "You're all caught up! Check back later for new updates."
                      : filter === 'unread' 
                        ? "You don't have any unread notifications."
                        : "You don't have any read notifications."}
                  </p>
                </div>
              ) : (
                <div className="notifications-list">
                  {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                    <div key={date} className="notification-group">
                      <div className="notification-date-header">
                        <span>{date}</span>
                      </div>
                      {dateNotifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        >
                          <div className="notification-icon-container">
                            {renderIcon(notification.type)}
                          </div>
                          <div className="notification-content-container">
                            <div className="notification-message">
                              <p className={!notification.read ? 'fw-bold' : ''}>
                                {notification.message}
                              </p>
                              <span className="notification-time">
                                {formatTimestamp(notification.timestamp).split(',')[1] || formatTimestamp(notification.timestamp)}
                              </span>
                            </div>
                            <div className="notification-footer">
                              <div className="priority-badge">
                                {notification.priority === 'high' && (
                                  <span className="high-priority">High priority</span>
                                )}
                                {notification.priority === 'medium' && (
                                  <span className="medium-priority">Medium priority</span>
                                )}
                              </div>
                              <div className="notification-actions">
                                {!notification.read && (
                                  <button 
                                    className="notification-action-btn read-btn" 
                                    onClick={(e) => {e.stopPropagation(); markAsRead(notification.id);}}
                                  >
                                    Mark as read
                                  </button>
                                )}
                                <button 
                                  className="notification-action-btn delete-btn" 
                                  onClick={(e) => {e.stopPropagation(); deleteNotification(notification.id);}}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
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
