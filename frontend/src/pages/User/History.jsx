import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Download, Filter, Search, ChevronRight } from 'lucide-react';
import { transactionAPI } from '../../services/api';
import { useTransactionStore } from '../../store';
import { useRealtimePolling } from '../../hooks/useRealtimePolling';
import toast from 'react-hot-toast';

export default function History() {
  const { transactions, setTransactions, totalCount, setTotalCount, currentPage, setCurrentPage, pageSize } = useTransactionStore();
  const { refreshTransactions } = useRealtimePolling();
  
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTxs, setFilteredTxs] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, filterType, filterStatus, searchTerm]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getAllTransactions(
        currentPage,
        pageSize,
        filterType !== 'all' ? filterType : undefined,
        filterStatus !== 'all' ? filterStatus : undefined
      );

      if (response.data?.success) {
        setTransactions(response.data.data || []);
        setTotalCount(response.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(tx =>
        tx.hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(tx => tx.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(tx => tx.status === filterStatus);
    }

    setFilteredTxs(filtered);
  };

  const handleExport = () => {
    try {
      const csv = [
        ['Date', 'Type', 'Amount', 'Status', 'Hash'],
        ...transactions.map(tx => [
          new Date(tx.createdAt).toLocaleString(),
          tx.type,
          `${tx.amount} ${tx.symbol || 'MTK'}`,
          tx.status,
          tx.hash || 'N/A'
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

      toast.success('✅ Transactions exported successfully!');
    } catch (error) {
      toast.error('Failed to export transactions');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeIcon = (type) => {
    return type === 'stake' || type === 'unstake' ? (
      <ArrowDownLeft className="text-blue-600" size={20} />
    ) : (
      <ArrowUpRight className="text-green-600" size={20} />
    );
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-600 mt-2">View all your staking and reward transactions</p>
      </div>

      {/* Filters & Search */}
      <div className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="label">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Transaction hash or ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="label">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input"
            >
              <option value="all">All Types</option>
              <option value="stake">Stake</option>
              <option value="unstake">Unstake</option>
              <option value="claim">Claim</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="label">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Export Button */}
          <div className="flex items-end">
            <button
              onClick={handleExport}
              className="btn btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Download size={18} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-gray-600 text-sm">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalCount}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Confirmed</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {transactions.filter(t => t.status === 'confirmed').length}
          </p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">
            {transactions.filter(t => t.status === 'pending').length}
          </p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Failed</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {transactions.filter(t => t.status === 'failed').length}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner w-12 h-12"></div>
          </div>
        ) : filteredTxs.length > 0 ? (
          <div>
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTxs.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(tx.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(tx.type)}
                          <span className="font-semibold text-gray-900 capitalize">{tx.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        {tx.amount} {tx.symbol || 'MTK'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`badge ${getStatusBadgeColor(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                        {tx.hash ? tx.hash.substring(0, 16) + '...' : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3">
              {filteredTxs.map((tx) => (
                <div key={tx.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(tx.type)}
                      <div>
                        <p className="font-semibold text-gray-900 capitalize">{tx.type}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`badge ${getStatusBadgeColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold">{tx.amount} {tx.symbol || 'MTK'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hash:</span>
                      <span className="font-mono text-xs">{tx.hash ? tx.hash.substring(0, 12) + '...' : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2 border-t border-gray-200 pt-6">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-ghost disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = currentPage > 3 ? currentPage - 2 + i : i + 1;
                    return page <= totalPages ? (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded text-sm font-medium transition ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    ) : null;
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-ghost disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No transactions found</p>
            <p className="text-gray-400 text-sm mt-2">Start staking to see transactions here</p>
          </div>
        )}
      </div>
    </div>
  );
}