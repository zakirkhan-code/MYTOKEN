import React from 'react';
import { Outlet } from 'react-router-dom';
import UserNavbar from './UserNavbar';
import UserSidebar from './UserSidebar';
import { useUIStore } from '../../store';

export default function UserLayout() {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <UserSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <UserNavbar />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}