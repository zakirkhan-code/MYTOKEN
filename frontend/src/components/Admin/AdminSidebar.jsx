import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  FileText,
  BarChart3,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store';

export default function AdminSidebar() {
  const location = useLocation();
  const { logout } = useAuthStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: CreditCard, label: 'Transactions', path: '/admin/transactions' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: FileText, label: 'Reports', path: '/admin/reports' },
  ];

  const settingsItems = [
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
    { icon: Shield, label: 'Security', path: '/admin/security' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-admin-sidebar border-r border-slate-700 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            AD
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">MyToken</h1>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Main Menu */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-3">
            Management
          </p>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all admin-sidebar-item ${
                isActive(item.path)
                  ? 'admin-sidebar-item active'
                  : ''
              }`}
            >
              <item.icon size={20} />
              <span className="flex-1">{item.label}</span>
              {isActive(item.path) && <ChevronRight size={16} />}
            </Link>
          ))}
        </div>

        {/* Settings */}
        <div className="pt-4 border-t border-slate-700">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-3">
            Settings
          </p>
          {settingsItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all admin-sidebar-item ${
                isActive(item.path)
                  ? 'admin-sidebar-item active'
                  : ''
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
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900 rounded-lg transition font-medium"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}