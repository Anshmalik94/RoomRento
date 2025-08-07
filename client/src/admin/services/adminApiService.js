import axios from 'axios';
import { API_URL } from '../../config';

const API_BASE_URL = `${API_URL}/api`;
console.log('Admin API Base URL:', API_BASE_URL);

// Create axios instance with auth
const adminAPI = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
adminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Admin API Request:', config.url, 'Token:', token ? 'Present' : 'Missing');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
adminAPI.interceptors.response.use(
  (response) => {
    console.log('Admin API Response:', response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    console.error('Admin API Error:', error.config?.url, 'Status:', error.response?.status);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const adminApiService = {
  // Dashboard
  getDashboardStats: () => adminAPI.get('/dashboard/stats'),
  getRecentBookings: () => adminAPI.get('/dashboard/recent-bookings'),
  getRecentUsers: () => adminAPI.get('/dashboard/recent-users'),
  getAllUsers: () => adminAPI.get('/users'),

  // User Management
  getUsers: (params = {}) => adminAPI.get('/users', { params }),
  updateUser: (id, userData) => adminAPI.put(`/users/${id}`, userData),
  updateUserStatus: (id, status) => adminAPI.put(`/users/${id}/status`, { status }),
  updateUserPassword: (id, password) => adminAPI.put(`/users/${id}/password`, { password }),
  deleteUser: (id) => adminAPI.delete(`/users/${id}`),

  // Booking Management
  getBookings: (params = {}) => adminAPI.get('/bookings', { params }),
  updateBooking: (id, bookingData) => adminAPI.put(`/bookings/${id}`, bookingData),
  updateBookingStatus: (id, status) => adminAPI.put(`/bookings/${id}/status`, { status }),
  deleteBooking: (id) => adminAPI.delete(`/bookings/${id}`),

  // Property Management
  getProperties: (params = {}) => adminAPI.get('/properties', { params }),
  updateProperty: (id, propertyData) => adminAPI.put(`/properties/${id}`, propertyData),
  updatePropertyStatus: (id, status) => adminAPI.put(`/properties/${id}/status`, { status }),
  deleteProperty: (id) => adminAPI.delete(`/properties/${id}`),

  // Analytics
  getAnalytics: () => adminAPI.get('/analytics'),

  // Support Requests
  getSupportRequests: () => adminAPI.get('/support-requests'),
};
