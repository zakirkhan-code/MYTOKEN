// components/Navigation.jsx - Beautiful Navigation Component with Modern UI
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, LogOut, Home, User, Wallet, Activity, Settings, 
  Bell, Search, ChevronDown, Zap
} from 'lucide-react';
import authService from '../services/authService';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isLoggedIn = authService.isAuthenticated();
  const user = authService.getStoredUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
    setIsOpen(false);
    setIsProfileOpen(false);
  };

  // Navigation links for authenticated users
  const authenticatedLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/staking', label: 'Staking', icon: Wallet },
    { path: '/transactions', label: 'Transactions', icon: Activity },
  ];

  // Check if link is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ===================================================================== */
          {/* LOGO SECTION */
          {/* ===================================================================== */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                M
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white">MyToken</h1>
              <p className="text-xs text-blue-400">Staking Platform</p>
            </div>
          </Link>

          {/* ===================================================================== */
          {/* DESKTOP NAVIGATION */
          {/* ===================================================================== */}
          {isLoggedIn ? (
            <div className="hidden md:flex items-center space-x-1">
              {authenticatedLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive(path)
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
              >
                Register
              </Link>
            </div>
          )}

          {/* ===================================================================== */
          {/* RIGHT SECTION - ICONS & PROFILE */
          {/* ===================================================================== */}
          <div className="flex items-center space-x-4">
            {isLoggedIn && (
              <>
                {/* Notifications */}
                <button className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-300">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <ChevronDown size={16} />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 overflow-hidden backdrop-blur-xl">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
                        <p className="text-white font-semibold truncate">{user?.email}</p>
                        <p className="text-xs text-slate-400 mt-1">Account verified ✓</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center space-x-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User size={18} />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center space-x-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Settings size={18} />
                          <span>Settings</span>
                        </Link>
                        <button className="w-full flex items-center space-x-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200">
                          <Zap size={18} />
                          <span>Referral</span>
                        </button>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-slate-700 py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                        >
                          <LogOut size={18} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-300"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */
      {/* MOBILE MENU */
      {/* ===================================================================== */}
      {isOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 backdrop-blur-xl">
          <div className="px-2 pt-2 pb-3 space-y-2">
            {isLoggedIn ? (
              <>
                {/* User Info in Mobile */}
                <div className="px-4 py-3 bg-slate-700/50 rounded-lg border border-slate-600 mb-2">
                  <p className="text-white font-semibold text-sm truncate">{user?.email}</p>
                </div>

                {/* Mobile Navigation Links */}
                {authenticatedLinks.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive(path)
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{label}</span>
                  </Link>
                ))}

                {/* Settings in Mobile */}
                <Link
                  to="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-300"
                >
                  <Settings size={20} />
                  <span className="font-medium">Settings</span>
                </Link>

                {/* Logout in Mobile */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-300 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-center hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}