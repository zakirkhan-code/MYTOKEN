// routes/admin.js - Admin Management Routes
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// ============================================
// ADMIN AUTHENTICATION MIDDLEWARE
// ============================================

const adminAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET ALL USERS
// ============================================

router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, isActive, isBanned, search } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    if (role) filter.role = role;
    if (typeof isActive === 'string') filter.isActive = isActive === 'true';
    if (typeof isBanned === 'string') filter.isBanned = isBanned === 'true';

    if (search) {
      filter.$or = [
        { email: new RegExp(search, 'i') },
        { username: new RegExp(search, 'i') },
        { walletAddress: search.toLowerCase() }
      ];
    }

    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select('-password -twoFASecret -emailVerificationToken')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// GET USER DETAILS
// ============================================

router.get('/users/:userId', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password -twoFASecret');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user,
      stats: {
        totalTransactions: user.transactions.length,
        totalStaked: user.staking.totalStaked,
        totalEarned: user.staking.totalEarned,
        accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)) + ' days'
      }
    });
  } catch (error) {
    logger.error('Get user details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// BAN/UNBAN USER
// ============================================

router.put('/users/:userId/ban', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBanned, banReason } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isBanned = isBanned;
    if (isBanned) {
      user.banReason = banReason || 'Banned by admin';
      user.isActive = false;
    } else {
      user.banReason = undefined;
      user.isActive = true;
    }

    await user.save();

    logger.info(`User ${userId} ${isBanned ? 'banned' : 'unbanned'} by admin`);

    res.json({
      success: true,
      message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Ban user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// CHANGE USER ROLE
// ============================================

router.put('/users/:userId/role', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ['user', 'moderator', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    logger.info(`User ${userId} role changed to ${role} by admin`);

    res.json({
      success: true,
      message: 'User role updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Change user role error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// GET ALL TRANSACTIONS (ADMIN)
// ============================================

router.get('/transactions', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, userId } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    const total = await Transaction.countDocuments(filter);

    const transactions = await Transaction.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'email walletAddress');

    res.json({
      success: true,
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// GET SYSTEM STATISTICS
// ============================================

router.get('/stats/system', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const verifiedEmails = await User.countDocuments({ emailVerified: true });
    const twoFAEnabled = await User.countDocuments({ twoFAEnabled: true });

    const totalTransactions = await Transaction.countDocuments();
    const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });
    const confirmedTransactions = await Transaction.countDocuments({ status: 'confirmed' });
    const failedTransactions = await Transaction.countDocuments({ status: 'failed' });

    const users = await User.find().select('staking');
    const totalStaked = users.reduce((sum, u) => sum + u.staking.totalStaked, 0);
    const totalRewards = users.reduce((sum, u) => sum + u.staking.totalEarned, 0);

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers,
        emailVerified: verifiedEmails,
        twoFAEnabled
      },
      transactions: {
        total: totalTransactions,
        pending: pendingTransactions,
        confirmed: confirmedTransactions,
        failed: failedTransactions
      },
      staking: {
        totalStaked,
        totalRewards,
        averageStake: totalStaked / (totalUsers || 1)
      }
    };

    res.json({ success: true, stats });
  } catch (error) {
    logger.error('Get system stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// GET USER STATISTICS
// ============================================

router.get('/stats/users', auth, adminAuth, async (req, res) => {
  try {
    const usersCreatedToday = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    const usersCreatedThisWeek = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const usersCreatedThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        today: usersCreatedToday,
        thisWeek: usersCreatedThisWeek,
        thisMonth: usersCreatedThisMonth,
        byRole: usersByRole
      }
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// GET TRANSACTION STATISTICS
// ============================================

router.get('/stats/transactions', auth, adminAuth, async (req, res) => {
  try {
    const transactionsByType = await Transaction.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const transactionsByStatus = await Transaction.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const transactionsToday = await Transaction.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    res.json({
      success: true,
      stats: {
        byType: transactionsByType,
        byStatus: transactionsByStatus,
        today: transactionsToday
      }
    });
  } catch (error) {
    logger.error('Get transaction stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// RESET USER PASSWORD (ADMIN)
// ============================================

router.post('/users/:userId/reset-password', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters' 
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    logger.info(`Password reset for user ${userId} by admin`);

    res.json({
      success: true,
      message: 'User password reset successfully'
    });
  } catch (error) {
    logger.error('Reset user password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// VERIFY/UNVERIFY EMAIL (ADMIN)
// ============================================

router.put('/users/:userId/verify-email', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isVerified } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.emailVerified = isVerified;
    if (isVerified) {
      user.emailVerificationToken = undefined;
    }
    await user.save();

    logger.info(`Email ${isVerified ? 'verified' : 'unverified'} for user ${userId} by admin`);

    res.json({
      success: true,
      message: `Email ${isVerified ? 'verified' : 'unverified'} successfully`
    });
  } catch (error) {
    logger.error('Verify email error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// EXPORT SYSTEM REPORT
// ============================================

router.get('/export/report', auth, adminAuth, async (req, res) => {
  try {
    const report = {
      generatedAt: new Date(),
      users: {
        total: await User.countDocuments(),
        active: await User.countDocuments({ isActive: true }),
        banned: await User.countDocuments({ isBanned: true })
      },
      transactions: {
        total: await Transaction.countDocuments(),
        pending: await Transaction.countDocuments({ status: 'pending' }),
        confirmed: await Transaction.countDocuments({ status: 'confirmed' })
      }
    };

    res.json({
      success: true,
      report
    });
  } catch (error) {
    logger.error('Export report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;