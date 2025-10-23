import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { stakingAPI, transactionAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days'); // 7days, 30days, 90days, 1year
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    totalRewards: 0,
    totalTransactions: 0,
    averageStake: 0,
    maxStake: 0
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Generate mock data based on time range
      const data = generateChartData(timeRange);
      setChartData(data);

      // Fetch real stats
      const [stakingStats, txStats] = await Promise.all([
        stakingAPI.getStats(),
        transactionAPI.getStats()
      ]);

      setStats({
        totalRewards: stakingStats.data?.stats?.totalEarned || 0,
        totalTransactions: txStats.data?.stats?.total || 0,
        averageStake: stakingStats.data?.stats?.averageStake || 0,
        maxStake: stakingStats.data?.stats?.maxStake || 0
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (range) => {
    const data = [];
    let days = 7;

    if (range === '30days') days = 30;
    if (range === '90days') days = 90;
    if (range === '1year') days = 365;

    const today = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        stake: Math.floor(Math.random() * 5000) + 1000,
        rewards: Math.floor(Math.random() * 500) + 50,
        transactions: Math.floor(Math.random() * 10) + 1
      });
    }

    return data;
  };

  const handleExport = () => {
    try {
      const csv = [
        ['Date', 'Stake', 'Rewards', 'Transactions'],
        ...chartData.map(row => [row.date, row.stake, row.rewards, row.transactions])
      ]
        .map(row => row.join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('✅ Analytics exported successfully!');
    } catch (error) {
      toast.error('Failed to export analytics');
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Your staking performance and statistics</p>
        </div>
        <button
          onClick={handleExport}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Download size={18} /> Export Report
        </button>
      </div>

      {/* Time Range Selector */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={20} className="text-blue-600" />
          <h3 className="font-semibold text-gray-900">Time Range</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: '7days', label: 'Last 7 Days' },
            { value: '30days', label: 'Last 30 Days' },
            { value: '90days', label: 'Last 90 Days' },
            { value: '1year', label: 'Last Year' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTimeRange(value)}
              className={`p-3 rounded-lg font-medium transition ${
                timeRange === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <p className="text-gray-600 text-sm">Total Rewards Earned</p>
          <h3 className="text-3xl font-bold text-green-600 mt-2">{stats.totalRewards}</h3>
          <p className="text-xs text-gray-500 mt-2">MTK</p>
        </div>

        <div className="card">
          <p className="text-gray-600 text-sm">Total Transactions</p>
          <h3 className="text-3xl font-bold text-blue-600 mt-2">{stats.totalTransactions}</h3>
          <p className="text-xs text-gray-500 mt-2">All time</p>
        </div>

        <div className="card">
          <p className="text-gray-600 text-sm">Average Stake</p>
          <h3 className="text-3xl font-bold text-purple-600 mt-2">{stats.averageStake}</h3>
          <p className="text-xs text-gray-500 mt-2">MTK</p>
        </div>

        <div className="card">
          <p className="text-gray-600 text-sm">Maximum Stake</p>
          <h3 className="text-3xl font-bold text-yellow-600 mt-2">{stats.maxStake}</h3>
          <p className="text-xs text-gray-500 mt-2">MTK</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stake & Rewards Trend */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={24} />
            Stake & Rewards Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="stake" 
                stroke="#007bff" 
                strokeWidth={2}
                dot={{ fill: '#007bff', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="rewards" 
                stroke="#28a745" 
                strokeWidth={2}
                dot={{ fill: '#28a745', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Transactions */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="text-green-600" size={24} />
            Daily Transactions
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="transactions" 
                fill="#6f42c1" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Detailed Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-gray-900 font-semibold">Metric</th>
                <th className="px-4 py-3 text-right text-gray-900 font-semibold">Value</th>
                <th className="px-4 py-3 text-right text-gray-900 font-semibold">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 font-medium">Total Staked</td>
                <td className="px-4 py-3 text-right text-gray-900 font-semibold">5,000 MTK</td>
                <td className="px-4 py-3 text-right">
                  <span className="text-green-600 font-semibold">+5%</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 font-medium">Total Rewards</td>
                <td className="px-4 py-3 text-right text-gray-900 font-semibold">500 MTK</td>
                <td className="px-4 py-3 text-right">
                  <span className="text-green-600 font-semibold">+12%</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 font-medium">Daily Average Rewards</td>
                <td className="px-4 py-3 text-right text-gray-900 font-semibold">13.7 MTK</td>
                <td className="px-4 py-3 text-right">
                  <span className="text-gray-500">—</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 font-medium">Success Rate</td>
                <td className="px-4 py-3 text-right text-gray-900 font-semibold">98.5%</td>
                <td className="px-4 py-3 text-right">
                  <span className="text-green-600 font-semibold">+0.5%</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 font-medium">Total Transactions</td>
                <td className="px-4 py-3 text-right text-gray-900 font-semibold">245</td>
                <td className="px-4 py-3 text-right">
                  <span className="text-green-600 font-semibold">+23</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card border-l-4 border-green-600 bg-green-50">
          <h4 className="font-bold text-green-900 mb-3">📈 Positive Trends</h4>
          <ul className="space-y-2 text-sm text-green-800">
            <li>✓ Rewards are consistently growing</li>
            <li>✓ High transaction success rate (98.5%)</li>
            <li>✓ Staking participation increased 5%</li>
          </ul>
        </div>

        <div className="card border-l-4 border-blue-600 bg-blue-50">
          <h4 className="font-bold text-blue-900 mb-3">💡 Recommendations</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Consider increasing stake for better rewards</li>
            <li>• Compound rewards daily for growth</li>
            <li>• Monitor gas fees during peak hours</li>
          </ul>
        </div>
      </div>
    </div>
  );
}