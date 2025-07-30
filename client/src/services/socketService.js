import { io } from 'socket.io-client';
import { API_URL } from '../config';

class SocketService {
  constructor() {
    this.socket = null;
    this.eventListeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    try {
      // Extract base URL from API_URL (remove /api if present)
      const baseUrl = API_URL.replace('/api', '');
      
      this.socket = io(baseUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        maxReconnectionAttempts: 5
      });

      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        this.emit('connected', true);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.emit('connected', false);
      });

      this.socket.on('connect_error', (error) => {
        console.warn('Socket connection failed:', error.message);
        
        // Handle authentication errors more gracefully
        if (error.message.includes('Authentication error')) {
          console.log('Authentication failed - clearing token and redirecting to login');
          
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('userName');
          localStorage.removeItem('email');
          
          // Emit logout event to trigger app-wide logout
          this.emit('authError', error.message);
          
          this.disconnect();
          return;
        }
        
        this.emit('connected', false);
      });

      // Listen for notification events
      this.socket.on('newNotification', (notification) => {
        this.emit('newNotification', notification);
      });

      this.socket.on('notificationCountUpdated', (count) => {
        this.emit('notificationCountUpdated', count);
      });

      this.socket.on('notificationsReceived', (data) => {
        this.emit('notificationsReceived', data);
      });

      this.socket.on('notificationsError', (error) => {
        this.emit('notificationsError', error);
      });

    } catch (error) {
      console.error('Socket connection failed:', error);
      this.emit('connected', false);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.emit('connected', false);
    }
  }

  // Custom event emitter
  emit(event, data) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in socket event listener:', error);
      }
    });
  }

  // Subscribe to events
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(event) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  // Mark notification as read
  markNotificationAsRead(notificationIds) {
    if (this.socket?.connected) {
      this.socket.emit('markNotificationAsRead', notificationIds);
    }
  }

  // Check if socket is connected
  isConnected() {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
