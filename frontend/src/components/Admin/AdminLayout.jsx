import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import { useUIStore } from '../../store';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-admin-dark text-white">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin Navbar */}
        <AdminNavbar />

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-admin-dark">
          <Outlet />
        </main>
      </div>
    </div>
  );
}