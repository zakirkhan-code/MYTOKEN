// src/services/api.js - Complete API Configuration with JWT

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// ============================================
// CREATE AXIOS INSTANCE
// ============================================

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ============================================
// REQUEST INTERCEPTOR - ADD JWT TOKEN
// ============================================

axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // ✅ Add token to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ JWT Token added to request:', config.url);
    } else {
      console.warn('⚠️ No JWT token found in localStorage');
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR - HANDLE ERRORS
// ============================================

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.message);

    // Handle 401 - Token expired
    if (error.response?.status === 401) {
      console.error('🔴 Token expired (401)');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Handle 403 - Forbidden (no permission)
    if (error.response?.status === 403) {
      console.error('🔴 Access forbidden (403)');
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTHENTICATION API
// ============================================

export const authAPI = {
  register: (data) =>
    axiosInstance.post('/auth/register', data),

  login: (data) =>
    axiosInstance.post('/auth/login', data),

  verifyEmail: (token) =>
    axiosInstance.post('/auth/verify-email', { token }),

  logout: () =>
    axiosInstance.post('/auth/logout'),

  forgotPassword: (email) =>
    axiosInstance.post('/auth/forgot-password', { email }),

  resetPassword: (token, password, confirmPassword) =>
    axiosInstance.post('/auth/reset-password', {
      token,
      newPassword: password,
      confirmPassword
    }),

  getCurrentUser: () =>
    axiosInstance.get('/auth/me'),

  checkVerification: (email) =>
    axiosInstance.get(`/auth/check-verification/${email}`)
};

// ============================================
// USER API
// ============================================

export const userAPI = {
  getProfile: () =>
    axiosInstance.get('/user/profile'),

  updateProfile: (data) =>
    axiosInstance.put('/user/profile', data),

  updateSettings: (data) =>
    axiosInstance.put('/user/settings', data),

  connectWallet: (walletAddress) =>
    axiosInstance.post('/user/connect-wallet', { walletAddress }),

  disconnectWallet: () =>
    axiosInstance.post('/user/disconnect-wallet'),

  getStats: () =>
    axiosInstance.get('/user/stats'),

  getLoginHistory: () =>
    axiosInstance.get('/user/login-history'),

  getTransactions: (params) =>
    axiosInstance.get('/user/transactions', { params }),

  changePassword: (oldPassword, newPassword) =>
    axiosInstance.post('/user/change-password', {
      oldPassword,
      newPassword
    }),

  deleteAccount: (password) =>
    axiosInstance.post('/user/delete-account', { password })
};

// ============================================
// ADMIN API
// ============================================

export const adminAPI = {
  // ✅ SYSTEM STATS - FIX FOR 403 ERROR
  getSystemStats: () => {
    console.log('📊 Fetching system stats...');
    return axiosInstance.get('/admin/stats/system');
  },

  // Users Management
  getUsers: (params = {}) => {
    console.log('👥 Fetching users...');
    return axiosInstance.get('/admin/users', { params });
  },

  getUserById: (userId) =>
    axiosInstance.get(`/admin/users/${userId}`),

  banUser: (userId, reason) =>
    axiosInstance.put(`/admin/users/${userId}/ban`, { reason }),

  unbanUser: (userId) =>
    axiosInstance.put(`/admin/users/${userId}/unban`),

  updateUserRole: (userId, role) =>
    axiosInstance.put(`/admin/users/${userId}/role`, { role }),

  // Transactions Management
  getTransactions: (params = {}) => {
    console.log('💳 Fetching transactions...');
    return axiosInstance.get('/admin/transactions', { params });
  },

  getTransactionById: (txHash) =>
    axiosInstance.get(`/admin/transactions/${txHash}`),

  updateTransactionStatus: (txHash, status) =>
    axiosInstance.put(`/admin/transactions/${txHash}/status`, { status }),

  // Statistics
  getUserStats: () => {
    console.log('📊 Fetching user stats...');
    return axiosInstance.get('/admin/stats/users');
  },

  getTransactionStats: () => {
    console.log('📊 Fetching transaction stats...');
    return axiosInstance.get('/admin/stats/transactions');
  },

  // ✅ THIS IS IMPORTANT - Add proper error handling
  getAdminDashboardStats: async () => {
    try {
      console.log('🔄 Fetching admin dashboard stats...');
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No JWT token found');
      }

      const response = await axiosInstance.get('/admin/stats/system', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Admin dashboard stats fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ Error fetching admin dashboard stats:', error);
      if (error.response?.status === 403) {
        console.error('🔴 Permission denied - Check JWT token and user role');
      }
      throw error;
    }
  }
};

// ============================================
// STAKING API
// ============================================

export const stakingAPI = {
  getStakingInfo: (walletAddress) =>
    axiosInstance.get(`/staking/info/${walletAddress}`),

  recordStake: (data) =>
    axiosInstance.post('/staking/record-stake', data),

  recordUnstake: (data) =>
    axiosInstance.post('/staking/record-unstake', data),

  recordClaim: (data) =>
    axiosInstance.post('/staking/record-claim', data),

  getHistory: (params) =>
    axiosInstance.get('/staking/history', { params }),

  getStats: () =>
    axiosInstance.get('/staking/stats'),

  sync: () =>
    axiosInstance.post('/staking/sync')
};

// ============================================
// TRANSACTION API
// ============================================

export const transactionAPI = {
  getTransactions: (params) =>
    axiosInstance.get('/transactions', { params }),

  getTransactionById: (txHash) =>
    axiosInstance.get(`/transactions/${txHash}`),

  recordTransaction: (data) =>
    axiosInstance.post('/transactions/record', data),

  updateStatus: (txHash, status) =>
    axiosInstance.put(`/transactions/${txHash}/status`, { status }),

  getStats: () =>
    axiosInstance.get('/transactions/stats/overview'),

  filterByType: (type, params) =>
    axiosInstance.get(`/transactions/filter/by-type/${type}`, { params }),

  filterByStatus: (status, params) =>
    axiosInstance.get(`/transactions/filter/by-status/${status}`, { params }),

  retry: (txHash) =>
    axiosInstance.post(`/transactions/${txHash}/retry`),

  exportCSV: () =>
    axiosInstance.get('/transactions/export/csv')
};

// ============================================
// 2FA API
// ============================================

export const twoFAAPI = {
  setup: () =>
    axiosInstance.post('/2fa/setup'),

  verifySetup: (token) =>
    axiosInstance.post('/2fa/verify-setup', { token }),

  verifyToken: (token) =>
    axiosInstance.post('/2fa/verify-token', { token }),

  disable: (token) =>
    axiosInstance.post('/2fa/disable', { token }),

  getBackupCodes: () =>
    axiosInstance.get('/2fa/backup-codes'),

  regenerateBackupCodes: (token) =>
    axiosInstance.post('/2fa/regenerate-backup-codes', { token })
};

// ============================================
// EXPORT DEFAULT INSTANCE
// ============================================

export default axiosInstance;