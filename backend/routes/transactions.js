// routes/transactions.js - Transaction Management Routes
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// ============================================
// GET ALL TRANSACTIONS
// ============================================

router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, sort = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { userId: req.user.userId };

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    // Get total count
    const total = await Transaction.countDocuments(filter);

    // Get transactions
    const transactions = await Transaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

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
// GET TRANSACTION BY HASH
// ============================================

router.get('/:txHash', auth, async (req, res) => {
  try {
    const { txHash } = req.params;

    const transaction = await Transaction.findOne({
      txHash: txHash.toLowerCase(),
      userId: req.user.userId
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({
      success: true,
      transaction,
      displayFormat: transaction.toDisplayFormat()
    });
  } catch (error) {
    logger.error('Get transaction error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// RECORD NEW TRANSACTION
// ============================================

router.post('/record', auth, async (req, res) => {
  try {
    const {
      txHash,
      type,
      amount,
      amountInWei,
      walletAddress,
      contractAddress,
      contractName,
      fromAddress,
      toAddress,
      gas,
      gasPrice,
      rewards,
      penalty,
      description
    } = req.body;

    // Validation
    if (!txHash || !type || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'txHash, type, and amount are required' 
      });
    }

    // Check if transaction already exists
    const existingTx = await Transaction.findOne({ txHash: txHash.toLowerCase() });
    if (existingTx) {
      return res.status(400).json({ 
        success: false, 
        message: 'Transaction already recorded' 
      });
    }

    // Create transaction
    const transaction = new Transaction({
      userId: req.user.userId,
      txHash: txHash.toLowerCase(),
      type,
      amount,
      amountInWei,
      walletAddress: walletAddress?.toLowerCase(),
      contractAddress: contractAddress?.toLowerCase(),
      contractName,
      fromAddress: fromAddress?.toLowerCase(),
      toAddress: toAddress?.toLowerCase(),
      gas,
      gasPrice,
      rewards: rewards || '0',
      penalty: penalty || '0',
      description: description || `${type} transaction`,
      status: 'pending'
    });

    await transaction.save();

    // Update user's transaction array
    const user = await User.findById(req.user.userId);
    user.transactions.push({
      txHash,
      type,
      amount,
      status: 'pending',
      timestamp: new Date()
    });
    await user.save();

    logger.info(`Transaction recorded: ${txHash}`);

    res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully',
      transaction
    });
  } catch (error) {
    logger.error('Record transaction error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// UPDATE TRANSACTION STATUS
// ============================================

router.put('/:txHash/status', auth, async (req, res) => {
  try {
    const { txHash } = req.params;
    const { status, blockNumber, blockHash, confirmations, gasUsed } = req.body;

    if (!status || !['pending', 'confirmed', 'failed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const transaction = await Transaction.findOne({
      txHash: txHash.toLowerCase(),
      userId: req.user.userId
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Update transaction
    transaction.status = status;

    if (blockNumber) transaction.blockNumber = blockNumber;
    if (blockHash) transaction.blockHash = blockHash;
    if (confirmations) transaction.confirmations = confirmations;
    if (gasUsed) transaction.gasUsed = gasUsed;

    if (status === 'confirmed') {
      await transaction.markAsConfirmed();
    } else if (status === 'failed') {
      await transaction.markAsFailed('Transaction failed on blockchain', 'TX_FAILED');
    } else {
      await transaction.save();
    }

    // Update user's transactions
    const user = await User.findById(req.user.userId);
    const userTx = user.transactions.find(t => t.txHash === txHash);
    if (userTx) {
      userTx.status = status;
      userTx.blockNumber = blockNumber;
      await user.save();
    }

    logger.info(`Transaction updated: ${txHash} - ${status}`);

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      transaction
    });
  } catch (error) {
    logger.error('Update transaction error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// GET TRANSACTION STATISTICS
// ============================================

router.get('/stats/overview', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId });

    const stats = {
      total: transactions.length,
      pending: transactions.filter(t => t.status === 'pending').length,
      confirmed: transactions.filter(t => t.status === 'confirmed').length,
      failed: transactions.filter(t => t.status === 'failed').length,
      
      byType: {
        stake: transactions.filter(t => t.type === 'stake').length,
        unstake: transactions.filter(t => t.type === 'unstake').length,
        claim: transactions.filter(t => t.type === 'claim').length,
        transfer: transactions.filter(t => t.type === 'transfer').length,
        approve: transactions.filter(t => t.type === 'approve').length
      },

      totalGasSpent: transactions.reduce((sum, t) => {
        return sum + parseFloat(t.gasCostInEth || 0);
      }, 0),

      totalGasSpentUSD: transactions.reduce((sum, t) => {
        return sum + (t.gasCostInUSD || 0);
      }, 0),

      totalStaked: transactions
        .filter(t => t.type === 'stake' && t.status === 'confirmed')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),

      totalRewardsClaimed: transactions
        .filter(t => t.type === 'claim' && t.status === 'confirmed')
        .reduce((sum, t) => sum + parseFloat(t.rewards || 0), 0)
    };

    res.json({ success: true, stats });
  } catch (error) {
    logger.error('Get transaction stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// GET TRANSACTIONS BY TYPE
// ============================================

router.get('/filter/by-type/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const validTypes = ['stake', 'unstake', 'claim', 'transfer', 'approve'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid type. Must be one of: ${validTypes.join(', ')}` 
      });
    }

    const total = await Transaction.countDocuments({
      userId: req.user.userId,
      type
    });

    const transactions = await Transaction.find({
      userId: req.user.userId,
      type
    })
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      transactions,
      type,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Get transactions by type error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// GET TRANSACTIONS BY STATUS
// ============================================

router.get('/filter/by-status/:status', auth, async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const validStatuses = ['pending', 'confirmed', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const total = await Transaction.countDocuments({
      userId: req.user.userId,
      status
    });

    const transactions = await Transaction.find({
      userId: req.user.userId,
      status
    })
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      transactions,
      status,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Get transactions by status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// RETRY FAILED TRANSACTION
// ============================================

router.post('/:txHash/retry', auth, async (req, res) => {
  try {
    const { txHash } = req.params;

    const transaction = await Transaction.findOne({
      txHash: txHash.toLowerCase(),
      userId: req.user.userId
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.status !== 'failed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only failed transactions can be retried' 
      });
    }

    if (transaction.retryCount >= transaction.maxRetries) {
      return res.status(400).json({ 
        success: false, 
        message: `Maximum retries (${transaction.maxRetries}) exceeded` 
      });
    }

    await transaction.incrementRetry();

    logger.info(`Transaction retry: ${txHash} - Attempt ${transaction.retryCount}`);

    res.json({
      success: true,
      message: `Retry attempt ${transaction.retryCount} started`,
      transaction
    });
  } catch (error) {
    logger.error('Retry transaction error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// EXPORT TRANSACTIONS (CSV)
// ============================================

router.get('/export/csv', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId })
      .sort('-createdAt');

    let csv = 'TxHash,Type,Status,Amount,Gas(USD),Block,Time\n';

    transactions.forEach(tx => {
      csv += `${tx.txHash},${tx.type},${tx.status},${tx.amount},${tx.gasCostInUSD || 0},${tx.blockNumber || 'Pending'},${tx.submittedAt.toISOString()}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="transactions.csv"');
    res.send(csv);
  } catch (error) {
    logger.error('Export transactions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;