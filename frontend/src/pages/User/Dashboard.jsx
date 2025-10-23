import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Zap, Wallet, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { stakingAPI, transactionAPI } from '../../services/api';
import { useStakingStore, useTransactionStore, useUIStore } from '../../store';
import { useRealtimePolling } from '../../hooks/useRealtimePolling';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { stakeInfo, setStakeInfo, isLive, lastUpdate } = useStakingStore();
  const { transactions } = useTransactionStore();
  const { isRealtimeConnected } = useUIStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Enable real-time polling
  const { refreshAll } = useRealtimePolling({
    transactionInterval: 3000,
    stakingInterval: 5000,
    enabled: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stakingStats, txStats] = await Promise.all([
        stakingAPI.getStats(),
        transactionAPI.getStats()
      ]);

      setStats({
        staking: stakingStats.data?.stats || {},
        transactions: txStats.data?.stats || {}
      });

      if (stakingStats.data?.stats) {
        setStakeInfo(stakingStats.data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    toast.loading('Refreshing...');
    await refreshAll();
    toast.dismiss();
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-fadeIn">
      {/* Header with Live Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Your staking overview.</p>
        </div>
        
        {/* Live Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 font-medium">
              {isRealtimeConnected ? '🟢 Live' : '🔴 Polling'}
            </span>
          </div>
          
          <button
            onClick={handleManualRefresh}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Refresh data"
          >
            <RefreshCw size={20} className="text-blue-600" />
          </button>

          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Updated: {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Staked */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm">Total Staked</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {stakeInfo?.currentStake || stats?.staking?.totalStaked || 0} MTK
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Wallet className="text-blue-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500">Earning 10% APY</p>
          {isLive && <span className="text-xs text-green-600 mt-1">🔄 Live</span>}
        </div>

        {/* Pending Rewards */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm">Pending Rewards</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {stakeInfo?.pendingRewards || stats?.staking?.totalEarned || 0} MTK
              </h3>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500">Available to claim</p>
          {isLive && <span className="text-xs text-green-600 mt-1">🔄 Live</span>}
        </div>

        {/* Transactions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm">Total Transactions</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {transactions?.length || stats?.transactions?.total || 0}
              </h3>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Zap className="text-purple-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500">All time</p>
          {isLive && <span className="text-xs text-green-600 mt-1">🔄 Live</span>}
        </div>

        {/* Staking Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm">Staking Status</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {stakeInfo?.currentStake > 0 ? 'Active' : 'Inactive'}
              </h3>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500">30 days lock period</p>
          {isLive && <span className="text-xs text-green-600 mt-1">🔄 Live</span>}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staking Info */}
        <div className="lg:col-span-2 card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Staking Information</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Wallet className="text-blue-600" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Wallet Balance</p>
                  <p className="font-semibold text-gray-900">{stakeInfo?.balance || 0} MTK</p>
                </div>
              </div>
              <ArrowDownLeft className="text-blue-600" size={20} />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className="text-green-600" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Available Rewards</p>
                  <p className="font-semibold text-gray-900">{stakeInfo?.pendingRewards || 0} MTK</p>
                </div>
              </div>
              <ArrowUpRight className="text-green-600" size={20} />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-purple-600" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Annual Yield</p>
                  <p className="font-semibold text-gray-900">10% APY</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button className="btn btn-primary flex-1">
              <Zap size={18} /> Start Staking
            </button>
            <button className="btn btn-secondary flex-1">
              Claim Rewards
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>

          <div className="space-y-3">
            <button className="w-full p-3 text-left bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition">
              <p className="font-semibold text-blue-900">Stake MTK</p>
              <p className="text-xs text-blue-700 mt-1">Lock your tokens</p>
            </button>

            <button className="w-full p-3 text-left bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:shadow-md transition">
              <p className="font-semibold text-green-900">Claim Rewards</p>
              <p className="text-xs text-green-700 mt-1">Withdraw earnings</p>
            </button>

            <button className="w-full p-3 text-left bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition">
              <p className="font-semibold text-purple-900">View History</p>
              <p className="text-xs text-purple-700 mt-1">Transaction logs</p>
            </button>

            <button className="w-full p-3 text-left bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg hover:shadow-md transition">
              <p className="font-semibold text-yellow-900">Connect Wallet</p>
              <p className="text-xs text-yellow-700 mt-1">Add web3 wallet</p>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Transactions</h2>

        {transactions && transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {tx.type === 'stake' ? <ArrowDownLeft className="text-blue-600" size={18} /> : <ArrowUpRight className="text-green-600" size={18} />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">{tx.type}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{tx.amount} {tx.symbol || 'MTK'}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tx.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No transactions yet</p>
        )}
      </div>
    </div>
  );
}