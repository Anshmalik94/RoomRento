// Smart API base URL detection for multiple deployment platforms
const getBaseURL = () => {
  // Development mode
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }
  
  // Production mode - try multiple backend URLs
  const currentHost = window.location.hostname;
  
  // If frontend is on Vercel
  if (currentHost.includes('vercel.app')) {
    // Try custom backend URL from environment variable first
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    // Default Render backend
    return 'https://roomrento-api.onrender.com';
  }
  
  // If frontend is on Render
  if (currentHost.includes('onrender.com')) {
    return 'https://roomrento-api.onrender.com';
  }
  
  // Fallback to environment variable or default
  return process.env.REACT_APP_API_URL || 'https://roomrento-api.onrender.com';
};

const BASE_URL = getBaseURL();

// API configuration
export const API_CONFIG = {
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  retries: 3,
  headers: {
    'Content-Type': 'application/json',
  }
};

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
