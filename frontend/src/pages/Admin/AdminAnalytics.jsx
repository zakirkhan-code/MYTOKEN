import React, { useState } from 'react';
import { BarChart3, TrendingUp, PieChart, Calendar, Download, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as PieChartComponent, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('7days');

  // Mock data
  const chartData = [
    { date: 'Mon', users: 45, transactions: 32, revenue: 1200 },
    { date: 'Tue', users: 52, transactions: 38, revenue: 1500 },
    { date: 'Wed', users: 48, transactions: 35, revenue: 1350 },
    { date: 'Thu', users: 61, transactions: 42, revenue: 1800 },
    { date: 'Fri', users: 55, transactions: 45, revenue: 1650 },
    { date: 'Sat', users: 67, transactions: 50, revenue: 2100 },
    { date: 'Sun', users: 70, transactions: 48, revenue: 1950 }
  ];

  const transactionTypes = [
    { name: 'Stake', value: 35, color: '#3b82f6' },
    { name: 'Unstake', value: 20, color: '#8b5cf6' },
    { name: 'Claim', value: 30, color: '#10b981' },
    { name: 'Transfer', value: 10, color: '#f59e0b' },
    { name: 'Approve', value: 5, color: '#ef4444' }
  ];

  const userGrowth = [
    { month: 'Jan', users: 100, verified: 85 },
    { month: 'Feb', users: 150, verified: 125 },
    { month: 'Mar', users: 220, verified: 180 },
    { month: 'Apr', users: 280, verified: 240 },
    { month: 'May', users: 350, verified: 310 },
    { month: 'Jun', users: 420, verified: 385 }
  ];

  const stakingMetrics = [
    { name: 'Total Staked', value: '50,000', change: '+12%', color: 'text-blue-400' },
    { name: 'Total Rewards', value: '5,000', change: '+8%', color: 'text-green-400' },
    { name: 'Avg Stake', value: '500', change: '+5%', color: 'text-purple-400' },
    { name: 'Pool Health', value: '98%', change: '+2%', color: 'text-yellow-400' }
  ];

  const handleExport = () => {
    toast.success('✅ Analytics exported');
  };

  return (
    <div className="p-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-blue-400" size={32} />
            Analytics & Reports
          </h1>
          <p className="text-slate-400 mt-2">Platform performance and insights</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="btn bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Download size={18} /> Export Report
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="admin-card">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-blue-400" size={20} />
          <h3 className="font-semibold text-white">Time Range</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: '7days', label: '7 Days' },
            { value: '30days', label: '30 Days' },
            { value: '90days', label: '90 Days' },
            { value: '1year', label: '1 Year' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTimeRange(value)}
              className={`p-3 rounded-lg font-medium transition ${
                timeRange === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stakingMetrics.map((metric, idx) => (
          <div key={idx} className="admin-card">
            <p className="text-slate-400 text-sm">{metric.name}</p>
            <h3 className={`text-2xl font-bold mt-2 ${metric.color}`}>
              {metric.value}
            </h3>
            <p className="text-green-400 text-xs mt-2">{metric.change}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Trend */}
        <div className="admin-card">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="text-blue-400" size={24} />
            Activity Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="transactions" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction Types Distribution */}
        <div className="admin-card">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <PieChart className="text-green-400" size={24} />
            Transaction Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChartComponent>
              <Pie
                data={transactionTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {transactionTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
            </PieChartComponent>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue & User Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="admin-card">
          <h3 className="text-lg font-bold text-white mb-6">Daily Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth Chart */}
        <div className="admin-card">
          <h3 className="text-lg font-bold text-white mb-6">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
              <Bar dataKey="users" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="verified" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="admin-card">
        <h3 className="text-lg font-bold text-white mb-6">Detailed Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-slate-200 font-semibold">Metric</th>
                <th className="px-4 py-3 text-right text-slate-200 font-semibold">Current</th>
                <th className="px-4 py-3 text-right text-slate-200 font-semibold">Previous</th>
                <th className="px-4 py-3 text-right text-slate-200 font-semibold">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              <tr className="hover:bg-slate-800 transition">
                <td className="px-4 py-3 text-slate-300">Total Transactions</td>
                <td className="px-4 py-3 text-right text-white font-semibold">2,345</td>
                <td className="px-4 py-3 text-right text-slate-400">2,100</td>
                <td className="px-4 py-3 text-right text-green-400 font-semibold">+11.6%</td>
              </tr>
              <tr className="hover:bg-slate-800 transition">
                <td className="px-4 py-3 text-slate-300">Active Users</td>
                <td className="px-4 py-3 text-right text-white font-semibold">856</td>
                <td className="px-4 py-3 text-right text-slate-400">720</td>
                <td className="px-4 py-3 text-right text-green-400 font-semibold">+18.9%</td>
              </tr>
              <tr className="hover:bg-slate-800 transition">
                <td className="px-4 py-3 text-slate-300">Total Volume (MTK)</td>
                <td className="px-4 py-3 text-right text-white font-semibold">250,000</td>
                <td className="px-4 py-3 text-right text-slate-400">200,000</td>
                <td className="px-4 py-3 text-right text-green-400 font-semibold">+25%</td>
              </tr>
              <tr className="hover:bg-slate-800 transition">
                <td className="px-4 py-3 text-slate-300">Success Rate</td>
                <td className="px-4 py-3 text-right text-white font-semibold">98.5%</td>
                <td className="px-4 py-3 text-right text-slate-400">97.2%</td>
                <td className="px-4 py-3 text-right text-green-400 font-semibold">+1.3%</td>
              </tr>
              <tr className="hover:bg-slate-800 transition">
                <td className="px-4 py-3 text-slate-300">Avg Rewards/User</td>
                <td className="px-4 py-3 text-right text-white font-semibold">58.4 MTK</td>
                <td className="px-4 py-3 text-right text-slate-400">52.1 MTK</td>
                <td className="px-4 py-3 text-right text-green-400 font-semibold">+12.1%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="admin-card border-l-4 border-green-500 bg-gradient-to-r from-green-900/20 to-transparent">
          <h3 className="font-bold text-green-400 mb-3">📈 Positive Trends</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>✓ 18.9% increase in active users</li>
            <li>✓ Transaction volume up 25%</li>
            <li>✓ Success rate improved to 98.5%</li>
            <li>✓ User engagement up 22%</li>
          </ul>
        </div>

        <div className="admin-card border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-900/20 to-transparent">
          <h3 className="font-bold text-yellow-400 mb-3">⚠️ Areas to Watch</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• Peak hours: 2-4 PM EST</li>
            <li>• High gas fees during congestion</li>
            <li>• Some users report slow claims</li>
            <li>• API latency increased 5%</li>
          </ul>
        </div>
      </div>
    </div>
  );
}