import React, { useState, useEffect } from 'react';
import { Lock, Shield, Smartphone, LogOut, Key, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { userAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

export default function Security() {
  const { logout, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [loginHistory, setLoginHistory] = useState([]);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [showSetup, setShowSetup] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const history = await userAPI.getLoginHistory();
      setLoginHistory(history.data?.data || []);
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/2fa/setup', { method: 'POST' });
      const data = await response.json();
      setQrCode(data.qrCode);
      setShowSetup(true);
      toast.success('2FA setup started');
    } catch (error) {
      toast.error('Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Are you sure? This will disable 2FA on your account.')) {
      return;
    }

    try {
      setLoading(true);
      const password = prompt('Enter your password to confirm:');
      if (!password) return;

      // In real app, call API to disable 2FA
      setTwoFAEnabled(false);
      setBackupCodes([]);
      toast.success('✅ 2FA disabled successfully');
    } catch (error) {
      toast.error('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!window.confirm('This will log you out from all devices. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      // In real app, call API
      logout();
      toast.success('Logged out from all devices');
      window.location.href = '/login';
    } catch (error) {
      toast.error('Failed to logout from all devices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackupCodes = () => {
    try {
      const codes = backupCodes.join('\n');
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(codes));
      element.setAttribute('download', 'backup-codes.txt');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('✅ Backup codes downloaded');
    } catch (error) {
      toast.error('Failed to download backup codes');
    }
  };

  return (
    <div className="p-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Security</h1>
        <p className="text-gray-600 mt-2">Manage your account security and access</p>
      </div>

      {/* 2FA Section */}
      <div className="card border-2 border-blue-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <Smartphone className="text-blue-600 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Two-Factor Authentication</h3>
              <p className="text-gray-600 text-sm mt-1">
                {twoFAEnabled
                  ? 'Two-factor authentication is enabled on your account'
                  : 'Add an extra layer of security with 2FA'}
              </p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
            twoFAEnabled
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {twoFAEnabled ? '✓ Enabled' : 'Not Enabled'}
          </div>
        </div>

        {showSetup && qrCode && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-3">
              Scan this QR code with an authenticator app:
            </p>
            <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 mx-auto" />
            <p className="text-xs text-gray-500 mt-3">
              Or enter this key manually: 2N7K-F9KP-L3RQ-8X2M
            </p>
          </div>
        )}

        <div className="space-y-3">
          {twoFAEnabled ? (
            <>
              <button
                onClick={handleDownloadBackupCodes}
                className="btn btn-outline w-full flex items-center justify-center gap-2"
              >
                <Key size={18} /> Download Backup Codes
              </button>
              <button
                onClick={handleDisable2FA}
                disabled={loading}
                className="btn bg-red-600 text-white hover:bg-red-700 w-full"
              >
                Disable 2FA
              </button>
            </>
          ) : (
            <button
              onClick={handleSetup2FA}
              disabled={loading}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              <Shield size={18} /> Enable 2FA
            </button>
          )}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Active Sessions</h3>
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-600">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">This Browser</p>
                <p className="text-sm text-gray-600 mt-1">Chrome on Windows</p>
                <p className="text-xs text-gray-500 mt-2">
                  Last active: Just now • IP: 192.168.1.1
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                Current
              </span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">Mobile App</p>
                <p className="text-sm text-gray-600 mt-1">Safari on iPhone</p>
                <p className="text-xs text-gray-500 mt-2">
                  Last active: 2 hours ago • IP: 192.168.1.50
                </p>
              </div>
              <button className="text-red-600 hover:text-red-700 font-semibold text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogoutAllDevices}
          disabled={loading}
          className="btn bg-red-100 text-red-700 hover:bg-red-200 w-full flex items-center justify-center gap-2"
        >
          <LogOut size={18} /> Logout All Devices
        </button>
      </div>

      {/* Login History */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Login History</h3>
        {loginHistory.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loginHistory.map((login, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">
                    {login.device || 'Unknown Device'}
                  </p>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    login.status === 'success'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {login.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {login.location || 'Unknown Location'}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(login.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No login history available</p>
        )}
      </div>

      {/* Security Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
          <Shield className="text-blue-600" size={20} />
          Security Tips
        </h3>
        <ul className="space-y-3 text-sm text-blue-900">
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
            <span>Use a strong, unique password (16+ characters with mixed case)</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
            <span>Enable two-factor authentication (2FA) for extra protection</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
            <span>Never share your recovery codes with anyone</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
            <span>Review login history regularly for suspicious activity</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
            <span>Logout from devices you no longer use</span>
          </li>
        </ul>
      </div>
    </div>
  );
}