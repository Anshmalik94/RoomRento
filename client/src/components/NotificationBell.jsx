import React, { useState, useEffect, useRef } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import LoadingSpinner from './LoadingSpinner';
import './NotificationBell.css';

const NotificationBell = ({ bellIcon }) => {
  console.log('🚀 NotificationBell component rendered!');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const isMountedRef = useRef(true);
  const pollingIntervalRef = useRef(null);
  const fetchTimeoutRef = useRef(null);

  const token = localStorage.getItem('token');
  console.log('🔑 Token check in NotificationBell:', token ? 'EXISTS' : 'NOT FOUND');
  
  useEffect(() => {
    console.log('🔄 NotificationBell mounted, token exists:', !!token);
    isMountedRef.current = true;
    const currentToken = localStorage.getItem('token');
    console.log('🔄 Current token in useEffect:', currentToken ? 'Found' : 'Not found');
    
    // Define fetchNotifications inside useEffect to avoid dependency issues
    const fetchNotifications = async () => {
      if (!currentToken || !isMountedRef.current) {
        console.log('❌ No token or component unmounted, skipping fetch');
        return;
      }
      
      try {
        console.log('📡 Fetching notifications...');
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/notifications?limit=10`, {
          headers: { Authorization: `Bearer ${currentToken}` }
        });
        console.log('✅ Notifications response:', response.data);
        const notificationsData = response.data?.data?.notifications || [];
        
        if (isMountedRef.current) {
          console.log('📝 Setting notifications:', notificationsData.length, 'items');
          setNotifications(notificationsData);
          const unreadFromNotifications = notificationsData.filter(n => !n.isRead).length;
          console.log('🔴 Unread count:', unreadFromNotifications);
          setUnreadCount(unreadFromNotifications);
        }
      } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        if (isMountedRef.current) {
          setNotifications([]);
          setUnreadCount(0);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };
    
    if (currentToken) {
      // Fetch notifications immediately with delay
      fetchTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          fetchNotifications();
        }
      }, 500);
      
      // Set up polling for notifications every 30 seconds
      pollingIntervalRef.current = setInterval(() => {
        if (isMountedRef.current) {
          fetchNotifications();
        }
      }, 30000);
    }
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    };
  }, []); // Empty dependency array since we handle token inside

  // Mark notification as read using the correct API endpoint
  const markAsRead = async (notificationId) => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;
    
    try {
      console.log('🔄 Marking notification as read:', notificationId);
      // Immediately update UI for better UX
      setNotifications(prev => prev.map(notif => 
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Call the correct API endpoint
      const response = await axios.patch(`${API_URL}/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      console.log('✅ Mark as read response:', response.data);
      
      // Refetch to ensure backend sync after a delay
      setTimeout(async () => {
        if (isMountedRef.current) {
          try {
            const response = await axios.get(`${API_URL}/api/notifications?limit=10`, {
              headers: { Authorization: `Bearer ${currentToken}` }
            });
            const notificationsData = response.data?.data?.notifications || [];
            if (isMountedRef.current) {
              setNotifications(notificationsData);
              const unreadFromNotifications = notificationsData.filter(n => !n.isRead).length;
              setUnreadCount(unreadFromNotifications);
            }
          } catch (error) {
            console.error('Error refetching notifications:', error);
          }
        }
      }, 200);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert UI change on error and refetch correct state
      setTimeout(async () => {
        if (isMountedRef.current) {
          try {
            const response = await axios.get(`${API_URL}/api/notifications?limit=10`, {
              headers: { Authorization: `Bearer ${currentToken}` }
            });
            const notificationsData = response.data?.data?.notifications || [];
            if (isMountedRef.current) {
              setNotifications(notificationsData);
              const unreadFromNotifications = notificationsData.filter(n => !n.isRead).length;
              setUnreadCount(unreadFromNotifications);
            }
          } catch (error) {
            console.error('Error refetching notifications:', error);
          }
        }
      }, 200);
    }
  };

  const handleDropdownToggle = (isOpen) => {
    console.log('🔔 Notification bell clicked, dropdown is now:', isOpen);
    setShowDropdown(isOpen);
    if (isOpen && (!notifications || notifications.length === 0)) {
      const currentToken = localStorage.getItem('token');
      setTimeout(async () => {
        if (isMountedRef.current && currentToken) {
          try {
            const response = await axios.get(`${API_URL}/api/notifications?limit=10`, {
              headers: { Authorization: `Bearer ${currentToken}` }
            });
            const notificationsData = response.data?.data?.notifications || [];
            if (isMountedRef.current) {
              setNotifications(notificationsData);
              const unreadFromNotifications = notificationsData.filter(n => !n.isRead).length;
              setUnreadCount(unreadFromNotifications);
            }
          } catch (error) {
            console.error('Error fetching notifications on dropdown:', error);
          }
        }
      }, 200);
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
        {bellIcon ? bellIcon : <i className="bi bi-bell fs-5 text-white"></i>}
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
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
              <LoadingSpinner 
                isLoading={true} 
                message="Loading..." 
                inline={true} 
                size="small"
              />
            </div>
          ) : (!notifications || notifications.length === 0) ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-bell-slash fs-4 d-block mb-2"></i>
              <div className="small">No notifications yet</div>
            </div>
          ) : (
            (notifications || []).map((notification) => (
              <Dropdown.Item
                key={notification._id}
                className={`notification-item border-bottom ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => {
                  console.log('🎯 Notification clicked:', notification._id, notification.message);
                  console.log('🔍 Notification details:', notification);
                  console.log('🌍 Navigation will go to:', 
                    notification.relatedRoomId 
                      ? `/room/${notification.relatedRoomId}` 
                      : notification.relatedBookingId 
                      ? '/my-booking-requests' 
                      : notification.type === 'booking_request'
                      ? '/my-booking-requests'
                      : '#'
                  );
                  if (!notification.isRead) {
                    console.log('📝 Marking as read:', notification._id);
                    markAsRead(notification._id);
                  }
                  setShowDropdown(false);
                }}
                as={Link}
                to={
                  notification.relatedRoomId 
                    ? `/room/${notification.relatedRoomId}` 
                    : notification.relatedBookingId 
                    ? '/my-booking-requests' 
                    : notification.type === 'booking_request'
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
                  {!notification.isRead && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              </Dropdown.Item>
            ))
          )}
        </div>

        {(notifications && notifications.length > 0) && (
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
