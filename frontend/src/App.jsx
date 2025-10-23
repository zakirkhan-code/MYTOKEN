import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store';
import { initializeRealtimeSync } from './services/realtimeSync';

// Components
import { ProtectedRoute, AdminRoute, UserRoute } from './components/ProtectedRoute';
import UserLayout from './components/User/UserLayout';
import AdminLayout from './components/Admin/AdminLayout';

// Pages - Public
import Login from './pages/Login';
import Register from './pages/Register';

// Pages - User Panel
import UserDashboard from './pages/User/Dashboard';
import UserStaking from './pages/User/Staking';
import UserHistory from './pages/User/History';
import UserWallet from './pages/User/Wallet';
import UserAnalytics from './pages/User/Analytics';
import UserSettings from './pages/User/Settings';
import UserSecurity from './pages/User/Security';
import UserProfile from './pages/User/Profile';

// Pages - Admin Panel
import AdminDashboard from './pages/Admin/Dashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminTransactions from './pages/Admin/AdminTransactions';
import AdminAnalytics from './pages/Admin/AdminAnalytics';
import AdminReports from './pages/Admin/AdminReports';
import AdminSettings from './pages/Admin/AdminSettings';
import AdminSecurity from './pages/Admin/AdminSecurity';

export default function App() {
  const { token, user } = useAuthStore();

  useEffect(() => {
    // Initialize real-time updates when user is authenticated
    if (token && user) {
      console.log('🔄 Initializing real-time sync...');
      initializeRealtimeSync();
    }
  }, [token, user]);

  return (
    <Router>
      <Toaster position="top-right" />
      
      <Routes>
        {/* ========== PUBLIC ROUTES ========== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<div className="text-center p-8">Coming soon</div>} />

        {/* ========== USER ROUTES ========== */}
        <Route
          element={
            <UserRoute>
              <UserLayout />
            </UserRoute>
          }
        >
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/staking" element={<UserStaking />} />
          <Route path="/history" element={<UserHistory />} />
          <Route path="/wallet" element={<UserWallet />} />
          <Route path="/analytics" element={<UserAnalytics />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/security" element={<UserSecurity />} />
          <Route path="/profile" element={<UserProfile />} />
        </Route>

        {/* ========== ADMIN ROUTES ========== */}
        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/security" element={<AdminSecurity />} />
        </Route>

        {/* ========== FALLBACK ROUTES ========== */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}