import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import './NotificationBell.css';

const NotificationBellDisplay = ({ bellIcon }) => {
  const { notifications, unreadCount, markSingleAsRead, fetchNotifications } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const isMountedRef = useRef(true);

  // Polling setup - ONLY runs once per application
  useEffect(() => {
    // Initial fetch
    if (fetchNotifications) {
      fetchNotifications();

      // Setup polling interval
      pollingIntervalRef.current = setInterval(() => {
        if (isMountedRef.current && fetchNotifications) {
          fetchNotifications();
        }
      }, 30000); // 30 seconds
    }

    // Cleanup
    return () => {
      isMountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [fetchNotifications]); // Now fetchNotifications is memoized

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleViewAllNotifications = () => {
    setIsDropdownOpen(false);
    navigate('/notifications');
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
    
    // Determine navigation path based on notification properties
    let navigationPath = '#';
    
    if (notification.relatedRoomId) {
      navigationPath = `/room/${notification.relatedRoomId}`;
    } else if (notification.relatedBookingId) {
      navigationPath = '/my-booking-requests';
    } else if (notification.relatedHotelId) {
      navigationPath = `/hotel/${notification.relatedHotelId}`;
    } else if (notification.relatedShopId) {
      navigationPath = `/shop/${notification.relatedShopId}`;
    } else if (notification.type === 'booking_request') {
      navigationPath = '/my-booking-requests';
    } else if (notification.type === 'booking_approved' || notification.type === 'booking_rejected') {
      navigationPath = '/my-bookings';
    }
    setIsDropdownOpen(false);
    
    if (navigationPath !== '#') {
      navigate(navigationPath);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    setLoading(true);
    try {
      await markSingleAsRead(notificationId);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <div className="notification-bell" onClick={handleDropdownToggle}>
        {bellIcon}
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      {isDropdownOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h6>Notifications</h6>
            {unreadCount > 0 && (
              <span className="badge bg-primary">{unreadCount}</span>
            )}
          </div>

          <div className="notification-list">
            {loading && (
              <div className="notification-loading">
                <LoadingSpinner size="small" />
              </div>
            )}

            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-time">
                      {formatDate(notification.createdAt)}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="notification-dot"></div>
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button 
                className="btn btn-sm btn-link view-all-btn-custom"
                onClick={handleViewAllNotifications}
                style={{
                  color: '#6f42c1 !important',
                  fontWeight: '600 !important',
                  textDecoration: 'none !important',
                  border: 'none !important',
                  backgroundColor: 'transparent !important',
                  fontSize: '14px !important'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#5a2d91 !important';
                  e.target.style.textDecoration = 'underline !important';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#6f42c1 !important';
                  e.target.style.textDecoration = 'none !important';
                }}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBellDisplay;
