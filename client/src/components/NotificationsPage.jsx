import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import './NotificationsPage.css';
import { Badge } from 'react-bootstrap';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAllNotifications = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data?.data?.notifications || []);
      } catch (error) {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAllNotifications();
  }, [token]);

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

  let content;
  if (loading) {
    content = (
      <div className="notification-spinner-wrapper">
        <div className="loader"></div>
      </div>
    );
  } else if (notifications.length === 0) {
    content = (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-bell-slash fs-1 mb-3"></i>
        <div>No notifications yet</div>
      </div>
    );
  } else {
    content = (
      <div className="list-group shadow-sm">
        {notifications.map((notification) => (
          <div
            key={notification._id}
            className={`list-group-item d-flex align-items-start ${
              !notification.seen ? 'unread' : ''
            }`}
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
            {!notification.seen && (
              <Badge bg="primary" className="ms-2">
                New
              </Badge>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="container py-4 notifications-page">
      <h2 className="mb-4">All Notifications</h2>
      {content}
    </div>
  );
};

export default NotificationsPage;
