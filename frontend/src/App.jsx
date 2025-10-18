// App.jsx - Main Application with Routing and Protected Routes
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Navigation
import Navigation from './components/Navigation';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import Staking from './pages/Staking';

// Services
import authService from './services/authService';

// ============================================================================
// PROTECTED ROUTE COMPONENT
// ============================================================================
function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// ============================================================================
// PUBLIC ROUTE COMPONENT (Redirect if already logged in)
// ============================================================================
function PublicRoute({ children }) {
  if (authService.isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* ===================================================================== */
        {/* NAVIGATION BAR */
        {/* ===================================================================== */}
        <Navigation />

        {/* ===================================================================== */
        {/* MAIN CONTENT */
        {/* ===================================================================== */}
        <main>
          <Routes>
            {/* ============================================================== */
            {/* PUBLIC ROUTES */
            {/* ============================================================== */}
            
            <Route path="/" element={<Home />} />
            
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* ============================================================== */
            {/* PROTECTED ROUTES (Logged in users only) */
            {/* ============================================================== */}
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/staking"
              element={
                <ProtectedRoute>
                  <Staking />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* ============================================================== */
            {/* 404 CATCH ALL */
            {/* ============================================================== */}
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* ===================================================================== */
        {/* TOAST NOTIFICATIONS */
        {/* ===================================================================== */}
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          style={{
            '--toastify-color-light': '#1e293b',
            '--toastify-text-color-light': '#f1f5f9',
          }}
        />
      </div>
    </Router>
  );
}