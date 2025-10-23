import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, Settings, Bell, Moon, Sun } from 'lucide-react';
import { useAuthStore, useUIStore } from '../../store';

export default function UserNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { toggleSidebar, toggleDarkMode, darkMode } = useUIStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-2xl font-bold text-blue-600">MyToken</h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline text-sm font-medium">{user?.email}</span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 animate-fadeIn">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b"
                  onClick={() => setShowDropdown(false)}
                >
                  <User size={18} />
                  <span>Profile</span>
                </Link>

                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b"
                  onClick={() => setShowDropdown(false)}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-red-600"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}