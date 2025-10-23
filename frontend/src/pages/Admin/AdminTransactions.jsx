import React, { useEffect, useState } from 'react';
import { CreditCard, Search, Filter, Eye, RefreshCw, Download, CheckCircle, Clock, XCircle } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useAdminStore } from '../../store';
import toast from 'react-hot-toast';

export default function AdminTransactions() {
  const { transactions, setTransactions, setIsLoading } = useAdminStore();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedTx, setSelectedTx] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filterType, filterStatus]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllTransactions(
        currentPage,
        pageSize,
        filterType !== 'all' ? filterType : undefined,
        filterStatus !== 'all' ? filterStatus : undefined
      );

      if (response.data?.success) {
        setTransactions(response.data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      const csv = [
        ['TX Hash', 'Type', 'Status', 'Amount', 'User', 'Date'],
        ...transactions.map(tx => [
          tx.txHash || 'N/A',
          tx.type,
          tx.status,
          `${tx.amount} ${tx.symbol || 'MTK'}`,
          tx.userId ? tx.userId.email : 'N/A',
          new Date(tx.createdAt).toLocaleString()
        ])
      ]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('✅ Exported successfully');
    } catch (error) {
      toast.error('Failed to export');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="text-green-400" size={18} />;
      case 'pending':
        return <Clock className="text-yellow-400" size={18} />;
      case 'failed':
        return <XCircle className="text-red-400" size={18} />;
      default:
        return null;
    }
  };

  const filteredTx = transactions.filter(tx => {
    const matchesSearch = 
      tx.txHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx._id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: transactions.length,
    confirmed: transactions.filter(t => t.status === 'confirmed').length,
    pending: transactions.filter(t => t.status === 'pending').length,
    failed: transactions.filter(t => t.status === 'failed').length,
    totalVolume: transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
  };

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <CreditCard className="text-blue-400" size={32} />
            Transaction Management
          </h1>
          <p className="text-slate-400 mt-2">Monitor and manage all blockchain transactions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="btn bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Download size={18} /> Export CSV
          </button>
          <button
            onClick={fetchTransactions}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
          >
            <RefreshCw size={20} className="text-blue-400" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="admin-card">
          <p className="text-slate-400 text-sm">Total</p>
          <h3 className="text-2xl font-bold text-white mt-1">{stats.total}</h3>
        </div>
        <div className="admin-card">
          <p className="text-slate-400 text-sm">Confirmed</p>
          <h3 className="text-2xl font-bold text-green-400 mt-1">{stats.confirmed}</h3>
        </div>
        <div className="admin-card">
          <p className="text-slate-400 text-sm">Pending</p>
          <h3 className="text-2xl font-bold text-yellow-400 mt-1">{stats.pending}</h3>
        </div>
        <div className="admin-card">
          <p className="text-slate-400 text-sm">Failed</p>
          <h3 className="text-2xl font-bold text-red-400 mt-1">{stats.failed}</h3>
        </div>
        <div className="admin-card">
          <p className="text-slate-400 text-sm">Total Volume</p>
          <h3 className="text-2xl font-bold text-blue-400 mt-1">{stats.totalVolume.toFixed(2)}</h3>
          <p className="text-xs text-slate-500 mt-1">MTK</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="label text-white mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="TX hash or ID"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="input pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="label text-white mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="input bg-slate-800 border-slate-700 text-white"
            >
              <option value="all">All Types</option>
              <option value="stake">Stake</option>
              <option value="unstake">Unstake</option>
              <option value="claim">Claim</option>
              <option value="transfer">Transfer</option>
              <option value="approve">Approve</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="label text-white mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="input bg-slate-800 border-slate-700 text-white"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner w-12 h-12"></div>
          </div>
        ) : filteredTx.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">TX Hash</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-200">Amount</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-200">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Block</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Date</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredTx.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-700 transition">
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-900 text-blue-200 capitalize">
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 font-mono">
                      {tx.txHash ? tx.txHash.substring(0, 16) + '...' : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-white font-semibold">
                      {tx.amount} {tx.symbol || 'MTK'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getStatusIcon(tx.status)}
                        <span className="text-xs font-semibold capitalize text-slate-200">
                          {tx.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {tx.blockNumber || 'Pending'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedTx(tx);
                          setShowModal(true);
                        }}
                        className="p-2 hover:bg-slate-600 rounded transition text-blue-400"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
            <p>No transactions found</p>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {showModal && selectedTx && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="admin-card w-full max-w-lg">
            <h2 className="text-xl font-bold text-white mb-4">Transaction Details</h2>
            
            <div className="space-y-4 mb-6 bg-slate-800 p-4 rounded">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-xs">Type</p>
                  <p className="text-white capitalize font-semibold">{selectedTx.type}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Status</p>
                  <p className={`font-semibold capitalize ${
                    selectedTx.status === 'confirmed' ? 'text-green-400' :
                    selectedTx.status === 'pending' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {selectedTx.status}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Amount</p>
                  <p className="text-white font-semibold">{selectedTx.amount} MTK</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Gas Cost</p>
                  <p className="text-white font-semibold">${selectedTx.gasCostInUSD || '0.00'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <p className="text-slate-400 text-xs mb-1">TX Hash</p>
                <p className="text-white font-mono text-xs break-all">{selectedTx.txHash || 'N/A'}</p>
              </div>

              <div>
                <p className="text-slate-400 text-xs mb-1">Block Number</p>
                <p className="text-white font-semibold">{selectedTx.blockNumber || 'Pending'}</p>
              </div>

              <div>
                <p className="text-slate-400 text-xs mb-1">Confirmations</p>
                <p className="text-white font-semibold">{selectedTx.confirmations || 0}</p>
              </div>

              <div>
                <p className="text-slate-400 text-xs mb-1">Submitted At</p>
                <p className="text-white font-semibold">
                  {new Date(selectedTx.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary flex-1"
              >
                Close
              </button>
              {selectedTx.txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${selectedTx.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline flex-1"
                >
                  View on Etherscan →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}