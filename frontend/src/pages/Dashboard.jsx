// pages/Dashboard/Dashboard.jsx - Main Dashboard
import { Outlet, Link } from 'react-router-dom';
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Send, TrendingUp, Wallet, LogOut } from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';
import Card from '../../components/Card';
import Button from '../../components/Button';

const Dashboard = () => {
  const { user, logout } = useAuthStore();

  // Mock chart data
  const stakingData = [
    { month: 'Jan', rewards: 10, staked: 100 },
    { month: 'Feb', rewards: 15, staked: 110 },
    { month: 'Mar', rewards: 20, staked: 120 },
    { month: 'Apr', rewards: 25, staked: 130 },
    { month: 'May', rewards: 30, staked: 140 },
    { month: 'Jun', rewards: 35, staked: 150 }
  ];

  const recentTransactions = [
    { id: 1, type: 'Stake', amount: '500 MTK', date: '2 hours ago', status: 'Confirmed' },
    { id: 2, type: 'Claim', amount: '25.50 MTK', date: '1 day ago', status: 'Confirmed' },
    { id: 3, type: 'Transfer', amount: '100 MTK', date: '3 days ago', status: 'Confirmed' }
  ];

  return (
    <div className="space-y-8">
      {/* Header with User Info */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Welcome back, {user?.profile?.firstName || user?.email}! 👋
          </h1>
          <p className="text-gray-600 mt-2">Here's your staking overview</p>
        </div>
        <Button 
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Wallet, label: 'Total Balance', value: '1,500 MTK', color: 'blue' },
          { icon: Activity, label: 'Active Stakes', value: '3', color: 'green' },
          { icon: TrendingUp, label: 'Total Earned', value: '125.75 MTK', color: 'purple' },
          { icon: Send, label: 'Monthly Rewards', value: '35 MTK', color: 'amber' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'from-blue-50 to-blue-100 text-blue-600',
            green: 'from-green-50 to-green-100 text-green-600',
            purple: 'from-purple-50 to-purple-100 text-purple-600',
            amber: 'from-amber-50 to-amber-100 text-amber-600'
          };

          return (
            <Card key={idx} className={`bg-gradient-to-br ${colorClasses[stat.color]}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-700 font-semibold">{stat.label}</h3>
                  <Icon size={24} className={`text-${stat.color}-600`} />
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staking Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Staking & Rewards</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stakingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="rewards" stroke="#8b5cf6" strokeWidth={2} />
              <Line type="monotone" dataKey="staked" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Transactions */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
            <Link to="/dashboard/transactions" className="text-indigo-600 hover:underline text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentTransactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800">{tx.type}</p>
                  <p className="text-sm text-gray-600">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{tx.amount}</p>
                  <p className="text-sm text-green-600">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/staking/stake">
            <Button className="w-full bg-white text-indigo-600 hover:bg-gray-100">
              Start Staking
            </Button>
          </Link>
          <Link to="/staking/claim">
            <Button className="w-full bg-white text-indigo-600 hover:bg-gray-100">
              Claim Rewards
            </Button>
          </Link>
          <Link to="/profile">
            <Button className="w-full bg-white text-indigo-600 hover:bg-gray-100">
              View Profile
            </Button>
          </Link>
        </div>
      </Card>

      {/* Outlet for nested routes */}
      <Outlet />
    </div>
  );
};

export default Dashboard;