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
export const loginUser = async (email, password) => {
  try {
    console.log('🔐 Starting login process for:', email);
    
    const response = await apiClient.post('/api/auth/login', {
      email,
      password
    });

    console.log('✅ Login successful');
    return {
      success: true,
      data: response.data,
      token: response.data.token,
      user: response.data.user
    };

  } catch (error) {
    console.error('🔐 Login failed:', error);

    // Handle different error types
    if (!error.response) {
      // Network error
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Unable to connect to server. Please check your internet connection and try again.',
        details: error.message
      };
    }

    const status = error.response.status;
    const errorData = error.response.data;

    if (status === 400 || status === 401) {
      return {
        success: false,
        error: 'AUTH_ERROR',
        message: errorData.message || 'Invalid email or password',
        details: errorData
      };
    }

    if (status >= 500) {
      return {
        success: false,
        error: 'SERVER_ERROR',
        message: 'Server error. Please try again later.',
        details: errorData
      };
    }

    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      message: 'Something went wrong. Please try again.',
      details: error.message
    };
  }
};

// Export API client and base URL
export { apiClient, BASE_URL };
export default apiClient;
