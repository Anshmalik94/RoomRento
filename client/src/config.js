// Smart API base URL detection for multiple deployment platforms
import axios from 'axios';

const getBaseURL = () => {
  // Development mode check first
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
  }
  
  // Always use production URL if available
  if (process.env.REACT_APP_API_URL) {
    console.log('Using REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Production mode - try multiple backend URLs
  const currentHost = window.location.hostname;
  console.log('Current hostname:', currentHost);
  
  // If frontend is on Vercel
  if (currentHost.includes('vercel.app')) {
    // Try custom backend URL from environment variable first
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    // Use BASE_URL from env or fallback
    const url = process.env.REACT_APP_BASE_URL || 'https://roomrento.onrender.com';
    console.log('Using Vercel URL:', url);
    return url;
  }
  
  // If frontend is on Render
  if (currentHost.includes('onrender.com')) {
    const url = process.env.REACT_APP_BASE_URL || 'https://roomrento.onrender.com';
    console.log('Using Render URL:', url);
    return url;
  }
  
  // Custom domain check - try multiple backends
  if (currentHost.includes('roomrento.com')) {
    // Try primary backend first, then fallbacks
    const url = process.env.REACT_APP_BASE_URL || 'https://roomrento.onrender.com';
    console.log('Using custom domain URL:', url);
    return url;
  }
  
  // Fallback to environment variable or try multiple backends
  const possibleBackends = [
    process.env.REACT_APP_API_URL,
    process.env.REACT_APP_BASE_URL,
    'https://roomrento.onrender.com',
    'https://roomrento-backend.onrender.com',
    'https://roomrento-api.onrender.com'
  ].filter(Boolean);
  
  const fallbackUrl = possibleBackends[0];
  console.log('Using fallback URL:', fallbackUrl);
  console.log('Available backends:', possibleBackends);
  return fallbackUrl;
};

const BASE_URL = getBaseURL();

// Debug information
console.log('🚀 RoomRento API Configuration:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('- REACT_APP_BASE_URL:', process.env.REACT_APP_BASE_URL);
console.log('- Final BASE_URL:', BASE_URL);
console.log('- Current hostname:', window.location.hostname);

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
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    console.log('🔗 Full URL:', config.baseURL + config.url);
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
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', error.message);
    
    const originalRequest = error.config;
    
    // If it's a network error and we haven't tried alternatives
    if (!error.response && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try alternative backends
      const alternativeBackends = [
        'https://roomrento.onrender.com',
        'https://roomrento-backend.onrender.com',
        'https://roomrento-api.onrender.com'
      ];
      
      for (const backend of alternativeBackends) {
        try {
          console.log('🔄 Trying alternative backend:', backend);
          const retryResponse = await apiClient({
            ...originalRequest,
            baseURL: backend
          });
          return retryResponse;
        } catch (retryError) {
          console.log('❌ Alternative backend failed:', backend);
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
