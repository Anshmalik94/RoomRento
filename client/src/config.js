// Smart API base URL detection for multiple deployment platforms
import axios from 'axios';

const getBaseURL = () => {
  console.log('🔍 Config Debug Info:');
  console.log('  - hostname:', window.location.hostname);
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
  console.log('  - REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
  console.log('  - REACT_APP_BASE_URL:', process.env.REACT_APP_BASE_URL);

  // FORCE LOCALHOST FOR LOCAL DEVELOPMENT
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('✅ Using localhost backend');
    return 'http://localhost:5000';
  }

  // FOR CUSTOM DOMAIN roomrento.com - Always use production backend
  if (window.location.hostname === 'roomrento.com' || window.location.hostname === 'www.roomrento.com') {
    const productionURL = 'https://roomrento.onrender.com';
    console.log('🌍 CUSTOM DOMAIN DETECTED:', window.location.hostname);
    console.log('🚀 FORCING PRODUCTION BACKEND:', productionURL);
    console.log('📍 Full URL will be:', productionURL + '/api/auth/login');
    return productionURL;
  }

  // FOR OTHER DEPLOYMENTS - Use environment variables first, then fallback
  const envApiUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_BASE_URL;
  if (envApiUrl) {
    console.log('🌍 Using environment API URL:', envApiUrl);
    return envApiUrl;
  }

  // Fallback to production URL
  const productionURL = 'https://roomrento.onrender.com';
  console.log('🚀 Using fallback production backend:', productionURL);
  return productionURL;
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
    console.log('🚀 API REQUEST:', {
      url: config.url,
      baseURL: config.baseURL,
      fullURL: (config.baseURL || '') + config.url,
      method: config.method.toUpperCase(),
      headers: config.headers
    });
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
