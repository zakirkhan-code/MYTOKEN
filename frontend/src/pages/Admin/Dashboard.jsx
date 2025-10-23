import React, { useEffect, useState } from 'react';
import { Users, CreditCard, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useAdminStore, useUIStore } from '../../store';
import { useRealtimePolling } from '../../hooks/useRealtimePolling';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { setStats, stats, lastUpdate } = useAdminStore();
  const { isRealtimeConnected } = useUIStore();
  const [stats_local, setLocalStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Enable real-time polling for admin
  const { refreshAdminStats, refreshAll } = useRealtimePolling({
    adminInterval: 5000,
    enabled: true
  });

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSystemStats();
      if (response.data.success) {
        setLocalStats(response.data.stats);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    toast.loading('Refreshing admin dashboard...');
    await refreshAll();
    toast.dismiss();
  };

  const displayStats = stats_local || stats;

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
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-2">System overview and management</p>
        </div>

        {/* Live Status & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-900 rounded-lg border border-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-300 font-medium">
              {isRealtimeConnected ? '🟢 Live' : '🔴 Polling'}
            </span>
          </div>

          <button
            onClick={handleManualRefresh}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
            title="Refresh data"
          >
            <RefreshCw size={20} className="text-blue-400" />
          </button>

          {lastUpdate && (
            <span className="text-xs text-slate-500">
              Updated: {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="admin-card border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Users</p>
              <h3 className="text-3xl font-bold text-white mt-2">
                {displayStats?.users?.total || 0}
              </h3>
            </div>
            <Users className="text-blue-400" size={32} />
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Active: {displayStats?.users?.active || 0}
          </p>
        </div>

        {/* Active Users */}
        <div className="admin-card border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Users</p>
              <h3 className="text-3xl font-bold text-white mt-2">
                {displayStats?.users?.active || 0}
              </h3>
            </div>
            <TrendingUp className="text-green-400" size={32} />
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Last 24 hours
          </p>
        </div>

        {/* Total Transactions */}
        <div className="admin-card border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Transactions</p>
              <h3 className="text-3xl font-bold text-white mt-2">
                {displayStats?.transactions?.total || 0}
              </h3>
            </div>
            <CreditCard className="text-purple-400" size={32} />
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Confirmed: {displayStats?.transactions?.confirmed || 0}
          </p>
        </div>

        {/* Total Staked */}
        <div className="admin-card border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Staked</p>
              <h3 className="text-3xl font-bold text-white mt-2">
                {displayStats?.staking?.totalStaked || 0} MTK
              </h3>
            </div>
            <AlertCircle className="text-yellow-400" size={32} />
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Rewards: {displayStats?.staking?.totalRewards || 0} MTK
          </p>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <h2 className="text-xl font-bold text-white mb-6">User Statistics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
              <span className="text-slate-300">Verified Emails</span>
              <span className="font-bold text-white">{displayStats?.users?.emailVerified || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
              <span className="text-slate-300">2FA Enabled</span>
              <span className="font-bold text-white">{displayStats?.users?.twoFAEnabled || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
              <span className="text-slate-300">Banned Users</span>
              <span className="font-bold text-red-400">{displayStats?.users?.banned || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
              <span className="text-slate-300">New This Week</span>
              <span className="font-bold text-green-400">{displayStats?.users?.newThisWeek || 0}</span>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-xl font-bold text-white mb-6">Transaction Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
              <span className="text-slate-300">Confirmed</span>
              <span className="font-bold text-green-400">{displayStats?.transactions?.confirmed || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
              <span className="text-slate-300">Pending</span>
              <span className="font-bold text-yellow-400">{displayStats?.transactions?.pending || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
              <span className="text-slate-300">Failed</span>
              <span className="font-bold text-red-400">{displayStats?.transactions?.failed || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
              <span className="text-slate-300">Total Volume</span>
              <span className="font-bold text-blue-400">{displayStats?.transactions?.totalVolume || 0} MTK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Types */}
      <div className="admin-card">
        <h2 className="text-xl font-bold text-white mb-6">Transaction Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-slate-800 rounded-lg">
            <p className="text-2xl font-bold text-blue-400">
              {displayStats?.transactions?.byType?.stake || 0}
            </p>
            <p className="text-sm text-slate-400 mt-2">Stakes</p>
          </div>
          <div className="text-center p-4 bg-slate-800 rounded-lg">
            <p className="text-2xl font-bold text-purple-400">
              {displayStats?.transactions?.byType?.unstake || 0}
            </p>
            <p className="text-sm text-slate-400 mt-2">Unstakes</p>
          </div>
          <div className="text-center p-4 bg-slate-800 rounded-lg">
            <p className="text-2xl font-bold text-green-400">
              {displayStats?.transactions?.byType?.claim || 0}
            </p>
            <p className="text-sm text-slate-400 mt-2">Claims</p>
          </div>
          <div className="text-center p-4 bg-slate-800 rounded-lg">
            <p className="text-2xl font-bold text-yellow-400">
              {displayStats?.transactions?.byType?.transfer || 0}
            </p>
            <p className="text-sm text-slate-400 mt-2">Transfers</p>
          </div>
          <div className="text-center p-4 bg-slate-800 rounded-lg">
            <p className="text-2xl font-bold text-indigo-400">
              {displayStats?.transactions?.byType?.approve || 0}
            </p>
            <p className="text-sm text-slate-400 mt-2">Approvals</p>
          </div>
        </div>
      </div>

      {/* Staking Overview */}
      <div className="admin-card">
        <h2 className="text-xl font-bold text-white mb-6">Staking Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-300 text-sm">Total Staked</p>
            <p className="text-2xl font-bold text-white mt-2">
              {displayStats?.staking?.totalStaked || 0}
            </p>
            <p className="text-xs text-slate-500 mt-2">MTK</p>
          </div>
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-300 text-sm">Total Rewards</p>
            <p className="text-2xl font-bold text-green-400 mt-2">
              {displayStats?.staking?.totalRewards || 0}
            </p>
            <p className="text-xs text-slate-500 mt-2">MTK</p>
          </div>
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-300 text-sm">Average Stake</p>
            <p className="text-2xl font-bold text-blue-400 mt-2">
              {(displayStats?.staking?.averageStake || 0).toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-2">MTK</p>
          </div>
        </div>
      </div>
    </div>
  );
}