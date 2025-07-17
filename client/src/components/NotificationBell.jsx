import React, { useState, useEffect, useCallback } from 'react';
import { Dropdown, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const token = localStorage.getItem('token');

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      // Handle error silently for production
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUnreadCount();
      // Set up polling for notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [token, fetchUnreadCount]);

  const fetchNotifications = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/notifications?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsSeen = async (notificationId) => {
    try {
      await axios.patch(`${API_URL}/api/notifications/${notificationId}/seen`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => prev.map(notif => 
        notif._id === notificationId ? { ...notif, seen: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as seen:', error);
    }
  };

  const handleDropdownToggle = (isOpen) => {
    setShowDropdown(isOpen);
    if (isOpen && notifications.length === 0) {
      fetchNotifications();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_request':
        return <i className="bi bi-calendar-plus text-primary"></i>;
      case 'booking_approved':
        return <i className="bi bi-check-circle text-success"></i>;
      case 'booking_rejected':
        return <i className="bi bi-x-circle text-danger"></i>;
      default:
        return <i className="bi bi-bell text-info"></i>;
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (!token) return null;

  return (
    <Dropdown 
      align="end" 
      onToggle={handleDropdownToggle}
      show={showDropdown}
      className="notification-bell"
    >
      <Dropdown.Toggle 
        variant="link" 
        className="border-0 position-relative p-2 notification-toggle"
        style={{ textDecoration: 'none' }}
      >
        <i className="bi bi-bell fs-5 text-white"></i>
        {unreadCount > 0 && (
          <Badge 
            bg="danger" 
            pill 
            className="position-absolute top-0 start-100 translate-middle notification-badge"
            style={{ fontSize: '0.7rem' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="notification-dropdown shadow-lg">
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <h6 className="mb-0">Notifications</h6>
          <Link 
            to="/notifications" 
            className="text-decoration-none small"
            onClick={() => setShowDropdown(false)}
          >
            View All
          </Link>
        </div>

        <div className="notification-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {loading ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" />
              <div className="small text-muted mt-2">Loading...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-bell-slash fs-4 d-block mb-2"></i>
              <div className="small">No notifications yet</div>
            </div>
          ) : (
            notifications.map((notification) => (
              <Dropdown.Item
                key={notification._id}
                className={`notification-item border-bottom ${!notification.seen ? 'unread' : ''}`}
                onClick={() => {
                  if (!notification.seen) {
                    markAsSeen(notification._id);
                  }
                  setShowDropdown(false);
                }}
                as={Link}
                to={
                  notification.relatedRoomId 
                    ? `/room/${notification.relatedRoomId}` 
                    : notification.relatedBookingId 
                    ? '/my-booking-requests' 
                    : '#'
                }
              >
                <div className="d-flex align-items-start">
                  <div className="me-2 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="notification-message small">
                      {notification.message}
                    </div>
                    <div className="text-muted small">
                      {getTimeAgo(notification.createdAt)}
                    </div>
                  </div>
                  {!notification.seen && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              </Dropdown.Item>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="text-center border-top py-2">
            <Link 
              to="/notifications" 
              className="text-decoration-none small"
              onClick={() => setShowDropdown(false)}
            >
              View All Notifications
            </Link>
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationBell;
