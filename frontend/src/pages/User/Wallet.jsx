import React, { useEffect, useState } from 'react';
import { Wallet, Copy, Zap, LogOut, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { connectWallet, getBalance, formatAddress, getNetworkInfo } from '../../services/wallet';
import { userAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

export default function WalletPage() {
  const { user } = useAuthStore();
  const [walletAddress, setWalletAddress] = useState(null);
  const [balance, setBalance] = useState('0');
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [txHash, setTxHash] = useState(null);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      // In real app, fetch from user profile
      const profile = await userAPI.getProfile();
      if (profile.data?.user?.walletAddress) {
        setWalletAddress(profile.data.user.walletAddress);
        
        // Get balance
        try {
          const bal = await getBalance(profile.data.user.walletAddress);
          setBalance(bal);
        } catch (error) {
          console.error('Error getting balance:', error);
        }

        // Get network info
        try {
          const net = await getNetworkInfo();
          setNetwork(net);
        } catch (error) {
          console.error('Error getting network:', error);
        }
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      const address = await connectWallet();
      setWalletAddress(address);

      // Save to backend
      await userAPI.connectWallet(address);

      // Get balance
      const bal = await getBalance(address);
      setBalance(bal);

      toast.success(`✅ Wallet connected: ${formatAddress(address)}`);
    } catch (error) {
      toast.error(error.message || 'Failed to connect wallet');
      console.error('Connect wallet error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      setLoading(true);
      await userAPI.disconnectWallet();
      setWalletAddress(null);
      setBalance('0');
      setNetwork(null);
      toast.success('✅ Wallet disconnected');
    } catch (error) {
      toast.error('Failed to disconnect wallet');
      console.error('Disconnect error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success('✅ Address copied to clipboard');
    }
  };

  return (
    <div className="p-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wallet Management</h1>
        <p className="text-gray-600 mt-2">Connect and manage your Web3 wallet</p>
      </div>

      {/* Connection Status */}
      {walletAddress ? (
        // Connected Wallet
        <div className="card border-2 border-green-200 bg-green-50">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">Wallet Connected</h2>
              </div>
              <p className="text-green-700 mt-2">Your Web3 wallet is active and ready to use</p>
            </div>
            <button
              onClick={handleDisconnectWallet}
              disabled={loading}
              className="btn btn-danger flex items-center gap-2"
            >
              <LogOut size={18} /> Disconnect
            </button>
          </div>

          <div className="space-y-4">
            {/* Wallet Address */}
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <p className="text-gray-600 text-sm mb-2">Wallet Address</p>
              <div className="flex items-center justify-between">
                <p className="font-mono text-lg text-gray-900 break-all">{walletAddress}</p>
                <button
                  onClick={handleCopyAddress}
                  className="ml-4 p-2 hover:bg-gray-100 rounded transition flex-shrink-0"
                >
                  <Copy size={20} className="text-blue-600" />
                </button>
              </div>
            </div>

            {/* Balance */}
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <p className="text-gray-600 text-sm mb-2">Balance</p>
              <div className="flex items-center gap-3">
                <Zap className="text-blue-600" size={24} />
                <div>
                  <p className="text-3xl font-bold text-gray-900">{parseFloat(balance).toFixed(4)}</p>
                  <p className="text-sm text-gray-500">ETH (Sepolia Testnet)</p>
                </div>
              </div>
            </div>

            {/* Network Info */}
            {network && (
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <p className="text-gray-600 text-sm mb-2">Network</p>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">{network.name}</p>
                  <p className="text-sm text-gray-500">Chain ID: {network.chainId}</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-green-200">
            <a
              href={`https://sepolia.etherscan.io/address/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary flex items-center justify-center gap-2"
            >
              <ExternalLink size={18} /> View on Etherscan
            </a>
            <button
              onClick={loadWalletData}
              disabled={loading}
              className="btn btn-outline flex items-center justify-center gap-2"
            >
              <Zap size={18} /> Refresh Data
            </button>
          </div>
        </div>
      ) : (
        // Not Connected
        <div className="card border-2 border-yellow-200 bg-yellow-50">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <AlertCircle className="text-yellow-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">Wallet Not Connected</h2>
              </div>
              <p className="text-yellow-700 mt-2">Connect your Web3 wallet to start staking</p>
            </div>
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="btn btn-primary flex items-center gap-2"
            >
              <Wallet size={18} /> {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* About Wallets */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Supported Wallets</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="font-semibold text-gray-900">MetaMask</p>
                <p className="text-sm text-gray-600">Most popular wallet extension</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="font-semibold text-gray-900">WalletConnect</p>
                <p className="text-sm text-gray-600">Mobile wallet connection</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="font-semibold text-gray-900">Coinbase Wallet</p>
                <p className="text-sm text-gray-600">Coinbase extension & mobile</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Security Info */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🔒 Security Tips</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">1.</span>
              <span>Never share your private keys with anyone</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">2.</span>
              <span>Always verify website URLs before connecting</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">3.</span>
              <span>Use hardware wallets for large amounts</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">4.</span>
              <span>Keep your browser extensions updated</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">5.</span>
              <span>Enable 2FA in wallet settings</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Network Requirements */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-4">🌐 Network Requirements</h3>
        <div className="space-y-3 text-sm text-blue-900">
          <p>
            <strong>Supported Network:</strong> Ethereum Sepolia Testnet (Chain ID: 11155111)
          </p>
          <p>
            <strong>Token:</strong> SepoliaETH (for transaction fees)
          </p>
          <p>
            Get free testnet ETH from: <a href="https://sepoliafaucet.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Sepolia Faucet</a>
          </p>
        </div>
      </div>

      {/* Transactions */}
      {walletAddress && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Wallet Activity</h3>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Wallet Connected</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
                <CheckCircle className="text-green-600" size={20} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}