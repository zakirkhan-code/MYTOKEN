// models/Transaction.js - Transaction Database Schema
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Transaction Info
  txHash: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  
  // User Reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  walletAddress: {
    type: String,
    lowercase: true,
    required: true,
    index: true
  },
  
  // Transaction Details
  type: {
    type: String,
    enum: ['stake', 'unstake', 'claim', 'transfer', 'approve'],
    required: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  
  amount: {
    type: String, // Use string to avoid floating point issues
    required: true
  },
  
  amountInWei: {
    type: String, // Store in wei format
    required: true
  },
  
  // Gas Information
  gas: {
    type: String,
    default: '0'
  },
  
  gasPrice: {
    type: String,
    default: '0'
  },
  
  gasUsed: {
    type: String,
    default: '0'
  },
  
  gasCostInEth: {
    type: String,
    default: '0'
  },
  
  gasCostInUSD: {
    type: Number,
    default: 0
  },
  
  // Blockchain Details
  blockNumber: {
    type: Number,
    index: true
  },
  
  blockHash: String,
  
  confirmations: {
    type: Number,
    default: 0
  },
  
  nonce: Number,
  
  // Contract Info
  contractAddress: {
    type: String,
    lowercase: true
  },
  
  contractName: String, // e.g., "MyToken", "StakingRewards"
  
  // Addresses
  fromAddress: {
    type: String,
    lowercase: true,
    required: true
  },
  
  toAddress: {
    type: String,
    lowercase: true
  },
  
  // Additional Data
  data: String, // Encoded function call data
  
  input: String, // Raw input data
  
  // Rewards/Penalties (for staking)
  rewards: {
    type: String,
    default: '0'
  },
  
  penalty: {
    type: String,
    default: '0'
  },
  
  stakingPeriod: {
    type: Number, // Days
    default: 0
  },
  
  apy: {
    type: Number, // Annual percentage yield
    default: 10
  },
  
  // Error Information
  errorMessage: String,
  
  errorCode: String,
  
  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  confirmedAt: Date,
  
  failedAt: Date,
  
  // Metadata
  description: String, // Human-readable description
  
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Retry Info
  retryCount: {
    type: Number,
    default: 0
  },
  
  maxRetries: {
    type: Number,
    default: 3
  },
  
  lastRetryAt: Date,
  
  // Indexing for faster queries
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// ============================================
// INDEXES
// ============================================

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ walletAddress: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ blockNumber: 1 });
transactionSchema.index({ txHash: 1 });
transactionSchema.index({ createdAt: -1 });

// ============================================
// MIDDLEWARE - Update timestamp
// ============================================

transactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// ============================================
// METHODS
// ============================================

// Mark as confirmed
transactionSchema.methods.markAsConfirmed = function() {
  this.status = 'confirmed';
  this.confirmedAt = new Date();
  return this.save();
};

// Mark as failed
transactionSchema.methods.markAsFailed = function(errorMessage, errorCode) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.errorMessage = errorMessage;
  this.errorCode = errorCode;
  return this.save();
};

// Increment retry count
transactionSchema.methods.incrementRetry = function() {
  this.retryCount += 1;
  this.lastRetryAt = new Date();
  
  if (this.retryCount >= this.maxRetries) {
    this.status = 'failed';
    this.errorMessage = `Max retries (${this.maxRetries}) exceeded`;
  }
  
  return this.save();
};

// Get transaction summary
transactionSchema.methods.getSummary = function() {
  return {
    txHash: this.txHash,
    type: this.type,
    status: this.status,
    amount: this.amount,
    walletAddress: this.walletAddress,
    contractName: this.contractName,
    blockNumber: this.blockNumber,
    confirmations: this.confirmations,
    submittedAt: this.submittedAt,
    confirmedAt: this.confirmedAt,
    description: this.description
  };
};

// Format transaction for display
transactionSchema.methods.toDisplayFormat = function() {
  const statusEmoji = {
    pending: '⏳',
    confirmed: '✅',
    failed: '❌'
  };
  
  return {
    id: this._id,
    txHash: this.txHash.substring(0, 10) + '...',
    type: this.type.toUpperCase(),
    status: `${statusEmoji[this.status]} ${this.status.toUpperCase()}`,
    amount: `${this.amount} MTK`,
    gas: `${(parseFloat(this.gasCostInEth) * 1e9).toFixed(2)} Gwei`,
    gasUSD: `$${this.gasCostInUSD.toFixed(2)}`,
    blockNumber: this.blockNumber || 'Pending',
    confirmations: this.confirmations,
    time: this.submittedAt.toLocaleString(),
    description: this.description
  };
};

module.exports = mongoose.model('Transaction', transactionSchema);