import React, { createContext, useContext, useReducer, useEffect } from 'react';
import socketService from '../services/socketService';
import { API_URL } from '../config';

// Notification Context
const NotificationContext = createContext();

// Action types
const NOTIFICATION_ACTIONS = {
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  UPDATE_COUNT: 'UPDATE_COUNT',
  MARK_AS_READ: 'MARK_AS_READ',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_ALL: 'CLEAR_ALL',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CONNECTED: 'SET_CONNECTED'
};

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  connected: false,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasMore: false
  }
};

// Reducer function
function notificationReducer(state, action) {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload.notifications,
        unreadCount: action.payload.unreadCount,
        pagination: action.payload.pagination,
        loading: false,
        error: null
      };

    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };

    case NOTIFICATION_ACTIONS.UPDATE_COUNT:
      return {
        ...state,
        unreadCount: action.payload
      };

    case NOTIFICATION_ACTIONS.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          action.payload.includes(notification._id)
            ? { ...notification, isRead: true }
            : notification
        )
      };

    case NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification._id !== action.payload
        )
      };

    case NOTIFICATION_ACTIONS.CLEAR_ALL:
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };

    case NOTIFICATION_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case NOTIFICATION_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case NOTIFICATION_ACTIONS.SET_CONNECTED:
      return {
        ...state,
        connected: action.payload
      };

    default:
      return state;
  }
}

// Notification Provider Component
export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Setup socket listeners
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Connect to socket
      socketService.connect(token);

      // Setup event listeners
      const unsubscribeConnected = socketService.on('connected', (connected) => {
        dispatch({ type: NOTIFICATION_ACTIONS.SET_CONNECTED, payload: connected });
      });

      const unsubscribeNewNotification = socketService.on('newNotification', (notification) => {
        dispatch({ type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION, payload: notification });
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo56.png',
            badge: '/logo56.png'
          });
        }
      });

      const unsubscribeCountUpdate = socketService.on('notificationCountUpdated', (count) => {
        dispatch({ type: NOTIFICATION_ACTIONS.UPDATE_COUNT, payload: count });
      });

      const unsubscribeNotificationsReceived = socketService.on('notificationsReceived', (data) => {
        dispatch({ type: NOTIFICATION_ACTIONS.SET_NOTIFICATIONS, payload: data });
      });

      const unsubscribeError = socketService.on('notificationsError', (error) => {
        dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: error.message });
      });

      // Cleanup function
      return () => {
        unsubscribeConnected();
        unsubscribeNewNotification();
        unsubscribeCountUpdate();
        unsubscribeNotificationsReceived();
        unsubscribeError();
      };
    }
  }, []);

  // Request browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // API calls
  const fetchNotifications = async (page = 1, limit = 20) => {
    try {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true });
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/notifications?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: NOTIFICATION_ACTIONS.SET_NOTIFICATIONS, payload: data.data });
      } else {
        throw new Error(data.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const markAsRead = async (notificationIds = []) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/notifications/mark-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationIds })
      });

      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: NOTIFICATION_ACTIONS.MARK_AS_READ, payload: notificationIds });
        // Also emit to socket for real-time update
        socketService.markNotificationAsRead(notificationIds);
      } else {
        throw new Error(data.message || 'Failed to mark as read');
      }
    } catch (error) {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        const allNotificationIds = state.notifications.map(n => n._id);
        dispatch({ type: NOTIFICATION_ACTIONS.MARK_AS_READ, payload: allNotificationIds });
        socketService.markNotificationAsRead([]);
      } else {
        throw new Error(data.message || 'Failed to mark all as read');
      }
    } catch (error) {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION, payload: notificationId });
      } else {
        throw new Error(data.message || 'Failed to delete notification');
      }
    } catch (error) {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const clearAllNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/notifications/clear-all`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_ALL });
      } else {
        throw new Error(data.message || 'Failed to clear notifications');
      }
    } catch (error) {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const value = {
    ...state,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to use notification context
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
