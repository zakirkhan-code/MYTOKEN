import { useEffect, useRef } from 'react';
import { useTransactionStore, useStakingStore, useAdminStore } from '../store';
import { transactionAPI, stakingAPI, adminAPI } from '../services/api';
import toast from 'react-hot-toast';

export function useRealtimePolling(options = {}) {
  const {
    transactionInterval = 3000,    // 3 seconds
    stakingInterval = 5000,        // 5 seconds
    adminInterval = 10000,         // 10 seconds
    enabled = true
  } = options;

  const intervalsRef = useRef({});

  useEffect(() => {
    if (!enabled) return;

    // ========== TRANSACTIONS POLLING ==========
    if (!intervalsRef.current.transactions) {
      intervalsRef.current.transactions = setInterval(async () => {
        try {
          const response = await transactionAPI.getAllTransactions(1, 20);
          
          if (response.data?.success) {
            const transactions = response.data.data || [];
            const { transactions: currentTxs } = useTransactionStore.getState();
            
            // Check if new transactions arrived
            if (transactions.length > 0 && 
                transactions[0]?.id !== currentTxs[0]?.id) {
              console.log('📝 New transactions detected');
              useTransactionStore.setState({
                transactions,
                totalCount: response.data.total || transactions.length
              });
            }
          }
        } catch (error) {
          console.error('❌ Transaction polling failed:', error.message);
        }
      }, transactionInterval);
    }

    // ========== STAKING POLLING ==========
    if (!intervalsRef.current.staking) {
      intervalsRef.current.staking = setInterval(async () => {
        try {
          const response = await stakingAPI.getStats();
          
          if (response.data?.success) {
            const stats = response.data.stats;
            const { stakeInfo } = useStakingStore.getState();
            
            // Check if staking data changed
            if (stakeInfo && 
                (stakeInfo.pendingRewards !== stats.pendingRewards ||
                 stakeInfo.currentStake !== stats.currentStake)) {
              console.log('⛓️ Staking data updated');
              useStakingStore.setState({
                stakeInfo: stats
              });
            } else if (!stakeInfo) {
              useStakingStore.setState({
                stakeInfo: stats
              });
            }
          }
        } catch (error) {
          console.error('❌ Staking polling failed:', error.message);
        }
      }, stakingInterval);
    }

    // ========== ADMIN STATS POLLING ==========
    if (!intervalsRef.current.admin) {
      intervalsRef.current.admin = setInterval(async () => {
        try {
          const response = await adminAPI.getSystemStats();
          
          if (response.data?.success) {
            const stats = response.data.stats;
            const { stats: currentStats } = useAdminStore.getState();
            
            // Check if stats changed
            if (JSON.stringify(currentStats) !== JSON.stringify(stats)) {
              console.log('📊 Admin stats updated');
              useAdminStore.setState({
                stats
              });
            }
          }
        } catch (error) {
          console.error('❌ Admin polling failed:', error.message);
        }
      }, adminInterval);
    }

    // Cleanup on unmount
    return () => {
      Object.entries(intervalsRef.current).forEach(([key, interval]) => {
        if (interval) {
          clearInterval(interval);
          intervalsRef.current[key] = null;
        }
      });
    };
  }, [enabled, transactionInterval, stakingInterval, adminInterval]);

  // Manual refresh function
  const refreshTransactions = async () => {
    try {
      const response = await transactionAPI.getAllTransactions(1, 20);
      if (response.data?.success) {
        useTransactionStore.setState({
          transactions: response.data.data,
          totalCount: response.data.total
        });
        toast.success('✅ Transactions refreshed');
      }
    } catch (error) {
      toast.error('Failed to refresh transactions');
    }
  };

  const refreshStaking = async () => {
    try {
      const response = await stakingAPI.getStats();
      if (response.data?.success) {
        useStakingStore.setState({ stakeInfo: response.data.stats });
        toast.success('✅ Staking data refreshed');
      }
    } catch (error) {
      toast.error('Failed to refresh staking data');
    }
  };

  const refreshAdminStats = async () => {
    try {
      const response = await adminAPI.getSystemStats();
      if (response.data?.success) {
        useAdminStore.setState({ stats: response.data.stats });
        toast.success('✅ Admin stats refreshed');
      }
    } catch (error) {
      toast.error('Failed to refresh admin stats');
    }
  };

  return {
    refreshTransactions,
    refreshStaking,
    refreshAdminStats,
    refreshAll: async () => {
      await Promise.all([
        refreshTransactions(),
        refreshStaking(),
        refreshAdminStats()
      ]);
    }
  };
}

// Simpler version - just auto-refresh at intervals
export function useAutoRefresh() {
  return useRealtimePolling({
    transactionInterval: 3000,
    stakingInterval: 5000,
    adminInterval: 10000,
    enabled: true
  });
}

export default useRealtimePolling;