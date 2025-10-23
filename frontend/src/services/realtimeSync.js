import { getSocket, initializeSocket } from './websocket';
import { useTransactionStore, useStakingStore, useAdminStore } from '../store';
import toast from 'react-hot-toast';

export function initializeRealtimeSync() {
  console.log('🔄 Initializing Real-Time Sync...');

  const socket = initializeSocket();

  // ============ TRANSACTION UPDATES ============
  socket.on('new-transaction', (transaction) => {
    console.log('📝 New Transaction Received:', transaction);
    
    useTransactionStore.setState((state) => ({
      transactions: [transaction, ...state.transactions],
      totalCount: state.totalCount + 1
    }));

    toast.success(`New ${transaction.type} transaction: ${transaction.amount} ${transaction.symbol}`);
  });

  socket.on('transaction-status-update', (data) => {
    console.log('🔄 Transaction Status Updated:', data);
    
    useTransactionStore.setState((state) => ({
      transactions: state.transactions.map(tx =>
        tx.id === data.txId 
          ? { ...tx, status: data.status, updatedAt: new Date().toISOString() }
          : tx
      )
    }));

    const statusEmoji = {
      'pending': '⏳',
      'confirmed': '✅',
      'failed': '❌',
      'cancelled': '⛔'
    };

    toast[data.status === 'confirmed' ? 'success' : data.status === 'failed' ? 'error' : 'loading'](
      `${statusEmoji[data.status] || '🔄'} Transaction ${data.status}`
    );
  });

  socket.on('transaction-confirmed', (txHash) => {
    console.log('✅ Transaction Confirmed:', txHash);
    
    useTransactionStore.setState((state) => ({
      transactions: state.transactions.map(tx =>
        tx.hash === txHash 
          ? { ...tx, status: 'confirmed', confirmedAt: new Date().toISOString() }
          : tx
      )
    }));

    toast.success(`✅ Transaction confirmed: ${txHash.substring(0, 10)}...`);
  });

  socket.on('transaction-failed', (data) => {
    console.log('❌ Transaction Failed:', data);
    
    useTransactionStore.setState((state) => ({
      transactions: state.transactions.map(tx =>
        tx.id === data.txId 
          ? { ...tx, status: 'failed', error: data.error }
          : tx
      )
    }));

    toast.error(`❌ Transaction failed: ${data.error || 'Unknown error'}`);
  });

  // ============ STAKING UPDATES ============
  socket.on('rewards-earned', (data) => {
    console.log('💰 Rewards Earned:', data);
    
    useStakingStore.setState((state) => ({
      pendingRewards: state.pendingRewards + data.amount,
      stakeInfo: state.stakeInfo ? {
        ...state.stakeInfo,
        pendingRewards: (state.stakeInfo.pendingRewards || 0) + data.amount,
        lastRewardAt: new Date().toISOString()
      } : null
    }));

    toast.success(`💰 Rewards earned: +${data.amount} ${data.symbol}`);
  });

  socket.on('staking-updated', (stakingData) => {
    console.log('⛓️ Staking Data Updated:', stakingData);
    
    useStakingStore.setState({
      stakeInfo: stakingData,
      stakeInfo: {
        ...stakingData,
        updatedAt: new Date().toISOString()
      }
    });

    toast.success('⛓️ Staking data updated');
  });

  socket.on('stake-created', (data) => {
    console.log('✅ Stake Created:', data);
    
    useStakingStore.setState((state) => ({
      stakeInfo: {
        ...state.stakeInfo,
        ...data,
        createdAt: new Date().toISOString()
      }
    }));

    toast.success(`✅ Successfully staked ${data.amount} ${data.symbol}`);
  });

  socket.on('stake-unstaked', (data) => {
    console.log('🔓 Stake Unstaked:', data);
    
    useStakingStore.setState((state) => ({
      stakeInfo: {
        ...state.stakeInfo,
        currentStake: Math.max(0, (state.stakeInfo?.currentStake || 0) - data.amount)
      }
    }));

    toast.success(`🔓 Successfully unstaked ${data.amount} ${data.symbol}`);
  });

  socket.on('claim-executed', (data) => {
    console.log('🎁 Rewards Claimed:', data);
    
    useStakingStore.setState((state) => ({
      pendingRewards: 0,
      stakeInfo: state.stakeInfo ? {
        ...state.stakeInfo,
        pendingRewards: 0,
        totalClaimed: (state.stakeInfo.totalClaimed || 0) + data.amount,
        lastClaimAt: new Date().toISOString()
      } : null
    }));

    toast.success(`🎁 Rewards claimed: ${data.amount} ${data.symbol}`);
  });

  // ============ ADMIN UPDATES ============
  socket.on('system-update', (stats) => {
    console.log('📊 System Stats Updated:', stats);
    
    useAdminStore.setState({ 
      stats: {
        ...stats,
        updatedAt: new Date().toISOString()
      }
    });
  });

  socket.on('new-user-registered', (userData) => {
    console.log('👤 New User Registered:', userData);
    
    useAdminStore.setState((state) => ({
      users: [userData, ...state.users],
      stats: state.stats ? {
        ...state.stats,
        users: {
          ...state.stats.users,
          total: (state.stats.users?.total || 0) + 1
        }
      } : null
    }));

    toast.success(`👤 New user registered: ${userData.email}`);
  });

  socket.on('user-activity', (activity) => {
    console.log('👤 User Activity:', activity);
    
    useAdminStore.setState((state) => ({
      users: state.users.map(user =>
        user.id === activity.userId 
          ? { 
              ...user, 
              lastActivity: new Date().toISOString(),
              lastActivityType: activity.type
            }
          : user
      )
    }));
  });

  socket.on('transaction-volume-update', (data) => {
    console.log('📈 Transaction Volume Updated:', data);
    
    useAdminStore.setState((state) => ({
      stats: state.stats ? {
        ...state.stats,
        transactions: {
          ...state.stats.transactions,
          ...data
        }
      } : null
    }));

    toast.success(`📈 Transaction volume: ${data.total} transactions`);
  });

  socket.on('staking-pool-update', (data) => {
    console.log('💎 Staking Pool Updated:', data);
    
    useAdminStore.setState((state) => ({
      stats: state.stats ? {
        ...state.stats,
        staking: {
          ...state.stats.staking,
          ...data
        }
      } : null
    }));

    toast.success(`💎 Staking pool: ${data.totalStaked} tokens`);
  });

  // ============ ALERTS & NOTIFICATIONS ============
  socket.on('alert', (alertData) => {
    console.log('🚨 Alert Received:', alertData);
    
    toast(alertData.message, {
      duration: 5000,
      icon: alertData.icon || '🔔'
    });
  });

  socket.on('error-occurred', (errorData) => {
    console.error('❌ Error Event:', errorData);
    toast.error(`Error: ${errorData.message}`);
  });

  // ============ CONNECTION STATUS ============
  socket.on('reconnect', () => {
    console.log('✅ Reconnected to server');
    toast.success('✅ Reconnected to live updates');
  });

  socket.on('reconnect_error', (error) => {
    console.error('❌ Reconnection Error:', error);
    toast.error('⚠️ Connection error - attempting to reconnect');
  });

  console.log('✅ Real-Time Sync Initialized Successfully!');
}

// ============ FUNCTIONS TO EMIT EVENTS ============

export function emitTransaction(transactionData) {
  const socket = getSocket();
  socket.emit('create-transaction', transactionData);
}

export function emitStaking(stakingData) {
  const socket = getSocket();
  socket.emit('stake-tokens', stakingData);
}

export function emitClaim(claimData) {
  const socket = getSocket();
  socket.emit('claim-rewards', claimData);
}

export function subscribeToUserTransactions(userId) {
  const socket = getSocket();
  socket.emit('subscribe-user-transactions', { userId });
}

export function subscribeToUserStaking(userId) {
  const socket = getSocket();
  socket.emit('subscribe-user-staking', { userId });
}

export function subscribeToAdminStats() {
  const socket = getSocket();
  socket.emit('subscribe-admin-stats');
}

export default {
  initializeRealtimeSync,
  emitTransaction,
  emitStaking,
  emitClaim,
  subscribeToUserTransactions,
  subscribeToUserStaking,
  subscribeToAdminStats
};