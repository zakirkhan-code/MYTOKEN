// services/userService.js - Complete User Service
import api from './api';

const userService = {
  // =========================================================================
  // PROFILE MANAGEMENT
  // =========================================================================
  
  /**
   * Get user profile
   */
  getProfile: async () => {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get profile' };
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/user/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  /**
   * Upload profile picture
   */
  uploadProfilePicture: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/user/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to upload picture' };
    }
  },

  // =========================================================================
  // ACCOUNT STATISTICS
  // =========================================================================
  
  /**
   * Get account statistics
   */
  getStats: async () => {
    try {
      const response = await api.get('/user/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get stats' };
    }
  },

  /**
   * Get dashboard data
   */
  getDashboardData: async () => {
    try {
      const response = await api.get('/user/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get dashboard data' };
    }
  },

  // =========================================================================
  // WALLET MANAGEMENT
  // =========================================================================
  
  /**
   * Connect wallet
   */
  connectWallet: async (walletAddress) => {
    try {
      const response = await api.post('/user/wallet/connect', { walletAddress });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to connect wallet' };
    }
  },

  /**
   * Disconnect wallet
   */
  disconnectWallet: async () => {
    try {
      const response = await api.post('/user/wallet/disconnect');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to disconnect wallet' };
    }
  },

  /**
   * Get wallet info
   */
  getWalletInfo: async () => {
    try {
      const response = await api.get('/user/wallet/info');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get wallet info' };
    }
  },

  // =========================================================================
  // TRANSACTIONS
  // =========================================================================
  
  /**
   * Get all transactions with pagination and filters
   */
  getTransactions: async (page = 1, limit = 20, type = null, status = null) => {
    try {
      let url = `/user/transactions?page=${page}&limit=${limit}`;
      if (type) url += `&type=${type}`;
      if (status) url += `&status=${status}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get transactions' };
    }
  },

  /**
   * Get single transaction details
   */
  getTransactionDetails: async (transactionId) => {
    try {
      const response = await api.get(`/user/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get transaction' };
    }
  },

  /**
   * Export transactions to CSV
   */
  exportTransactions: async (startDate, endDate) => {
    try {
      const response = await api.get('/user/transactions/export/csv', {
        params: { startDate, endDate },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to export transactions' };
    }
  },

  // =========================================================================
  // STAKING
  // =========================================================================
  
  /**
   * Get staking information
   */
  getStakingInfo: async () => {
    try {
      const response = await api.get('/user/staking/info');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get staking info' };
    }
  },

  /**
   * Stake tokens
   */
  stakeTokens: async (amount, duration) => {
    try {
      const response = await api.post('/user/staking/stake', { amount, duration });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to stake tokens' };
    }
  },

  /**
   * Unstake tokens
   */
  unstakeTokens: async (amount) => {
    try {
      const response = await api.post('/user/staking/unstake', { amount });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to unstake tokens' };
    }
  },

  /**
   * Claim rewards
   */
  claimRewards: async () => {
    try {
      const response = await api.post('/user/staking/claim-rewards');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to claim rewards' };
    }
  },

  /**
   * Get staking history
   */
  getStakingHistory: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/user/staking/history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get staking history' };
    }
  },

  // =========================================================================
  // SECURITY & ACCOUNT
  // =========================================================================
  
  /**
   * Get login history
   */
  getLoginHistory: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/user/security/login-history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get login history' };
    }
  },

  /**
   * Update account settings
   */
  updateSettings: async (settings) => {
    try {
      const response = await api.put('/user/settings', settings);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update settings' };
    }
  },

  /**
   * Delete account
   */
  deleteAccount: async (password) => {
    try {
      const response = await api.post('/user/account/delete', {
        password,
        confirmation: 'DELETE'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete account' };
    }
  },

  /**
   * Get account activity
   */
  getAccountActivity: async () => {
    try {
      const response = await api.get('/user/activity');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get activity' };
    }
  },

  // =========================================================================
  // NOTIFICATIONS & PREFERENCES
  // =========================================================================
  
  /**
   * Get notification preferences
   */
  getNotificationPreferences: async () => {
    try {
      const response = await api.get('/user/notifications/preferences');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get preferences' };
    }
  },

  /**
   * Update notification preferences
   */
  updateNotificationPreferences: async (preferences) => {
    try {
      const response = await api.put('/user/notifications/preferences', preferences);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update preferences' };
    }
  },

  /**
   * Get notifications
   */
  getNotifications: async (page = 1, limit = 20) => {
    try {
      const response = await api.get(`/user/notifications?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get notifications' };
    }
  },

  /**
   * Mark notification as read
   */
  markNotificationRead: async (notificationId) => {
    try {
      const response = await api.post(`/user/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark notification' };
    }
  },

  // =========================================================================
  // REFERRAL SYSTEM
  // =========================================================================
  
  /**
   * Get referral info
   */
  getReferralInfo: async () => {
    try {
      const response = await api.get('/user/referral/info');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get referral info' };
    }
  },

  /**
   * Get referral list
   */
  getReferralList: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/user/referral/list?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get referral list' };
    }
  },

  /**
   * Claim referral rewards
   */
  claimReferralRewards: async () => {
    try {
      const response = await api.post('/user/referral/claim-rewards');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to claim referral rewards' };
    }
  },
};

export default userService;