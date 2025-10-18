// scripts/seedData.js - Database Seeding Script
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcryptjs');

// ============================================
// COLORS FOR CONSOLE OUTPUT
// ============================================

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.cyan}${'═'.repeat(50)}${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}${'═'.repeat(50)}${colors.reset}\n`)
};

// ============================================
// CONNECT TO DATABASE
// ============================================

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mytoken', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    log.success('Connected to MongoDB');
  } catch (error) {
    log.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// ============================================
// SAMPLE DATA
// ============================================

const sampleUsers = [
  {
    email: 'admin@mytoken.com',
    password: 'Admin@123456',
    username: 'admin',
    walletAddress: '0x1234567890123456789012345678901234567890',
    emailVerified: true,
    twoFAEnabled: false,
    role: 'admin',
    isActive: true,
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      country: 'Pakistan'
    },
    staking: {
      totalStaked: 1000,
      currentStake: 500,
      totalEarned: 100,
      pendingRewards: 50,
      stakingActive: true
    }
  },
  {
    email: 'test@example.com',
    password: 'Test@123456',
    username: 'testuser',
    walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    emailVerified: true,
    twoFAEnabled: false,
    role: 'user',
    isActive: true,
    profile: {
      firstName: 'Test',
      lastName: 'User',
      country: 'USA'
    },
    staking: {
      totalStaked: 500,
      currentStake: 500,
      totalEarned: 50,
      pendingRewards: 25,
      stakingActive: true
    }
  },
  {
    email: 'moderator@mytoken.com',
    password: 'Mod@123456',
    username: 'moderator',
    walletAddress: '0xfedcbafedcbafedcbafedcbafedcbafedcbafed',
    emailVerified: true,
    twoFAEnabled: true,
    role: 'moderator',
    isActive: true,
    profile: {
      firstName: 'Moderator',
      lastName: 'User',
      country: 'Canada'
    },
    staking: {
      totalStaked: 750,
      currentStake: 750,
      totalEarned: 75,
      pendingRewards: 37,
      stakingActive: true
    }
  }
];

const sampleTransactions = [
  {
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    type: 'stake',
    amount: '1000',
    amountInWei: '1000000000000000000000',
    walletAddress: '0x1234567890123456789012345678901234567890',
    contractAddress: '0xstakingcontract',
    contractName: 'StakingRewards',
    fromAddress: '0x1234567890123456789012345678901234567890',
    toAddress: '0xstakingcontract',
    gas: '100000',
    gasPrice: '20000000000',
    gasUsed: '95000',
    gasCostInEth: '0.0019',
    gasCostInUSD: 3.8,
    status: 'confirmed',
    blockNumber: 1000000,
    blockHash: '0xblock1',
    confirmations: 100,
    description: 'Staking 1000 MTK tokens'
  },
  {
    txHash: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    type: 'claim',
    amount: '100',
    amountInWei: '100000000000000000000',
    walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    contractAddress: '0xstakingcontract',
    contractName: 'StakingRewards',
    fromAddress: '0xstakingcontract',
    toAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    rewards: '100',
    gas: '80000',
    gasPrice: '20000000000',
    gasUsed: '75000',
    gasCostInEth: '0.0015',
    gasCostInUSD: 3,
    status: 'confirmed',
    blockNumber: 1000100,
    blockHash: '0xblock2',
    confirmations: 50,
    description: 'Claiming rewards'
  }
];

// ============================================
// CLEAR EXISTING DATA
// ============================================

const clearDatabase = async () => {
  try {
    log.header('CLEARING DATABASE');
    
    await User.deleteMany({});
    log.success('Cleared User collection');
    
    await Transaction.deleteMany({});
    log.success('Cleared Transaction collection');
  } catch (error) {
    log.error(`Error clearing database: ${error.message}`);
    throw error;
  }
};

// ============================================
// SEED USERS
// ============================================

const seedUsers = async () => {
  try {
    log.header('SEEDING USERS');

    const users = [];

    for (const userData of sampleUsers) {
      const user = new User(userData);
      const savedUser = await user.save();
      users.push(savedUser);
      log.success(`Created user: ${userData.email}`);
    }

    return users;
  } catch (error) {
    log.error(`Error seeding users: ${error.message}`);
    throw error;
  }
};

// ============================================
// SEED TRANSACTIONS
// ============================================

const seedTransactions = async (users) => {
  try {
    log.header('SEEDING TRANSACTIONS');

    const transactions = [];

    for (let i = 0; i < sampleTransactions.length; i++) {
      const txData = sampleTransactions[i];
      const user = users[i % users.length];

      const transaction = new Transaction({
        ...txData,
        userId: user._id
      });

      const savedTransaction = await transaction.save();
      transactions.push(savedTransaction);
      log.success(`Created transaction: ${txData.type}`);
    }

    return transactions;
  } catch (error) {
    log.error(`Error seeding transactions: ${error.message}`);
    throw error;
  }
};

// ============================================
// DISPLAY SUMMARY
// ============================================

const displaySummary = async () => {
  try {
    log.header('DATABASE SUMMARY');

    const userCount = await User.countDocuments();
    const transactionCount = await Transaction.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const twoFACount = await User.countDocuments({ twoFAEnabled: true });
    const verifiedEmails = await User.countDocuments({ emailVerified: true });

    log.info(`Total Users: ${userCount}`);
    log.info(`Active Users: ${activeUsers}`);
    log.info(`2FA Enabled: ${twoFACount}`);
    log.info(`Email Verified: ${verifiedEmails}`);
    log.info(`Total Transactions: ${transactionCount}`);

    log.header('SEEDING COMPLETED');
  } catch (error) {
    log.error(`Error displaying summary: ${error.message}`);
  }
};

// ============================================
// MAIN SEED FUNCTION
// ============================================

const seed = async () => {
  try {
    await connectDB();

    // Optional: Clear database before seeding
    const shouldClear = process.argv.includes('--clear');
    if (shouldClear) {
      await clearDatabase();
    }

    // Seed data
    const users = await seedUsers();
    await seedTransactions(users);

    // Display summary
    await displaySummary();

    log.success('✨ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    log.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

// ============================================
// RUN SEED
// ============================================

if (require.main === module) {
  seed();
}

module.exports = seed;