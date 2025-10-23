import React, { useEffect, useState } from 'react';
import { Users, Search, Filter, ChevronDown, Ban, CheckCircle, Mail, Eye, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useAdminStore } from '../../store';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const { users, setUsers, setIsLoading } = useAdminStore();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const pageLimit = pageSize;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers(
        currentPage,
        pageLimit,
        filterRole !== 'all' ? filterRole : undefined,
        filterStatus !== 'all' ? filterStatus === 'active' : undefined,
        filterStatus === 'banned' ? true : undefined,
        searchTerm || undefined
      );
      
      if (response.data?.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId, isBanned) => {
    try {
      setLoading(true);
      await adminAPI.banUser(userId, {
        isBanned: !isBanned,
        banReason: !isBanned ? 'Banned by admin' : undefined
      });
      toast.success(`✅ User ${!isBanned ? 'banned' : 'unbanned'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      setLoading(true);
      await adminAPI.changeUserRole(userId, { role: newRole });
      toast.success(`✅ Role changed to ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to change role');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleOpenModal = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setShowModal(true);
  };

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Users className="text-blue-400" size={32} />
            User Management
          </h1>
          <p className="text-slate-400 mt-2">Manage platform users and permissions</p>
        </div>
        <button
          onClick={fetchUsers}
          className="p-2 hover:bg-slate-700 rounded-lg transition"
        >
          <RefreshCw size={20} className="text-blue-400" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card">
          <p className="text-slate-400 text-sm">Total Users</p>
          <h3 className="text-2xl font-bold text-white mt-1">{users.length}</h3>
        </div>
        <div className="admin-card">
          <p className="text-slate-400 text-sm">Active Users</p>
          <h3 className="text-2xl font-bold text-green-400 mt-1">
            {users.filter(u => u.isActive && !u.isBanned).length}
          </h3>
        </div>
        <div className="admin-card">
          <p className="text-slate-400 text-sm">Banned Users</p>
          <h3 className="text-2xl font-bold text-red-400 mt-1">
            {users.filter(u => u.isBanned).length}
          </h3>
        </div>
        <div className="admin-card">
          <p className="text-slate-400 text-sm">Email Verified</p>
          <h3 className="text-2xl font-bold text-blue-400 mt-1">
            {users.filter(u => u.emailVerified).length}
          </h3>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="label text-white mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Email or username"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="input pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label className="label text-white mb-2">Role</label>
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setCurrentPage(1);
              }}
              className="input bg-slate-800 border-slate-700 text-white"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="label text-white mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="input bg-slate-800 border-slate-700 text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner w-12 h-12"></div>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Username</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Role</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-200">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-200">Verified</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-700 transition">
                    <td className="px-6 py-4 text-sm text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{user.username || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user._id, e.target.value)}
                        className="px-2 py-1 rounded text-xs bg-slate-800 border border-slate-600 text-white capitalize"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isBanned
                          ? 'bg-red-900 text-red-200'
                          : user.isActive
                          ? 'bg-green-900 text-green-200'
                          : 'bg-yellow-900 text-yellow-200'
                      }`}>
                        {user.isBanned ? 'Banned' : user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.emailVerified ? (
                        <CheckCircle className="text-green-400 mx-auto" size={18} />
                      ) : (
                        <span className="text-slate-500 text-xs">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(user, 'view')}
                          className="p-2 hover:bg-slate-600 rounded transition text-blue-400"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleBanUser(user._id, user.isBanned)}
                          className={`p-2 hover:bg-slate-600 rounded transition ${
                            user.isBanned ? 'text-green-400' : 'text-red-400'
                          }`}
                          title={user.isBanned ? 'Unban user' : 'Ban user'}
                        >
                          <Ban size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>No users found</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="admin-card w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">User Details</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-slate-400 text-sm">Email</p>
                <p className="text-white font-mono">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Username</p>
                <p className="text-white">{selectedUser.username || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Role</p>
                <p className="text-white capitalize">{selectedUser.role}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Account Age</p>
                <p className="text-white">
                  {Math.floor((Date.now() - new Date(selectedUser.createdAt)) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Status</p>
                <div className="flex gap-2 mt-1">
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedUser.isBanned ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'
                  }`}>
                    {selectedUser.isBanned ? 'Banned' : 'Active'}
                  </span>
                  {selectedUser.emailVerified && (
                    <span className="px-2 py-1 rounded text-xs bg-blue-900 text-blue-200">
                      Email Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-ghost flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}