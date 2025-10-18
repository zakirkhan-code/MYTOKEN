// models/User.js - User Database Schema
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false // Don't return password by default
  },
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Wallet Info
  walletAddress: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true
  },
  
  // Email Verification
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: Date,
  
  // 2FA (Two Factor Authentication)
  twoFAEnabled: {
    type: Boolean,
    default: false
  },
  twoFASecret: {
    type: String,
    select: false // Only select when needed
  },
  twoFABackupCodes: [{
    code: String,
    used: { type: Boolean, default: false }
  }],
  
  // Staking Info
  staking: {
    totalStaked: { type: Number, default: 0 }, // in wei
    currentStake: { type: Number, default: 0 },
    pendingRewards: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    lastClaimTime: Date,
    stakeStartTime: Date,
    stakingActive: { type: Boolean, default: false }
  },
  
  // Transaction History
  transactions: [{
    txHash: String,
    type: { type: String, enum: ['stake', 'unstake', 'claim', 'transfer'] },
    amount: Number,
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    timestamp: { type: Date, default: Date.now },
    blockNumber: Number,
    gasUsed: Number,
    fromAddress: String,
    toAddress: String
  }],
  
  // Profile Data
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    country: String,
    profilePicture: String,
    bio: String
  },
  
  // Settings
  settings: {
    notifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'light' }
  },
  
  // Security
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  lastLogin: Date,
  loginHistory: [{
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    success: Boolean
  }],
  
  // Admin Data
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },
  banReason: String,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ============================================
// INDEXES
// ============================================

userSchema.index({ email: 1 });
userSchema.index({ walletAddress: 1 });
userSchema.index({ createdAt: -1 });

// ============================================
// MIDDLEWARE - Hash password before save
// ============================================

userSchema.pre('save', async function(next) {
  // Only hash if password has been modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// ============================================
// METHODS
// ============================================

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Increment login attempts
userSchema.methods.incLoginAttempts = async function() {
  // Reset if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  // Otherwise increment
  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 attempts for 2 hours
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000;
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockUntil: new Date(Date.now() + lockTime) };
  }

  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// Get public profile
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.twoFASecret;
  delete user.emailVerificationToken;
  delete user.twoFABackupCodes;
  return user;
};

module.exports = mongoose.model('User', userSchema);