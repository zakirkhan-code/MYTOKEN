import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  History,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  X,
} from 'lucide-react';
import { useUIStore, useAuthStore } from '../../store';

export default function UserSidebar() {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { logout } = useAuthStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Zap, label: 'Staking', path: '/staking' },
    { icon: History, label: 'History', path: '/history' },
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  ];

  const settingsItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: Wallet, label: 'Security', path: '/security' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative md:translate-x-0 left-0 top-0 h-full w-64 bg-white shadow-lg z-50 transition-transform duration-300 flex flex-col overflow-y-auto`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              MT
            </div>
            <span className="text-xl font-bold text-gray-900">MyToken</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden p-1 hover:bg-gray-100 rounded transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {/* Main Menu */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">
              Main
            </p>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 768 && toggleSidebar()}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} />
                <span className="flex-1">{item.label}</span>
                {isActive(item.path) && <ChevronRight size={16} />}
              </Link>
            ))}
          </div>

          {/* Settings */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">
              Settings
            </p>
            {settingsItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 768 && toggleSidebar()}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} />
                <span className="flex-1">{item.label}</span>
                {isActive(item.path) && <ChevronRight size={16} />}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}