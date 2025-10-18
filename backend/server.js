// server.js - Main Backend Server (SIMPLE & WORKING)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================
// DATABASE CONNECTION
// ============================================

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mytoken', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running',
    timestamp: new Date()
  });
});

// ============================================
// IMPORT ROUTES
// ============================================

try {
  const authRoutes = require('./routes/auth');
  const userRoutes = require('./routes/user');
  const stakingRoutes = require('./routes/staking');
  const transactionRoutes = require('./routes/transactions');
  const adminRoutes = require('./routes/admin');
  const twoFARoutes = require('./routes/2fa');

  // ============================================
  // MOUNT ROUTES
  // ============================================

  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/staking', stakingRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/2fa', twoFARoutes);

  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
}

// ============================================
// API DOCUMENTATION
// ============================================

app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    version: '1.0.0',
    message: 'MyToken Backend API',
    endpoints: {
      auth: [
        'POST /api/auth/register',
        'POST /api/auth/verify-email',
        'POST /api/auth/login',
        'POST /api/auth/logout',
        'POST /api/auth/forgot-password',
        'POST /api/auth/reset-password',
        'GET /api/auth/me'
      ],
      user: [
        'GET /api/user/profile',
        'PUT /api/user/profile',
        'PUT /api/user/settings',
        'POST /api/user/connect-wallet',
        'POST /api/user/disconnect-wallet',
        'GET /api/user/stats',
        'GET /api/user/login-history',
        'GET /api/user/transactions',
        'POST /api/user/change-password',
        'POST /api/user/delete-account'
      ],
      twoFA: [
        'POST /api/2fa/setup',
        'POST /api/2fa/verify-setup',
        'POST /api/2fa/verify-token',
        'POST /api/2fa/disable',
        'GET /api/2fa/backup-codes',
        'POST /api/2fa/regenerate-backup-codes'
      ],
      staking: [
        'GET /api/staking/info/:walletAddress',
        'POST /api/staking/record-stake',
        'POST /api/staking/record-unstake',
        'POST /api/staking/record-claim',
        'GET /api/staking/history',
        'GET /api/staking/stats',
        'POST /api/staking/sync'
      ],
      transactions: [
        'GET /api/transactions',
        'GET /api/transactions/:txHash',
        'POST /api/transactions/record',
        'PUT /api/transactions/:txHash/status',
        'GET /api/transactions/stats/overview',
        'GET /api/transactions/filter/by-type/:type',
        'GET /api/transactions/filter/by-status/:status',
        'POST /api/transactions/:txHash/retry',
        'GET /api/transactions/export/csv'
      ],
      admin: [
        'GET /api/admin/users',
        'GET /api/admin/users/:userId',
        'PUT /api/admin/users/:userId/ban',
        'PUT /api/admin/users/:userId/role',
        'GET /api/admin/transactions',
        'GET /api/admin/stats/system',
        'GET /api/admin/stats/users',
        'GET /api/admin/stats/transactions'
      ]
    }
  });
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ============================================
// SERVER START
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
});

module.exports = app;