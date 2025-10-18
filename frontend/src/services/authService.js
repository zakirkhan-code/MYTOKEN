// services/authService.js - Complete Authentication Service
import api from './api';
import Cookies from 'js-cookie';

const authService = {
  // =========================================================================
  // USER REGISTRATION
  // =========================================================================
  register: async (email, password, confirmPassword) => {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  // =========================================================================
  // EMAIL VERIFICATION
  // =========================================================================
  verifyEmail: async (token) => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Email verification failed' };
    }
  },

  // =========================================================================
  // RESEND VERIFICATION EMAIL
  // =========================================================================
  resendVerificationEmail: async (email) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to resend verification' };
    }
  },

  // =========================================================================
  // USER LOGIN
  // =========================================================================
  login: async (email, password, rememberMe = false) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        rememberMe,
      });

      // Save token and user data
      const { token, user } = response.data;
      if (token) {
        const expiresIn = rememberMe ? 30 : 7;
        Cookies.set('authToken', token, { expires: expiresIn });
        localStorage.setItem('user', JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // =========================================================================
  // USER LOGOUT
  // =========================================================================
  logout: () => {
    Cookies.remove('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('dashboard_data');
  },

  // =========================================================================
  // FORGOT PASSWORD - Send reset email
  // =========================================================================
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send reset email' };
    }
  },

  // =========================================================================
  // RESET PASSWORD - Complete password reset
  // =========================================================================
  resetPassword: async (token, newPassword, confirmPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Password reset failed' };
    }
  },

  // =========================================================================
  // GET CURRENT USER
  // =========================================================================
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get user' };
    }
  },

  // =========================================================================
  // REFRESH TOKEN
  // =========================================================================
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      if (response.data?.token) {
        Cookies.set('authToken', response.data.token, { expires: 7 });
      }
      return response.data;
    } catch (error) {
      authService.logout();
      throw error.response?.data || { message: 'Token refresh failed' };
    }
  },

  // =========================================================================
  // CHECK AUTHENTICATION STATUS
  // =========================================================================
  isAuthenticated: () => {
    return !!Cookies.get('authToken');
  },

  // =========================================================================
  // GET STORED TOKEN
  // =========================================================================
  getToken: () => {
    return Cookies.get('authToken');
  },

  // =========================================================================
  // GET STORED USER
  // =========================================================================
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // =========================================================================
  // VALIDATE RESET TOKEN
  // =========================================================================
  validateResetToken: async (token) => {
    try {
      const response = await api.post('/auth/validate-reset-token', { token });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Invalid reset token' };
    }
  },

  // =========================================================================
  // CHANGE PASSWORD (FOR LOGGED-IN USERS)
  // =========================================================================
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Password change failed' };
    }
  },

  // =========================================================================
  // TWO-FACTOR AUTHENTICATION SETUP
  // =========================================================================
  setupTwoFA: async () => {
    try {
      const response = await api.post('/auth/2fa/setup');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to setup 2FA' };
    }
  },

  // =========================================================================
  // VERIFY TWO-FACTOR CODE
  // =========================================================================
  verifyTwoFA: async (code) => {
    try {
      const response = await api.post('/auth/2fa/verify', { code });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Invalid 2FA code' };
    }
  },

  // =========================================================================
  // DISABLE TWO-FACTOR AUTHENTICATION
  // =========================================================================
  disableTwoFA: async (code) => {
    try {
      const response = await api.post('/auth/2fa/disable', { code });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to disable 2FA' };
    }
  },
};

export default authService;