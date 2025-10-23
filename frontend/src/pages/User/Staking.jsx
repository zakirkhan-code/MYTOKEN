import React, { useEffect, useState } from 'react';
import { Zap, Lock, Unlock, Gift, TrendingUp, AlertCircle, RefreshCw, Info } from 'lucide-react';
import { stakingAPI } from '../../services/api';
import { useStakingStore, useTransactionStore } from '../../store';
import { useRealtimePolling } from '../../hooks/useRealtimePolling';
import toast from 'react-hot-toast';

export default function Staking() {
  const { stakeInfo, setStakeInfo, isLive, lastUpdate } = useStakingStore();
  const { addTransaction } = useTransactionStore();
  const { refreshStaking } = useRealtimePolling();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stake'); // stake, unstake, claim
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchStakingInfo();
  }, []);

  const fetchStakingInfo = async () => {
    try {
      setLoading(true);
      const response = await stakingAPI.getStats();
      if (response.data?.success) {
        setStakeInfo(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching staking info:', error);
      toast.error('Failed to load staking data');
    } finally {
      setLoading(false);
    }
  };

  const validateStakeAmount = () => {
    const errors = {};
    if (!stakeAmount) errors.stakeAmount = 'Amount is required';
    else if (isNaN(stakeAmount) || parseFloat(stakeAmount) <= 0) 
      errors.stakeAmount = 'Enter valid amount';
    else if (parseFloat(stakeAmount) < 10) 
      errors.stakeAmount = 'Minimum stake is 10 MTK';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateUnstakeAmount = () => {
    const errors = {};
    if (!unstakeAmount) errors.unstakeAmount = 'Amount is required';
    else if (isNaN(unstakeAmount) || parseFloat(unstakeAmount) <= 0) 
      errors.unstakeAmount = 'Enter valid amount';
    else if (parseFloat(unstakeAmount) > (stakeInfo?.currentStake || 0)) 
      errors.unstakeAmount = 'Cannot unstake more than staked amount';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStake = async (e) => {
    e.preventDefault();
    if (!validateStakeAmount()) return;

    try {
      setSubmitting(true);
      const amount = parseFloat(stakeAmount);

      // Simulating API call
      toast.loading('Processing stake transaction...');

      // In real app, call stakingAPI.recordStake()
      const txData = {
        id: 'tx_' + Date.now(),
        type: 'stake',
        amount,
        symbol: 'MTK',
        status: 'pending',
        createdAt: new Date(),
        hash: '0x' + Math.random().toString(16).slice(2)
      };

      // Update stores
      setStakeInfo({
        ...stakeInfo,
        currentStake: (stakeInfo?.currentStake || 0) + amount,
        totalStaked: (stakeInfo?.totalStaked || 0) + amount
      });

      addTransaction(txData);

      toast.dismiss();
      toast.success(`✅ Successfully staked ${amount} MTK!`);
      setStakeAmount('');
      setErrors({});

      // Refresh data
      await refreshStaking();
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to stake tokens');
      console.error('Stake error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnstake = async (e) => {
    e.preventDefault();
    if (!validateUnstakeAmount()) return;

    try {
      setSubmitting(true);
      const amount = parseFloat(unstakeAmount);

      toast.loading('Processing unstake transaction...');

      const txData = {
        id: 'tx_' + Date.now(),
        type: 'unstake',
        amount,
        symbol: 'MTK',
        status: 'pending',
        createdAt: new Date(),
        hash: '0x' + Math.random().toString(16).slice(2)
      };

      setStakeInfo({
        ...stakeInfo,
        currentStake: Math.max(0, (stakeInfo?.currentStake || 0) - amount)
      });

      addTransaction(txData);

      toast.dismiss();
      toast.success(`✅ Successfully unstaked ${amount} MTK!`);
      setUnstakeAmount('');
      setErrors({});

      await refreshStaking();
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to unstake tokens');
      console.error('Unstake error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    const claimAmount = stakeInfo?.pendingRewards || 0;

    if (claimAmount <= 0) {
      toast.error('No rewards to claim');
      return;
    }

    try {
      setSubmitting(true);
      toast.loading('Claiming rewards...');

      const txData = {
        id: 'tx_' + Date.now(),
        type: 'claim',
        amount: claimAmount,
        symbol: 'MTK',
        status: 'pending',
        createdAt: new Date(),
        hash: '0x' + Math.random().toString(16).slice(2)
      };

      setStakeInfo({
        ...stakeInfo,
        pendingRewards: 0,
        totalClaimed: (stakeInfo?.totalClaimed || 0) + claimAmount
      });

      addTransaction(txData);

      toast.dismiss();
      toast.success(`🎁 Claimed ${claimAmount} MTK rewards!`);

      await refreshStaking();
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to claim rewards');
      console.error('Claim error:', error);
    } finally {
      setSubmitting(false);
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staking</h1>
          <p className="text-gray-600 mt-2">Stake your MTK tokens and earn rewards</p>
        </div>
        <button
          onClick={refreshStaking}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <RefreshCw size={20} className="text-blue-600" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Current Stake</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {stakeInfo?.currentStake || 0} MTK
              </h3>
            </div>
            <Lock className="text-blue-600" size={24} />
          </div>
          <p className="text-xs text-gray-500 mt-2">Your locked tokens</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Rewards</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">
                {stakeInfo?.pendingRewards || 0} MTK
              </h3>
            </div>
            <Gift className="text-green-600" size={24} />
          </div>
          <p className="text-xs text-gray-500 mt-2">Ready to claim</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Annual Yield</p>
              <h3 className="text-2xl font-bold text-purple-600 mt-1">10% APY</h3>
            </div>
            <TrendingUp className="text-purple-600" size={24} />
          </div>
          <p className="text-xs text-gray-500 mt-2">Annual percentage</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Earned</p>
              <h3 className="text-2xl font-bold text-yellow-600 mt-1">
                {stakeInfo?.totalClaimed || 0} MTK
              </h3>
            </div>
            <Zap className="text-yellow-600" size={24} />
          </div>
          <p className="text-xs text-gray-500 mt-2">All-time rewards</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <Info className="text-blue-600 flex-shrink-0" size={20} />
        <div>
          <h3 className="font-semibold text-blue-900">How Staking Works</h3>
          <p className="text-sm text-blue-800 mt-1">
            Lock your MTK tokens to earn 10% annual rewards. Minimum stake is 10 MTK. Unstake anytime with 7-day unlock period.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('stake')}
            className={`pb-4 font-semibold transition ${
              activeTab === 'stake'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Lock className="inline mr-2" size={18} /> Stake Tokens
          </button>
          <button
            onClick={() => setActiveTab('unstake')}
            className={`pb-4 font-semibold transition ${
              activeTab === 'unstake'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Unlock className="inline mr-2" size={18} /> Unstake Tokens
          </button>
          <button
            onClick={() => setActiveTab('claim')}
            className={`pb-4 font-semibold transition ${
              activeTab === 'claim'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Gift className="inline mr-2" size={18} /> Claim Rewards
          </button>
        </div>

        {/* Stake Tab */}
        {activeTab === 'stake' && (
          <form onSubmit={handleStake} className="space-y-4">
            <div>
              <label className="label">Amount to Stake (MTK)</label>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => {
                  setStakeAmount(e.target.value);
                  if (errors.stakeAmount) setErrors({});
                }}
                placeholder="Enter amount"
                min="10"
                step="0.01"
                className={`input ${errors.stakeAmount ? 'input-error' : ''}`}
              />
              {errors.stakeAmount && (
                <p className="text-red-500 text-sm mt-1">{errors.stakeAmount}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">Minimum: 10 MTK | Max: 100,000 MTK</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Annual Rewards (10% APY):</span>
                <span className="font-semibold">
                  {stakeAmount ? (parseFloat(stakeAmount) * 0.1).toFixed(2) : 0} MTK
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lock Period:</span>
                <span className="font-semibold">30 days</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !stakeAmount}
              className="btn btn-primary w-full py-3"
            >
              {submitting ? 'Processing...' : 'Stake Tokens'}
            </button>
          </form>
        )}

        {/* Unstake Tab */}
        {activeTab === 'unstake' && (
          <form onSubmit={handleUnstake} className="space-y-4">
            <div>
              <label className="label">Amount to Unstake (MTK)</label>
              <input
                type="number"
                value={unstakeAmount}
                onChange={(e) => {
                  setUnstakeAmount(e.target.value);
                  if (errors.unstakeAmount) setErrors({});
                }}
                placeholder="Enter amount"
                max={stakeInfo?.currentStake || 0}
                step="0.01"
                className={`input ${errors.unstakeAmount ? 'input-error' : ''}`}
              />
              {errors.unstakeAmount && (
                <p className="text-red-500 text-sm mt-1">{errors.unstakeAmount}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Available: {stakeInfo?.currentStake || 0} MTK
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                ⚠️ Unstaking will lock your tokens for 7 days before they're transferred back.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !unstakeAmount || !stakeInfo?.currentStake}
              className="btn btn-secondary w-full py-3"
            >
              {submitting ? 'Processing...' : 'Unstake Tokens'}
            </button>
          </form>
        )}

        {/* Claim Tab */}
        {activeTab === 'claim' && (
          <form onSubmit={handleClaim} className="space-y-4">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
              <p className="text-gray-600 text-sm">Available Rewards</p>
              <h2 className="text-4xl font-bold text-green-600 mt-2">
                {stakeInfo?.pendingRewards || 0} MTK
              </h2>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Rewards are calculated daily based on your stake and APY.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !stakeInfo?.pendingRewards}
              className="btn btn-success w-full py-3"
            >
              {submitting ? 'Processing...' : `Claim ${stakeInfo?.pendingRewards || 0} MTK Rewards`}
            </button>
          </form>
        )}
      </div>

      {/* Terms */}
      <div className="card bg-gray-50">
        <h3 className="font-bold text-gray-900 mb-4">Staking Terms</h3>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span>Minimum stake amount is 10 MTK</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span>Annual percentage yield (APY) is 10%</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span>Rewards are compounded daily</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span>Unstaking has a 7-day unlock period</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span>You can claim rewards anytime</span>
          </li>
        </ul>
      </div>
    </div>
  );
}