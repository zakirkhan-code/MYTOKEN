// services/api.js - Enhanced Axios API Configuration
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ============================================================================
// AXIOS INSTANCE CONFIGURATION
// ============================================================================
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ============================================================================
// REQUEST INTERCEPTOR - Add JWT token to every request
// ============================================================================
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 [${config.method.toUpperCase()}] ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR - Handle responses globally
// ============================================================================
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Response [${response.status}]`, response.data);
    }
    return response;
  },
  (error) => {
    const { response } = error;

    if (response) {
      // Handle different HTTP status codes
      switch (response.status) {
        case 401:
          // Unauthorized - Token expired or invalid
          console.log('🔐 Unauthorized - Logging out...');
          Cookies.remove('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        
        case 403:
          // Forbidden - Access denied
          console.error('⛔ Access Forbidden');
          break;
        
        case 404:
          // Not Found
          console.error('🔍 Resource Not Found');
          break;
        
        case 500:
          // Server Error
          console.error('🔥 Server Error');
          break;
        
        default:
          console.error(`API Error [${response.status}]:`, response.data?.message);
      }
    } else if (error.request) {
      console.error('❌ No response received:', error.message);
    } else {
      console.error('❌ Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ============================================================================
// API CALL HELPER FUNCTIONS
// ============================================================================

export const apiGet = (url, config = {}) => api.get(url, config);
export const apiPost = (url, data = {}, config = {}) => api.post(url, data, config);
export const apiPut = (url, data = {}, config = {}) => api.put(url, data, config);
export const apiPatch = (url, data = {}, config = {}) => api.patch(url, data, config);
export const apiDelete = (url, config = {}) => api.delete(url, config);

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

export const isAuthenticated = () => !!Cookies.get('authToken');
export const getToken = () => Cookies.get('authToken');
export const saveToken = (token, expiresIn = 7) => Cookies.set('authToken', token, { expires: expiresIn });
export const removeToken = () => Cookies.remove('authToken');

export default api;