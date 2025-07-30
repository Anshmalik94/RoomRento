import React, { useState, useEffect } from 'react';
import { Button, Badge } from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../config';
import LoadingSpinner from './LoadingSpinner';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all notifications
  const fetchAllNotifications = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      setError('Please login to view notifications');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Backend structure: { success: true, data: { notifications: [...], total: number } }
      const notificationsData = response.data?.data?.notifications || response.data?.notifications || [];
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNotifications();
  }, []); // Only run once on mount

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    
    try {
      await axios.patch(
        `${API_URL}/api/notifications/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAllNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    const token = localStorage.getItem('token');
    
    try {
      await axios.delete(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchAllNotifications();
    } catch (error) {
      console.error('Error clearing notifications:', error);
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

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    const token = localStorage.getItem('token');
    
    try {
      await axios.patch(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAllNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    console.log('Notification page click:', notification._id, notification.message);
    
    // Mark as read if not already read
    if (!notification.isRead && !notification.read) {
      await markAsRead(notification._id);
    }
    
    // Determine where to navigate based on notification type and data
    let targetUrl = null;
    
    if (notification.relatedRoomId) {
      targetUrl = `/room/${notification.relatedRoomId}`;
    } else if (notification.relatedBookingId || notification.type === 'booking_request') {
      targetUrl = '/my-booking-requests';
    } else if (notification.link) {
      targetUrl = notification.link;
    }
    
    if (targetUrl) {
      console.log('Navigating to:', targetUrl);
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 200);
    } else {
      console.log('No navigation target for notification:', notification._id);
    }
  };

  // Show loading spinner if loading
  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-3 text-muted">Loading notifications...</p>
        </div>
      </div>
    );
  }

  // Show message if no token
  const token = localStorage.getItem('token');
  if (!token) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">
          <h4>Authentication Required</h4>
          <p>Please login to view your notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 notifications-page">
      <h2 className="mb-4">All Notifications</h2>
      
      {notifications.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-bell-slash fs-1 mb-3"></i>
          <div>No notifications yet</div>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-end mb-3 gap-2">
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={markAllAsRead} 
              disabled={notifications.every(n => n.isRead || n.read)}
            >
              Mark All as Read
            </Button>
            <Button 
              variant="outline-danger" 
              size="sm" 
              onClick={clearAllNotifications} 
              disabled={notifications.length === 0}
            >
              Clear All
            </Button>
          </div>
          
          <div className="list-group shadow-sm">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`list-group-item d-flex align-items-start ${!(notification.isRead || notification.read) ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
                style={{ cursor: 'pointer' }}
              >
                <div className="me-3 mt-1">{getNotificationIcon(notification.type)}</div>
                <div className="flex-grow-1">
                  <div className="fw-bold small mb-1">
                    {notification.title || 'Notification'}
                  </div>
                  <div className="small">{notification.message}</div>
                  <div className="text-muted small mt-1">
                    {getTimeAgo(notification.createdAt)}
                  </div>
                </div>
                {!(notification.isRead || notification.read) && (
                  <>
                    <Badge bg="primary" className="ms-2">New</Badge>
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="ms-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification._id);
                      }}
                    >
                      Mark as Read
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsPage;