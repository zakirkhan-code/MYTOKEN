// pages/Transactions.jsx - Beautiful Transactions Page with Filters
import React, { useEffect, useState } from 'react';
import { Download, Filter, Search, ArrowUpRight, ArrowDownLeft, Calendar, TrendingUp } from 'lucide-react';
import userService from '../services/userService';
import { toast } from 'react-toastify';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [page, type, status]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await userService.getTransactions(page, 20, type || null, status || null);
      setTransactions(response.transactions || []);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await userService.exportTransactions(null, null);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      toast.success('Transactions exported!');
    } catch (error) {
      toast.error('Failed to export transactions');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getTypeIcon = (type) => {
    return type === 'stake' || type === 'unstake' ? (
      <ArrowUpRight className="text-blue-400" size={20} />
    ) : type === 'claim' ? (
      <TrendingUp className="text-green-400" size={20} />
    ) : (
      <ArrowDownLeft className="text-orange-400" size={20} />
    );
  };

  const filteredTransactions = transactions.filter(tx =>
    tx.txHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.amount?.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center py-8 px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-4 animate-pulse">
            <TrendingUp size={32} className="text-white" />
          </div>
          <p className="text-slate-400 text-lg">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ===================================================================== */
        {/* HEADER */
        {/* ===================================================================== */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent">
              Transactions
            </h1>
            <p className="text-slate-400">View all your staking transactions and activity</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all font-semibold"
          >
            <Download size={20} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* ===================================================================== */
        {/* FILTERS & SEARCH */
        {/* ===================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search by hash or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">All Types</option>
            <option value="stake">Stake</option>
            <option value="unstake">Unstake</option>
            <option value="claim">Claim Rewards</option>
            <option value="transfer">Transfer</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* ===================================================================== */
        {/* TRANSACTIONS TABLE / LIST */
        {/* ===================================================================== */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-16">
              <TrendingUp size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-slate-400 text-lg mb-2">No transactions found</p>
              <p className="text-slate-500 text-sm">Start staking to see your transaction history here</p>
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50 border-b border-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Hash</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-slate-700/30 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                              {getTypeIcon(tx.type)}
                            </div>
                            <span className="font-semibold capitalize text-slate-200">{tx.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-100">{tx.amount?.toLocaleString()} MTK</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(tx.status)}`}>
                            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-xs text-slate-400 font-mono bg-slate-700/30 px-2 py-1 rounded">
                            {tx.txHash?.substring(0, 12)}...
                          </code>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-sm">
                          {new Date(tx.submittedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden space-y-4 p-4">
                {filteredTransactions.map((tx) => (
                  <div key={tx._id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-600/50 flex items-center justify-center">
                          {getTypeIcon(tx.type)}
                        </div>
                        <div>
                          <p className="font-semibold capitalize text-slate-200">{tx.type}</p>
                          <p className="text-xs text-slate-500">{new Date(tx.submittedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(tx.status)}`}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-600/30">
                      <span className="text-slate-400 text-sm">Amount:</span>
                      <span className="font-bold text-slate-100">{tx.amount?.toLocaleString()} MTK</span>
                    </div>
                    <code className="text-xs text-slate-500 font-mono mt-2 block overflow-x-auto">
                      Hash: {tx.txHash?.substring(0, 20)}...
                    </code>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ===================================================================== */
        {/* PAGINATION */
        {/* ===================================================================== */}
        {filteredTransactions.length > 0 && (
          <div className="flex justify-between items-center mt-8 px-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-6 py-3 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            >
              ← Previous
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Page</span>
              <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-bold">
                {page}
              </span>
            </div>
            <button
              onClick={() => setPage(page + 1)}
              disabled={filteredTransactions.length < 20}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}