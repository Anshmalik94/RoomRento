import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import './NotificationBell.css';

const NotificationBellDisplay = ({ bellIcon }) => {
  console.log('🚀 NotificationBellDisplay component rendered!');
  const { notifications, unreadCount, markSingleAsRead, fetchNotifications } = useNotifications();
  console.log('📊 NotificationBellDisplay data:', { notifications: notifications?.length, unreadCount });
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
    console.log('🔔 NotificationBellDisplay clicked, current state:', isDropdownOpen);
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleViewAllNotifications = () => {
    console.log('📄 View All clicked');
    setIsDropdownOpen(false);
    navigate('/notifications');
  };

  const handleNotificationClick = (notification) => {
    console.log('🎯 Notification clicked in Display:', notification._id, notification.message);
    console.log('🔍 Notification details:', notification);
    
    // Mark as read if unread
    if (!notification.isRead) {
      console.log('📝 Marking as read in Display:', notification._id);
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
    
    console.log('🌍 Navigating to:', navigationPath);
    setIsDropdownOpen(false);
    
    if (navigationPath !== '#') {
      navigate(navigationPath);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    console.log('🔄 Marking notification as read in Display:', notificationId);
    setLoading(true);
    try {
      await markSingleAsRead(notificationId);
      console.log('✅ Successfully marked as read:', notificationId);
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
                className="btn btn-sm btn-link"
                onClick={handleViewAllNotifications}
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
