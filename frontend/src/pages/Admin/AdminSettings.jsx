import React, { useState } from 'react';
import { Settings, Save, Lock, Bell, Database, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'MyToken',
    platformEmail: 'admin@mytoken.com',
    maintenanceMode: false,
    maintenanceMessage: '',
    timezone: 'UTC'
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailOnNewUser: true,
    emailOnTransaction: true,
    emailOnAlert: true,
    slackNotifications: false,
    discordNotifications: false
  });

  // Blockchain Settings
  const [blockchainSettings, setBlockchainSettings] = useState({
    rpcUrl: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    contractAddress: '0x1234567890123456789012345678901234567890',
    chainId: 11155111,
    gasLimit: '200000',
    confirmations: 12
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    maxLoginAttempts: 5,
    lockoutDuration: 120,
    sessionTimeout: 3600,
    requiresTwoFA: false,
    ipWhitelist: ''
  });

  const handleSaveGeneral = async () => {
    try {
      setLoading(true);
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('✅ General settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('✅ Notification settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBlockchain = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('✅ Blockchain settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('✅ Security settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Settings className="text-blue-400" size={32} />
          Settings
        </h1>
        <p className="text-slate-400 mt-2">Manage system configuration and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 overflow-x-auto">
        {[
          { id: 'general', label: 'General' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'blockchain', label: 'Blockchain' },
          { id: 'security', label: 'Security' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 px-4 font-medium transition border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-blue-400 border-blue-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="admin-card space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-700">
            <Settings className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-white">General Settings</h2>
          </div>

          <div>
            <label className="label text-white">Platform Name</label>
            <input
              type="text"
              value={generalSettings.platformName}
              onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
              className="input bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div>
            <label className="label text-white">Admin Email</label>
            <input
              type="email"
              value={generalSettings.platformEmail}
              onChange={(e) => setGeneralSettings({ ...generalSettings, platformEmail: e.target.value })}
              className="input bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div>
            <label className="label text-white">Timezone</label>
            <select
              value={generalSettings.timezone}
              onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
              className="input bg-slate-800 border-slate-700 text-white"
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern (EST)</option>
              <option value="CST">Central (CST)</option>
              <option value="PST">Pacific (PST)</option>
              <option value="GMT">GMT (UK)</option>
              <option value="IST">IST (India)</option>
            </select>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={generalSettings.maintenanceMode}
                onChange={(e) => setGeneralSettings({ ...generalSettings, maintenanceMode: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <span className="text-white font-semibold">Maintenance Mode</span>
            </label>
          </div>

          {generalSettings.maintenanceMode && (
            <div>
              <label className="label text-white">Maintenance Message</label>
              <textarea
                value={generalSettings.maintenanceMessage}
                onChange={(e) => setGeneralSettings({ ...generalSettings, maintenanceMessage: e.target.value })}
                placeholder="Under maintenance. We'll be back soon!"
                className="input bg-slate-800 border-slate-700 text-white resize-none"
                rows={4}
              />
            </div>
          )}

          <button
            onClick={handleSaveGeneral}
            disabled={loading}
            className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 w-full"
          >
            <Save size={18} /> {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="admin-card space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-700">
            <Bell className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-white">Notification Settings</h2>
          </div>

          <div className="space-y-4">
            {[
              { key: 'emailOnNewUser', label: 'Email on New User', desc: 'Notify when new users register' },
              { key: 'emailOnTransaction', label: 'Email on Transaction', desc: 'Notify on large transactions' },
              { key: 'emailOnAlert', label: 'Email on Alert', desc: 'System alerts and warnings' },
              { key: 'slackNotifications', label: 'Slack Notifications', desc: 'Send to Slack channel' },
              { key: 'discordNotifications', label: 'Discord Notifications', desc: 'Send to Discord server' }
            ].map(({ key, label, desc }) => (
              <div key={key} className="bg-slate-800 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{label}</p>
                  <p className="text-sm text-slate-400">{desc}</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings[key]}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, [key]: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                </label>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveNotifications}
            disabled={loading}
            className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 w-full"
          >
            <Save size={18} /> {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      )}

      {/* Blockchain Settings */}
      {activeTab === 'blockchain' && (
        <div className="admin-card space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-700">
            <Database className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-white">Blockchain Configuration</h2>
          </div>

          <div>
            <label className="label text-white">RPC URL</label>
            <input
              type="text"
              value={blockchainSettings.rpcUrl}
              onChange={(e) => setBlockchainSettings({ ...blockchainSettings, rpcUrl: e.target.value })}
              className="input bg-slate-800 border-slate-700 text-white font-mono text-sm"
            />
          </div>

          <div>
            <label className="label text-white">Contract Address</label>
            <input
              type="text"
              value={blockchainSettings.contractAddress}
              onChange={(e) => setBlockchainSettings({ ...blockchainSettings, contractAddress: e.target.value })}
              className="input bg-slate-800 border-slate-700 text-white font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label text-white">Chain ID</label>
              <input
                type="number"
                value={blockchainSettings.chainId}
                onChange={(e) => setBlockchainSettings({ ...blockchainSettings, chainId: parseInt(e.target.value) })}
                className="input bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="label text-white">Gas Limit</label>
              <input
                type="number"
                value={blockchainSettings.gasLimit}
                onChange={(e) => setBlockchainSettings({ ...blockchainSettings, gasLimit: e.target.value })}
                className="input bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <div>
            <label className="label text-white">Confirmations Required</label>
            <input
              type="number"
              value={blockchainSettings.confirmations}
              onChange={(e) => setBlockchainSettings({ ...blockchainSettings, confirmations: parseInt(e.target.value) })}
              className="input bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <button
            onClick={handleSaveBlockchain}
            disabled={loading}
            className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 w-full"
          >
            <Save size={18} /> {loading ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="admin-card space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-700">
            <Shield className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-white">Security Settings</h2>
          </div>

          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-yellow-400 flex-shrink-0" size={20} />
            <p className="text-sm text-yellow-200">
              Be careful when modifying security settings. Incorrect configuration can compromise the platform.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label text-white">Max Login Attempts</label>
              <input
                type="number"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
                className="input bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="label text-white">Lockout Duration (minutes)</label>
              <input
                type="number"
                value={securitySettings.lockoutDuration}
                onChange={(e) => setSecuritySettings({ ...securitySettings, lockoutDuration: parseInt(e.target.value) })}
                className="input bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <div>
            <label className="label text-white">Session Timeout (seconds)</label>
            <input
              type="number"
              value={securitySettings.sessionTimeout}
              onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
              className="input bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="bg-slate-800 p-4 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.requiresTwoFA}
                onChange={(e) => setSecuritySettings({ ...securitySettings, requiresTwoFA: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <span className="text-white font-semibold">Require 2FA for Admin</span>
            </label>
          </div>

          <div>
            <label className="label text-white">IP Whitelist (comma separated)</label>
            <textarea
              value={securitySettings.ipWhitelist}
              onChange={(e) => setSecuritySettings({ ...securitySettings, ipWhitelist: e.target.value })}
              placeholder="192.168.1.1, 10.0.0.1"
              className="input bg-slate-800 border-slate-700 text-white resize-none"
              rows={4}
            />
          </div>

          <button
            onClick={handleSaveSecurity}
            disabled={loading}
            className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 w-full"
          >
            <Save size={18} /> {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="admin-card">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-green-400" size={20} />
            <p className="text-white font-semibold">Database</p>
          </div>
          <p className="text-green-400 text-sm">Connected</p>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-green-400" size={20} />
            <p className="text-white font-semibold">API Server</p>
          </div>
          <p className="text-green-400 text-sm">Running</p>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-green-400" size={20} />
            <p className="text-white font-semibold">Blockchain</p>
          </div>
          <p className="text-green-400 text-sm">Connected</p>
        </div>
      </div>
    </div>
  );
}