// routes/user.js - User Management Routes
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sanitizeObject, validatePhone, validateUsername } = require('../utils/validators');

// ============================================
// GET USER PROFILE
// ============================================

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// UPDATE PROFILE
// ============================================

router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, country, bio } = req.body;

    // Validation
    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number' });
    }

    const user = await User.findById(req.user.userId);

    // Update profile fields
    if (firstName) user.profile.firstName = firstName.trim();
    if (lastName) user.profile.lastName = lastName.trim();
    if (phone) user.profile.phone = phone;
    if (country) user.profile.country = country;
    if (bio) user.profile.bio = bio.substring(0, 500); // Max 500 chars

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// UPDATE SETTINGS
// ============================================

router.put('/settings', auth, async (req, res) => {
  try {
    const {
      notifications,
      emailNotifications,
      marketingEmails,
      language,
      theme
    } = req.body;

    const user = await User.findById(req.user.userId);

    // Update settings
    if (typeof notifications === 'boolean') user.settings.notifications = notifications;
    if (typeof emailNotifications === 'boolean') user.settings.emailNotifications = emailNotifications;
    if (typeof marketingEmails === 'boolean') user.settings.marketingEmails = marketingEmails;
    if (language && ['en', 'ur', 'es', 'fr'].includes(language)) {
      user.settings.language = language;
    }
    if (theme && ['light', 'dark'].includes(theme)) {
      user.settings.theme = theme;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// CONNECT WALLET
// ============================================

router.post('/connect-wallet', auth, async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ success: false, message: 'Wallet address required' });
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ success: false, message: 'Invalid wallet address format' });
    }

    // Check if wallet already connected to another user
    const existingUser = await User.findOne({ walletAddress });
    if (existingUser && existingUser._id.toString() !== req.user.userId) {
      return res.status(400).json({ success: false, message: 'Wallet already connected to another account' });
    }

    const user = await User.findById(req.user.userId);
    user.walletAddress = walletAddress.toLowerCase();
    await user.save();

    res.json({
      success: true,
      message: 'Wallet connected successfully',
      walletAddress: user.walletAddress
    });
  } catch (error) {
    console.error('Connect wallet error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// DISCONNECT WALLET
// ============================================

router.post('/disconnect-wallet', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user.walletAddress) {
      return res.status(400).json({ success: false, message: 'No wallet connected' });
    }

    user.walletAddress = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Wallet disconnected successfully'
    });
  } catch (error) {
    console.error('Disconnect wallet error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// GET ACCOUNT STATISTICS
// ============================================

router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    const stats = {
      accountCreated: user.createdAt,
      lastLogin: user.lastLogin,
      loginCount: user.loginHistory.filter(l => l.success).length,
      totalTransactions: user.transactions.length,
      successfulTransactions: user.transactions.filter(t => t.status === 'success').length,
      failedTransactions: user.transactions.filter(t => t.status === 'failed').length,
      
      // Staking Stats
      totalStaked: user.staking.totalStaked,
      currentStake: user.staking.currentStake,
      totalEarned: user.staking.totalEarned,
      pendingRewards: user.staking.pendingRewards,
      isStaking: user.staking.stakingActive,
      
      // Security Stats
      emailVerified: user.emailVerified,
      twoFAEnabled: user.twoFAEnabled,
      walletConnected: !!user.walletAddress,
      
      // Account Status
      accountActive: user.isActive,
      accountBanned: user.isBanned,
      userRole: user.role
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// GET LOGIN HISTORY
// ============================================

router.get('/login-history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.userId);

    const history = user.loginHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(skip, skip + parseInt(limit))
      .map(entry => ({
        timestamp: entry.timestamp,
        ipAddress: entry.ipAddress,
        device: entry.userAgent?.substring(0, 100) || 'Unknown',
        status: entry.success ? '✅ Success' : '❌ Failed'
      }));

    res.json({
      success: true,
      history,
      total: user.loginHistory.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get login history error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// GET TRANSACTION HISTORY
// ============================================

router.get('/transactions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.userId);

    let transactions = user.transactions;

    // Filter by type
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }

    // Filter by status
    if (status) {
      transactions = transactions.filter(t => t.status === status);
    }

    // Sort by newest first
    transactions = transactions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      transactions,
      total: user.transactions.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// CHANGE PASSWORD
// ============================================

router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const user = await User.findById(req.user.userId).select('+password');

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// EXPORT ACCOUNT DATA (GDPR)
// ============================================

router.get('/export-data', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    const exportData = {
      profile: {
        email: user.email,
        username: user.username,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        phone: user.profile.phone,
        country: user.profile.country
      },
      account: {
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        role: user.role,
        isActive: user.isActive
      },
      security: {
        emailVerified: user.emailVerified,
        twoFAEnabled: user.twoFAEnabled,
        walletAddress: user.walletAddress
      },
      staking: user.staking,
      transactions: user.transactions,
      loginHistory: user.loginHistory
    };

    res.json({
      success: true,
      data: exportData,
      exportedAt: new Date()
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// DELETE ACCOUNT (GDPR)
// ============================================

router.post('/delete-account', auth, async (req, res) => {
  try {
    const { password, confirm } = req.body;

    if (!password || confirm !== 'DELETE') {
      return res.status(400).json({ success: false, message: 'Invalid confirmation' });
    }

    const user = await User.findById(req.user.userId).select('+password');

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    // Mark as deleted instead of removing
    user.email = `deleted_${Date.now()}@deleted.com`;
    user.isActive = false;
    user.password = 'deleted';
    user.walletAddress = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;