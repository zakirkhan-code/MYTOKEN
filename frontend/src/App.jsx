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

// Pages - Admin Panel
import AdminDashboard from './pages/Admin/Dashboard';

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
          <Route path="/staking" element={<div className="p-8">Staking Page Coming Soon</div>} />
          <Route path="/history" element={<div className="p-8">History Page Coming Soon</div>} />
          <Route path="/wallet" element={<div className="p-8">Wallet Page Coming Soon</div>} />
          <Route path="/analytics" element={<div className="p-8">Analytics Page Coming Soon</div>} />
          <Route path="/settings" element={<div className="p-8">Settings Page Coming Soon</div>} />
          <Route path="/security" element={<div className="p-8">Security Page Coming Soon</div>} />
          <Route path="/profile" element={<div className="p-8">Profile Page Coming Soon</div>} />
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
          <Route path="/admin/users" element={<div className="p-8 text-white">Users Management Coming Soon</div>} />
          <Route path="/admin/transactions" element={<div className="p-8 text-white">Transactions Management Coming Soon</div>} />
          <Route path="/admin/analytics" element={<div className="p-8 text-white">Analytics Coming Soon</div>} />
          <Route path="/admin/reports" element={<div className="p-8 text-white">Reports Coming Soon</div>} />
          <Route path="/admin/settings" element={<div className="p-8 text-white">Settings Coming Soon</div>} />
          <Route path="/admin/security" element={<div className="p-8 text-white">Security Coming Soon</div>} />
        </Route>

        {/* ========== FALLBACK ROUTES ========== */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}