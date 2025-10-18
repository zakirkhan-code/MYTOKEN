// routes/staking.js - Staking Routes
const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get blockchain provider
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

// ABI for StakingRewards contract
const STAKING_ABI = [
  'function stake(uint256 amount) external',
  'function unstake() external',
  'function claimRewards() external',
  'function getPendingRewards(address user) public view returns (uint256)',
  'function getStakeInfo(address user) external view returns (uint256 amount, uint256 startTime, uint256 pendingRewards, bool isActive)'
];

const stakingContractAddress = process.env.STAKING_REWARDS_ADDRESS;

// ============================================
// GET STAKING INFO
// ============================================

router.get('/info/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Get from blockchain
    const stakingContract = new ethers.Contract(
      stakingContractAddress,
      STAKING_ABI,
      provider
    );

    const stakeInfo = await stakingContract.getStakeInfo(walletAddress);
    const pendingRewards = await stakingContract.getPendingRewards(walletAddress);

    res.json({
      success: true,
      stakeInfo: {
        amount: ethers.formatEther(stakeInfo[0]),
        startTime: Number(stakeInfo[1]),
        pendingRewards: ethers.formatEther(pendingRewards),
        isActive: stakeInfo[3]
      }
    });
  } catch (error) {
    console.error('Get staking info error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// RECORD STAKE (Called after blockchain tx)
// ============================================

router.post('/record-stake', auth, async (req, res) => {
  try {
    const { amount, txHash, blockNumber } = req.body;
    const user = await User.findById(req.user.userId);

    // Update user staking info
    user.staking.currentStake = parseFloat(amount);
    user.staking.totalStaked = parseFloat(amount);
    user.staking.stakingActive = true;
    user.staking.stakeStartTime = new Date();

    // Record transaction
    user.transactions.push({
      txHash,
      type: 'stake',
      amount: parseFloat(amount),
      status: 'success',
      timestamp: new Date(),
      blockNumber
    });

    await user.save();

    res.json({
      success: true,
      message: 'Stake recorded successfully'
    });
  } catch (error) {
    console.error('Record stake error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// RECORD UNSTAKE
// ============================================

router.post('/record-unstake', auth, async (req, res) => {
  try {
    const { amount, penalty, txHash, blockNumber } = req.body;
    const user = await User.findById(req.user.userId);

    // Update user staking info
    user.staking.currentStake = 0;
    user.staking.stakingActive = false;
    user.staking.totalEarned += parseFloat(amount) - parseFloat(penalty);

    // Record transaction
    user.transactions.push({
      txHash,
      type: 'unstake',
      amount: parseFloat(amount),
      status: 'success',
      timestamp: new Date(),
      blockNumber
    });

    await user.save();

    res.json({
      success: true,
      message: 'Unstake recorded successfully'
    });
  } catch (error) {
    console.error('Record unstake error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// RECORD CLAIM REWARDS
// ============================================

router.post('/record-claim', auth, async (req, res) => {
  try {
    const { amount, txHash, blockNumber } = req.body;
    const user = await User.findById(req.user.userId);

    // Update user staking info
    user.staking.pendingRewards = 0;
    user.staking.totalEarned = (parseFloat(user.staking.totalEarned) + parseFloat(amount)).toString();
    user.staking.lastClaimTime = new Date();

    // Record transaction
    user.transactions.push({
      txHash,
      type: 'claim',
      amount: parseFloat(amount),
      status: 'success',
      timestamp: new Date(),
      blockNumber
    });

    await user.save();

    res.json({
      success: true,
      message: 'Rewards claim recorded successfully'
    });
  } catch (error) {
    console.error('Record claim error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// GET STAKING HISTORY
// ============================================

router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    // Filter staking-related transactions
    const history = user.transactions.filter(tx => 
      ['stake', 'unstake', 'claim'].includes(tx.type)
    );

    res.json({
      success: true,
      history,
      stats: {
        totalStaked: user.staking.totalStaked,
        totalEarned: user.staking.totalEarned,
        currentStake: user.staking.currentStake,
        stakingActive: user.staking.stakingActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// GET STAKING STATS
// ============================================

router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    const stakingTx = user.transactions.filter(tx => 
      ['stake', 'unstake', 'claim'].includes(tx.type)
    );

    const stats = {
      totalTransactions: stakingTx.length,
      totalStakingAmount: user.staking.totalStaked,
      totalEarned: user.staking.totalEarned,
      currentStake: user.staking.currentStake,
      isStaking: user.staking.stakingActive,
      lastStakeTime: user.staking.stakeStartTime,
      lastClaimTime: user.staking.lastClaimTime,
      apy: '10%',
      estimatedMonthlyEarnings: (parseFloat(user.staking.currentStake) * 0.1 / 12).toFixed(4)
    };

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// SYNC STAKING WITH BLOCKCHAIN
// ============================================

router.post('/sync', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user.walletAddress) {
      return res.status(400).json({ success: false, message: 'No wallet connected' });
    }

    // Get data from blockchain
    const stakingContract = new ethers.Contract(
      stakingContractAddress,
      STAKING_ABI,
      provider
    );

    const stakeInfo = await stakingContract.getStakeInfo(user.walletAddress);
    const pendingRewards = await stakingContract.getPendingRewards(user.walletAddress);

    // Update user data
    user.staking.currentStake = ethers.formatEther(stakeInfo[0]);
    user.staking.stakingActive = stakeInfo[3];
    user.staking.pendingRewards = ethers.formatEther(pendingRewards);

    if (stakeInfo[1] > 0 && !user.staking.stakeStartTime) {
      user.staking.stakeStartTime = new Date(Number(stakeInfo[1]) * 1000);
    }

    await user.save();

    res.json({
      success: true,
      message: 'Staking data synced with blockchain',
      data: {
        currentStake: ethers.formatEther(stakeInfo[0]),
        pendingRewards: ethers.formatEther(pendingRewards),
        isStaking: stakeInfo[3]
      }
    });
  } catch (error) {
    console.error('Sync staking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;