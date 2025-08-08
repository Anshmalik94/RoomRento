// Enhanced API Client with Robust Error Handling
import axios from 'axios';

// Smart API base URL detection
const getBaseURL = () => {
  console.log('🔍 API Config Debug:');
  console.log('  - hostname:', window.location.hostname);
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
  console.log('  - REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

  const hostname = window.location.hostname;

  // FORCE PRODUCTION FOR ALL PRODUCTION ENVIRONMENTS
  if (hostname === 'roomrento.com' || 
      hostname === 'www.roomrento.com' || 
      hostname.includes('vercel.app') || 
      hostname.includes('netlify.app') ||
      hostname.includes('onrender.com') ||
      process.env.NODE_ENV === 'production') {
    
    const productionURL = 'https://roomrento.onrender.com';
    console.log('🌍 PRODUCTION MODE:', productionURL);
    return productionURL;
  }

  // LOCAL DEVELOPMENT
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const devURL = 'http://localhost:5000';
    console.log('🔧 DEVELOPMENT MODE:', devURL);
    return devURL;
  }

  // ABSOLUTE FALLBACK
  const fallbackURL = 'https://roomrento.onrender.com';
  console.log('⚠️ FALLBACK MODE:', fallbackURL);
  return fallbackURL;
};

const BASE_URL = getBaseURL();

// Create robust axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds for Render.com cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor with enhanced logging
apiClient.interceptors.request.use(
  (config) => {
    const fullURL = `${config.baseURL}${config.url}`;
    console.log('🚀 API REQUEST:', {
      method: config.method.toUpperCase(),
      url: fullURL,
      data: config.data ? 'Data provided' : 'No data',
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Setup Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API SUCCESS:', {
      status: response.status,
      url: response.config.url,
      data: response.data ? 'Response received' : 'No response data'
    });
    return response;
  },
  async (error) => {
    console.error('❌ API ERROR:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });

    const originalRequest = error.config;

    // Handle network errors with retry for cold starts
    if (!error.response && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('🔄 Retrying request due to network error (possible cold start)...');
      
      // Wait 3 seconds and retry for Render.com cold start
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      try {
        return await apiClient(originalRequest);
      } catch (retryError) {
        console.error('❌ Retry failed:', retryError.message);
      }
    }

    return Promise.reject(error);
  }
);

// Enhanced Login API Function
export const loginUser = async (credentials) => {
  try {
    console.log('🔐 Starting login process for:', credentials);
    
    const response = await apiClient.post('/api/auth/login', credentials);

    console.log('✅ Login successful:', response.data);
    
    // Return the actual server response data directly
    return response.data;

  } catch (error) {
    console.error('🔐 Login failed:', error);

    // Handle different error types
    if (!error.response) {
      // Network error
      const networkError = new Error('Unable to connect to server. Please check your internet connection and try again.');
      networkError.type = 'NETWORK_ERROR';
      networkError.details = error.message;
      throw networkError;
    }

    const status = error.response.status;
    const errorData = error.response.data;

    if (status === 400 || status === 401) {
      const authError = new Error(errorData.message || errorData.msg || 'Invalid email or password');
      authError.type = 'AUTH_ERROR';
      authError.details = errorData;
      throw authError;
    }

    if (status >= 500) {
      const serverError = new Error('Server error. Please try again later.');
      serverError.type = 'SERVER_ERROR';
      serverError.details = errorData;
      throw serverError;
    }

    const unknownError = new Error('Something went wrong. Please try again.');
    unknownError.type = 'UNKNOWN_ERROR';
    unknownError.details = error.message;
    throw unknownError;
  }
};

// Export API client and base URL
export { apiClient, BASE_URL };
export default apiClient;
