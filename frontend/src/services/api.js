import axios from 'axios';
import { useAuthStore } from '../store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH APIs ============
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  verifyEmail: (token) => apiClient.post('/auth/verify-email', { token }),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => apiClient.post('/auth/reset-password', { 
    token, 
    newPassword, 
    confirmPassword: newPassword 
  }),
  getCurrentUser: () => apiClient.get('/auth/me'),
};

// ============ USER APIs ============
export const userAPI = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data) => apiClient.put('/user/profile', data),
  updateSettings: (settings) => apiClient.put('/user/settings', settings),
  connectWallet: (walletAddress) => apiClient.post('/user/connect-wallet', { walletAddress }),
  disconnectWallet: () => apiClient.post('/user/disconnect-wallet'),
  getStats: () => apiClient.get('/user/stats'),
  getLoginHistory: (page = 1, limit = 10) => apiClient.get('/user/login-history', { params: { page, limit } }),
  getTransactions: (page = 1, limit = 10, type, status) => apiClient.get('/user/transactions', { params: { page, limit, type, status } }),
  changePassword: (data) => apiClient.post('/user/change-password', data),
  exportData: () => apiClient.get('/user/export-data'),
  deleteAccount: (data) => apiClient.post('/user/delete-account', data),
};

// ============ STAKING APIs ============
export const stakingAPI = {
  getStakingInfo: (walletAddress) => apiClient.get(`/staking/info/${walletAddress}`),
  recordStake: (data) => apiClient.post('/staking/record-stake', data),
  recordUnstake: (data) => apiClient.post('/staking/record-unstake', data),
  recordClaim: (data) => apiClient.post('/staking/record-claim', data),
  getHistory: () => apiClient.get('/staking/history'),
  getStats: () => apiClient.get('/staking/stats'),
  syncWithBlockchain: () => apiClient.post('/staking/sync'),
};

// ============ TRANSACTION APIs ============
export const transactionAPI = {
  getAllTransactions: (page = 1, limit = 20, type, status) => 
    apiClient.get('/transactions', { params: { page, limit, type, status } }),
  getTransactionByHash: (txHash) => apiClient.get(`/transactions/${txHash}`),
  recordTransaction: (data) => apiClient.post('/transactions/record', data),
  updateTransactionStatus: (txHash, data) => apiClient.put(`/transactions/${txHash}/status`, data),
  getStats: () => apiClient.get('/transactions/stats/overview'),
  getByType: (type, page = 1, limit = 20) => apiClient.get(`/transactions/filter/by-type/${type}`, { params: { page, limit } }),
  getByStatus: (status, page = 1, limit = 20) => apiClient.get(`/transactions/filter/by-status/${status}`, { params: { page, limit } }),
  retryTransaction: (txHash) => apiClient.post(`/transactions/${txHash}/retry`),
  exportCSV: () => apiClient.get('/transactions/export/csv'),
};

// ============ ADMIN APIs ============
export const adminAPI = {
  // User Management
  getAllUsers: (page = 1, limit = 20, role, isActive, isBanned, search) => 
    apiClient.get('/admin/users', { params: { page, limit, role, isActive, isBanned, search } }),
  
  getUserDetails: (userId) => apiClient.get(`/admin/users/${userId}`),
  
  banUser: (userId, data) => apiClient.put(`/admin/users/${userId}/ban`, data),
  
  changeUserRole: (userId, data) => apiClient.put(`/admin/users/${userId}/role`, data),
  
  resetUserPassword: (userId, newPassword) => apiClient.post(`/admin/users/${userId}/reset-password`, { newPassword }),
  
  verifyUserEmail: (userId, isVerified) => apiClient.put(`/admin/users/${userId}/verify-email`, { isVerified }),
  
  // Transaction Management
  getAllTransactions: (page = 1, limit = 20, type, status, userId) => 
    apiClient.get('/admin/transactions', { params: { page, limit, type, status, userId } }),
  
  // Statistics
  getSystemStats: () => apiClient.get('/admin/stats/system'),
  
  getUserStats: () => apiClient.get('/admin/stats/users'),
  
  getTransactionStats: () => apiClient.get('/admin/stats/transactions'),
  
  // Reports
  exportSystemReport: () => apiClient.get('/admin/export/report'),
};

// ============ 2FA APIs ============
export const twoFAAPI = {
  setup: () => apiClient.post('/2fa/setup'),
  verifySetup: (token, backupCodes) => apiClient.post('/2fa/verify-setup', { token, backupCodes }),
  verifyToken: (token) => apiClient.post('/2fa/verify-token', { token }),
  disable: (password) => apiClient.post('/2fa/disable', { password }),
  getBackupCodes: () => apiClient.get('/2fa/backup-codes'),
};

export default apiClient;