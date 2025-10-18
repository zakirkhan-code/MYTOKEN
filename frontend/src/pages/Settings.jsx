// pages/Settings.jsx - Beautiful Settings Page
import React, { useEffect, useState } from 'react';
import { Bell, Moon, Globe, Lock, Trash2, LogOut, AlertCircle, CheckCircle, Toggle2, Save } from 'lucide-react';
import userService from '../services/userService';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    marketingEmails: false,
    theme: 'dark',
    language: 'en',
    twoFA: false,
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await userService.getNotificationPreferences();
      if (response.preferences) {
        setSettings(response.preferences);
      }
    } catch (error) {
      toast.error('Failed to load settings');
    }
  };

  const handleSettingChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setSaving(true);

    try {
      await userService.updateNotificationPreferences(newSettings);
      toast.success('Settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password');
      return;
    }

    try {
      await userService.deleteAccount(deletePassword);
      toast.success('Account deleted successfully');
      authService.logout();
      navigate('/');
    } catch (error) {
      toast.error(error?.message || 'Failed to delete account');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* ===================================================================== */
        {/* HEADER */
        {/* ===================================================================== */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-slate-400">Manage your preferences and account security</p>
        </div>

        {/* ===================================================================== */
        {/* NOTIFICATIONS SECTION */
        {/* ===================================================================== */}
        <div className="mb-6 p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <Bell size={24} className="text-blue-400" />
            </div>
            <span>Notifications</span>
          </h2>

          <div className="space-y-4">
            {/* Push Notifications */}
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:border-slate-600/50 transition-all">
              <div>
                <p className="font-semibold text-slate-200">Push Notifications</p>
                <p className="text-sm text-slate-400 mt-1">Receive push notifications on your browser</p>
              </div>
              <button
                onClick={() => handleSettingChange('notifications', !settings.notifications)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all ${
                  settings.notifications ? 'bg-blue-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                    settings.notifications ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:border-slate-600/50 transition-all">
              <div>
                <p className="font-semibold text-slate-200">Email Notifications</p>
                <p className="text-sm text-slate-400 mt-1">Receive important updates via email</p>
              </div>
              <button
                onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all ${
                  settings.emailNotifications ? 'bg-blue-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                    settings.emailNotifications ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Marketing Emails */}
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:border-slate-600/50 transition-all">
              <div>
                <p className="font-semibold text-slate-200">Marketing Emails</p>
                <p className="text-sm text-slate-400 mt-1">Receive promotional offers and updates</p>
              </div>
              <button
                onClick={() => handleSettingChange('marketingEmails', !settings.marketingEmails)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all ${
                  settings.marketingEmails ? 'bg-blue-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                    settings.marketingEmails ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================== */
        {/* APPEARANCE SECTION */
        {/* ===================================================================== */}
        <div className="mb-6 p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
              <Moon size={24} className="text-purple-400" />
            </div>
            <span>Appearance</span>
          </h2>

          <div className="space-y-4">
            {/* Theme */}
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <label className="block text-slate-200 font-semibold mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {['light', 'dark', 'auto'].map(theme => (
                  <button
                    key={theme}
                    onClick={() => handleSettingChange('theme', theme)}
                    className={`py-2 px-4 rounded-lg font-semibold transition-all capitalize ${
                      settings.theme === theme
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-600/50 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <label className="block text-slate-200 font-semibold mb-3 flex items-center space-x-2">
                <Globe size={18} />
                <span>Language</span>
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="w-full px-4 py-2 bg-slate-600/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="ur">Urdu (اردو)</option>
                <option value="es">Spanish (Español)</option>
                <option value="fr">French (Français)</option>
                <option value="de">German (Deutsch)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ===================================================================== */
        {/* SECURITY SECTION */
        {/* ===================================================================== */}
        <div className="mb-6 p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
              <Lock size={24} className="text-green-400" />
            </div>
            <span>Security</span>
          </h2>

          <div className="space-y-3">
            <button className="w-full p-4 text-left bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-lg hover:border-blue-500/50 transition-all text-slate-200 font-semibold flex items-center justify-between group">
              <span className="flex items-center space-x-2">
                <Lock size={18} />
                <span>Change Password</span>
              </span>
              <span className="text-blue-400 group-hover:translate-x-1 transition-transform">→</span>
            </button>

            <button className="w-full p-4 text-left bg-gradient-to-r from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-lg hover:border-purple-500/50 transition-all text-slate-200 font-semibold flex items-center justify-between group">
              <span className="flex items-center space-x-2">
                <CheckCircle size={18} />
                <span>Two-Factor Authentication</span>
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                settings.twoFA ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {settings.twoFA ? 'ENABLED' : 'DISABLED'}
              </span>
            </button>

            <button className="w-full p-4 text-left bg-gradient-to-r from-orange-600/20 to-orange-700/20 border border-orange-500/30 rounded-lg hover:border-orange-500/50 transition-all text-slate-200 font-semibold flex items-center justify-between group">
              <span className="flex items-center space-x-2">
                <AlertCircle size={18} />
                <span>View Login History</span>
              </span>
              <span className="text-orange-400 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>

        {/* ===================================================================== */
        {/* DANGER ZONE */
        {/* ===================================================================== */}
        <div className="p-6 bg-gradient-to-br from-red-950/30 to-red-900/30 rounded-2xl border border-red-700/50">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3 text-red-400">
            <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <span>Danger Zone</span>
          </h2>

          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="w-full p-4 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 hover:border-red-500 text-red-400 hover:text-red-300 rounded-lg font-bold transition-all flex items-center justify-center space-x-2"
            >
              <Trash2 size={20} />
              <span>Delete Account Permanently</span>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-300 font-semibold mb-2">⚠️ Warning!</p>
                <p className="text-red-200 text-sm">
                  This action CANNOT be undone. All your data will be permanently deleted, including:
                </p>
                <ul className="text-red-200 text-sm mt-2 space-y-1">
                  <li>✗ Account information</li>
                  <li>✗ Transaction history</li>
                  <li>✗ Staking records</li>
                  <li>✗ All settings</li>
                </ul>
              </div>

              <div>
                <label className="block text-red-300 font-semibold mb-2">Enter your password to confirm:</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-red-500/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setDeleteConfirm(false);
                    setDeletePassword('');
                  }}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all"
                >
                  Confirm Delete Account
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ===================================================================== */
        {/* FOOTER */
        {/* ===================================================================== */}
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 text-sm text-center">
          <p>💾 Your settings are automatically saved. Need help? Contact our support team.</p>
        </div>
      </div>
    </div>
  );
}