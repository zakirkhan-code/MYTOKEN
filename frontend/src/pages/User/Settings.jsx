import React, { useState } from 'react';
import { Settings, Bell, Lock, Eye, EyeOff, Save, AlertCircle } from 'lucide-react';
import { userAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

export default function UserSettings() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    email: user?.email || '',
    username: user?.username || '',
    fullName: user?.fullName || '',
    language: 'en',
    timezone: 'UTC'
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailOnRewards: true,
    emailOnTransaction: true,
    emailOnSecurity: true,
    pushNotifications: true,
    weeklyDigest: true
  });

  // Password Settings
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false
  });

  const handleSaveGeneral = async () => {
    try {
      setLoading(true);
      await userAPI.updateProfile(generalSettings);
      toast.success('✅ Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      await userAPI.updateSettings(notifications);
      toast.success('✅ Notification settings updated!');
    } catch (error) {
      toast.error('Failed to update notification settings');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      await userAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      toast.success('✅ Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrent: false,
        showNew: false,
        showConfirm: false
      });
    } catch (error) {
      toast.error('Failed to change password');
      console.error('Password change error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('⚠️ Are you sure you want to delete your account? This cannot be undone!')) {
      return;
    }

    try {
      setLoading(true);
      await userAPI.deleteAccount({ password: prompt('Enter your password to confirm:') });
      logout();
      toast.success('Account deleted successfully');
      window.location.href = '/login';
    } catch (error) {
      toast.error('Failed to delete account');
      console.error('Delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account preferences and settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'general', label: 'General' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'password', label: 'Password' },
          { id: 'privacy', label: 'Privacy & Security' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 px-4 font-medium transition border-b-2 ${
              activeTab === tab.id
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="card space-y-6">
          <h2 className="text-xl font-bold text-gray-900">General Settings</h2>

          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              value={generalSettings.email}
              onChange={(e) => setGeneralSettings({ ...generalSettings, email: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Username</label>
            <input
              type="text"
              value={generalSettings.username}
              onChange={(e) => setGeneralSettings({ ...generalSettings, username: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              value={generalSettings.fullName}
              onChange={(e) => setGeneralSettings({ ...generalSettings, fullName: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Language</label>
            <select
              value={generalSettings.language}
              onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
              className="input"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ur">اردو</option>
            </select>
          </div>

          <div>
            <label className="label">Timezone</label>
            <select
              value={generalSettings.timezone}
              onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
              className="input"
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time (EST)</option>
              <option value="CST">Central Time (CST)</option>
              <option value="MST">Mountain Time (MST)</option>
              <option value="PST">Pacific Time (PST)</option>
              <option value="GMT">GMT (UK)</option>
              <option value="IST">IST (India)</option>
            </select>
          </div>

          <button
            onClick={handleSaveGeneral}
            disabled={loading}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save size={18} /> Save Changes
          </button>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="card space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>

          <div className="space-y-4">
            {[
              { key: 'emailOnRewards', label: 'Email on Rewards', desc: 'Get notified when you earn rewards' },
              { key: 'emailOnTransaction', label: 'Email on Transactions', desc: 'Get notified of transaction status' },
              { key: 'emailOnSecurity', label: 'Security Alerts', desc: 'Important security notifications' },
              { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications' },
              { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your weekly activity' }
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{label}</p>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications[key]}
                    onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                </label>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveNotifications}
            disabled={loading}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save size={18} /> Save Preferences
          </button>
        </div>
      )}

      {/* Password */}
      {activeTab === 'password' && (
        <div className="card space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Change Password</h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <input
                  type={passwordForm.showCurrent ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="input"
                />
                <button
                  type="button"
                  onClick={() => setPasswordForm({ ...passwordForm, showCurrent: !passwordForm.showCurrent })}
                  className="absolute right-3 top-3"
                >
                  {passwordForm.showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input
                  type={passwordForm.showNew ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="input"
                />
                <button
                  type="button"
                  onClick={() => setPasswordForm({ ...passwordForm, showNew: !passwordForm.showNew })}
                  className="absolute right-3 top-3"
                >
                  {passwordForm.showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <input
                  type={passwordForm.showConfirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="input"
                />
                <button
                  type="button"
                  onClick={() => setPasswordForm({ ...passwordForm, showConfirm: !passwordForm.showConfirm })}
                  className="absolute right-3 top-3"
                >
                  {passwordForm.showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center gap-2"
            >
              <Lock size={18} /> Update Password
            </button>
          </form>
        </div>
      )}

      {/* Privacy & Security */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          {/* 2FA */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="text-blue-600" size={24} />
              Two-Factor Authentication
            </h3>
            <p className="text-gray-600 mb-4">Add an extra layer of security to your account</p>
            <button className="btn btn-outline">Enable 2FA</button>
          </div>

          {/* API Keys */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">API Keys</h3>
            <p className="text-gray-600 mb-4">Manage your API keys for integrations</p>
            <button className="btn btn-outline">Manage API Keys</button>
          </div>

          {/* Danger Zone */}
          <div className="card border-2 border-red-200 bg-red-50">
            <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
              <AlertCircle className="text-red-600" size={24} />
              Danger Zone
            </h3>
            <p className="text-red-800 mb-4">Irreversible actions - use with caution</p>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="btn bg-red-600 text-white hover:bg-red-700"
            >
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}