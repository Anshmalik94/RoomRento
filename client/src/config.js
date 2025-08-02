// Smart API base URL detection for multiple deployment platforms
import axios from 'axios';

const getBaseURL = () => {
  // FORCE LOCALHOST FOR LOCAL DEVELOPMENT
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }

  // Development mode check FIRST - highest priority
  if (process.env.NODE_ENV === 'development') {
    const devUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
    return devUrl;
  }

  // EMERGENCY FIX: Force correct URL for production
  if (process.env.NODE_ENV === 'production') {
    return 'https://roomrento.onrender.com';
  }
  
  // Always use production URL if available
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Production mode - try multiple backend URLs
  const currentHost = window.location.hostname;
  // If frontend is on Vercel
  if (currentHost.includes('vercel.app')) {
    // Try custom backend URL from environment variable first
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    // Use BASE_URL from env or fallback
    const url = process.env.REACT_APP_BASE_URL || 'https://roomrento.onrender.com';
    return url;
  }
  
  // If frontend is on Render
  if (currentHost.includes('onrender.com')) {
    const url = process.env.REACT_APP_BASE_URL || 'https://roomrento.onrender.com';
    return url;
  }
  
  // Custom domain check - try multiple backends
  if (currentHost.includes('roomrento.com')) {
    // Try primary backend first, then fallbacks
    const url = process.env.REACT_APP_BASE_URL || 'https://roomrento.onrender.com';
    return url;
  }
  
  // Fallback to environment variable or try multiple backends
  const possibleBackends = [
    process.env.REACT_APP_API_URL,
    process.env.REACT_APP_BASE_URL,
    'https://roomrento.onrender.com'
  ].filter(Boolean);
  
  const fallbackUrl = possibleBackends[0];
  return fallbackUrl;
};

const BASE_URL = getBaseURL();

// Debug information
// API configuration with error handling
export const API_CONFIG = {
  baseURL: BASE_URL,
  timeout: 15000, // Increased to 15 seconds
  retries: 3,
  headers: {
    'Content-Type': 'application/json',
  }
};

// Create axios instance with better error handling

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor with retry logic
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', error.message);
    
    const originalRequest = error.config;
    
    // If it's a network error and we haven't tried alternatives
    if (!error.response && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try alternative backends - only use working URL
      const alternativeBackends = [
        'https://roomrento.onrender.com'
      ];
      
      for (const backend of alternativeBackends) {
        try {
          const retryResponse = await apiClient({
            ...originalRequest,
            baseURL: backend
          });
          return retryResponse;
        } catch (retryError) {
        }
      }
    }
    
    if (error.response) {
      console.error('📄 Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('🌐 Network Error:', error.request);
      console.error('💡 Possible causes: CORS, Server down, Network issues');
    }
    return Promise.reject(error);
  }
);

// Endpoints
export const ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    profile: '/api/auth/profile',
    googleLogin: '/api/auth/google-login'
  },
  rooms: {
    getAll: '/api/rooms',
    getById: (id) => `/api/rooms/${id}`,
    myListings: '/api/rooms/my-listings',
    create: '/api/rooms',
    update: (id) => `/api/rooms/${id}`,
    delete: (id) => `/api/rooms/${id}`
  },
  bookings: {
    create: '/api/bookings',
    myBookings: '/api/bookings/my-bookings',
    myRequests: '/api/bookings/my-requests'
  }
};

// Export both named and default exports
export const API_URL = BASE_URL;
export default BASE_URL;
