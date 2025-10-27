// src/pages/AdminDashboard.jsx - FIXED VERSION
import React, { useEffect, useState } from 'react';
import { Users, CreditCard, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useAdminStore, useUIStore } from '../../store';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { setStats, stats, lastUpdate } = useAdminStore();
  const { isRealtimeConnected } = useUIStore();
  const [stats_local, setLocalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================
  // FETCH STATS ON MOUNT
  // ============================================

  useEffect(() => {
    const initializeDashboard = async () => {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (!token || !user) {
        setError('Not authenticated. Please login first.');
        setLoading(false);
        window.location.href = '/login';
        return;
      }

      console.log('🔐 User authenticated. Fetching admin dashboard stats...');
      await fetchSystemStats();
    };

    initializeDashboard();

    // Refresh stats every 10 seconds
    const interval = setInterval(fetchSystemStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // ============================================
  // FETCH SYSTEM STATS
  // ============================================

  const fetchSystemStats = async () => {
    try {
      console.log('📊 Fetching system stats...');
      setLoading(true);
      setError(null);

      // ✅ FIX: Get fresh token before request
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No JWT token found');
      }

      console.log('🔑 Using JWT token:', token.substring(0, 20) + '...');

      // Call admin API
      const response = await adminAPI.getSystemStats();

      if (response.data.success) {
        console.log('✅ Stats fetched successfully:', response.data.stats);
        setLocalStats(response.data.stats);
        setStats(response.data.stats);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);

      // Handle specific errors
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (error.response?.status === 403) {
        setError('Access denied. You do not have admin permissions.');
        console.error('🔴 403 Forbidden - Check user role is "admin"');
      } else {
        setError(error.message || 'Failed to load admin dashboard');
      }

      toast.error('Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // MANUAL REFRESH
  // ============================================

  const handleManualRefresh = async () => {
    toast.loading('Refreshing admin dashboard...');
    await fetchSystemStats();
    toast.dismiss();
    toast.success('Dashboard refreshed!');
  };

  // ============================================
  // DISPLAY STATS
  // ============================================

  const displayStats = stats_local || stats;

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading && !displayStats) {
    return (
      <div className="p-8 flex items-center justify-center h-full min-h-screen">
        <div className="text-center">
          <div className="spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================

  if (error && !displayStats) {
    return (
      <div className="p-8 flex items-center justify-center h-full min-h-screen">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={handleManualRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

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
              {isRealtimeConnected ? '🟢 Live' : '🔄 Polling'}
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

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-900 border border-red-700 rounded-lg text-red-300">
          ⚠️ {error}
        </div>
      )}

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