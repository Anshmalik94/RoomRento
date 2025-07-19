import { io } from 'socket.io-client';
import { API_URL } from '../config';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.token = null;
    this.listeners = new Map();
  }

  // Initialize socket connection
  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    this.token = token;
    
    // Get server URL from API_URL (remove /api if present)
    const serverUrl = API_URL.replace('/api', '');
    
    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    this.setupEventListeners();
  }

  // Setup socket event listeners
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('📡 Connected to notification server');
      this.connected = true;
      this.emitToListeners('connected', true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('📡 Disconnected from notification server:', reason);
      this.connected = false;
      this.emitToListeners('connected', false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('📡 Socket connection error:', error);
      this.emitToListeners('error', error);
    });

    // Notification events
    this.socket.on('newNotification', (notification) => {
      console.log('🔔 New notification received:', notification);
      this.emitToListeners('newNotification', notification);
    });

    this.socket.on('notificationCountUpdated', (count) => {
      console.log('🔢 Notification count updated:', count);
      this.emitToListeners('notificationCountUpdated', count);
    });

    this.socket.on('notificationsReceived', (data) => {
      this.emitToListeners('notificationsReceived', data);
    });

    this.socket.on('notificationsError', (error) => {
      console.error('🔔 Notifications error:', error);
      this.emitToListeners('notificationsError', error);
    });
  }

  // Emit events to registered listeners
  emitToListeners(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Subscribe to socket events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  // Unsubscribe from socket events
  off(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  // Socket actions
  markNotificationAsRead(notificationIds) {
    if (this.socket?.connected) {
      this.socket.emit('markNotificationAsRead', notificationIds);
    }
  }

  getNotifications(page = 1, limit = 20) {
    if (this.socket?.connected) {
      this.socket.emit('getNotifications', { page, limit });
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
    }
  }

  // Check if connected
  isConnected() {
    return this.connected && this.socket?.connected;
  }

  // Reconnect with new token
  reconnect(token) {
    this.disconnect();
    this.connect(token);
  }
}

// Export singleton instance
const socketServiceInstance = new SocketService();
export default socketServiceInstance;
