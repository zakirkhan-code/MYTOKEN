import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Settings, Moon, Sun } from 'lucide-react';
import { useAuthStore, useUIStore } from '../../store';

export default function AdminNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { toggleDarkMode, darkMode } = useUIStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-admin-sidebar border-b border-slate-700 px-6 py-4 flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-blue-400">Admin Panel</h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-slate-700 rounded-lg transition">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Theme */}
        <button
          onClick={toggleDarkMode}
          className="p-2 hover:bg-slate-700 rounded-lg transition"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-700 rounded-lg transition"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="hidden md:inline text-sm font-medium">{user?.email}</span>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-admin-sidebar rounded-lg shadow-lg z-50 border border-slate-700">
              <button
                onClick={() => setShowDropdown(false)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 border-b border-slate-700"
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-900 text-red-400"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}