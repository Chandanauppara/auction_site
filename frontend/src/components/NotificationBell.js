import React, { useState, useEffect } from 'react';
import { useAuctions } from '../context/AuctionContext';
import './NotificationBell.css';

const NotificationBell = () => {
  const { notifications, markNotificationAsRead, clearNotifications } = useAuctions();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Update unread count whenever notifications change
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }
    setIsOpen(false);
  };

  const handleClearAll = async () => {
    await clearNotifications();
    setIsOpen(false);
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="notification-bell">
      <button 
        className="bell-button" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button 
                className="clear-all-button"
                onClick={handleClearAll}
              >
                Clear All
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    {notification.details && (
                      <div className="notification-details">
                        {Object.entries(notification.details).map(([key, value]) => (
                          <span key={key} className="detail-item">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="notification-time">
                      {formatTimeAgo(notification.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 