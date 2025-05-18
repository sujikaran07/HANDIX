import React, { useState, useEffect } from 'react';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import { FaBell, FaBox, FaUserTie, FaClipboardList } from 'react-icons/fa';
import { format } from 'date-fns';
import '../../styles/artisan/ArtisanDashboard.css';
import '../../styles/artisan/ArtisanNotification.css';

const groupByDate = (notifications) => {
  // Sort notifications by timestamp descending before grouping
  const sorted = [...notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return sorted.reduce((acc, n) => {
    const dateKey = n.timestamp ? format(new Date(n.timestamp), 'MMMM d, yyyy') : 'Unknown date';
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(n);
    return acc;
  }, {});
};

const ArtisanNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const artisan_id = localStorage.getItem('artisanId');
        const artisan_name = localStorage.getItem('artisanName');
        const params = new URLSearchParams();
        if (artisan_id) params.append('artisan_id', artisan_id);
        if (artisan_name) params.append('artisan_name', artisan_name);
        const response = await fetch(`/api/notifications?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch notifications');
        const data = await response.json();
        setNotifications(data);
        console.log('Notifications from backend:', data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const grouped = groupByDate(notifications);

  return (
    <div className="artisan-notification-page">
      <ArtisanSidebar />
      <div className="artisan-main-content">
        <ArtisanTopBar />
        <div className="container mt-4 notification-container">
          <div className="card notification-card">
            <div className="notification-header d-flex align-items-center">
              <FaBell className="notification-icon" />
              <div className="text-section">
                <h2>Notifications</h2>
                <p>Stay updated with your latest activities</p>
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
              ) : notifications.length === 0 ? (
                <div className="empty-state">
                  <FaBell size={48} className="text-muted mb-3" />
                  <h5>No notifications</h5>
                  <p className="text-muted">You're all caught up! Check back later for new updates.</p>
                </div>
              ) : (
                <div className="notifications-list">
                  {Object.entries(grouped).map(([date, notifs]) => (
                    <div key={date}>
                      <div className="notification-date-header">{date}</div>
                      {notifs.map((n, idx) => {
                        // Assign color class based on notification type
                        let typeClass = '';
                        if (n.type === 'restock') typeClass = 'card-restock';
                        else if (n.type === 'entry') typeClass = 'card-entry';
                        else if (n.type === 'order') typeClass = 'card-order';
                        return (
                          <div key={idx} className={`notification-item notification-card-row ${typeClass}`}>
                            <div className="notification-icon-container">
                              {n.type === 'restock' && <FaBox />}
                              {n.type === 'entry' && <FaClipboardList />}
                              {n.type === 'order' && <FaUserTie />}
                            </div>
                            <div className="notification-content-container">
                              <div>
                                <div className="notification-message">{n.message}</div>
                                {n.type === 'restock' && n.notes && (
                                  <div className="notification-notes">Notes: {n.notes}</div>
                                )}
                              </div>
                            </div>
                            <div className="notification-time">
                              {n.timestamp && new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        );
                      })}
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
