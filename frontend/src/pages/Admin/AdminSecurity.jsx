import React, { useState } from 'react';
import { Shield, Lock, AlertCircle, CheckCircle, Eye, EyeOff, Key, RefreshCw, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSecurity() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: 'Primary API Key',
      key: 'sk_live_51234567890abcdef',
      createdAt: new Date('2024-01-15'),
      lastUsed: new Date('2024-06-30'),
      permissions: ['read', 'write'],
      active: true
    },
    {
      id: 2,
      name: 'Testing Key',
      key: 'sk_test_abcdef1234567890',
      createdAt: new Date('2024-01-10'),
      lastUsed: new Date('2024-05-20'),
      permissions: ['read'],
      active: true
    }
  ]);

  const [twoFAEnabled, setTwoFAEnabled] = useState(true);
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      action: 'User Banned',
      user: 'admin@mytoken.com',
      ipAddress: '192.168.1.1',
      status: 'success',
      timestamp: new Date('2024-06-30 10:30'),
      details: 'User spam123 was banned'
    },
    {
      id: 2,
      action: 'Settings Changed',
      user: 'admin@mytoken.com',
      ipAddress: '192.168.1.1',
      status: 'success',
      timestamp: new Date('2024-06-30 09:15'),
      details: 'Gas limit updated from 200000 to 300000'
    },
    {
      id: 3,
      action: 'Failed Login',
      user: 'attacker@example.com',
      ipAddress: '203.0.113.45',
      status: 'failed',
      timestamp: new Date('2024-06-29 23:45'),
      details: 'Multiple failed login attempts'
    },
    {
      id: 4,
      action: 'API Key Created',
      user: 'admin@mytoken.com',
      ipAddress: '192.168.1.1',
      status: 'success',
      timestamp: new Date('2024-06-29 15:20'),
      details: 'New API key generated: sk_test_*'
    }
  ]);

  const handleCreateApiKey = () => {
    const newKey = {
      id: apiKeys.length + 1,
      name: `API Key ${apiKeys.length + 1}`,
      key: 'sk_' + Math.random().toString(36).substring(2, 15),
      createdAt: new Date(),
      lastUsed: null,
      permissions: ['read', 'write'],
      active: true
    };
    setApiKeys([...apiKeys, newKey]);
    toast.success('✅ API Key created');
    setShowApiKeyModal(false);
  };

  const handleRevokeApiKey = (keyId) => {
    if (window.confirm('Revoke this API key? This action cannot be undone.')) {
      setApiKeys(apiKeys.filter(k => k.id !== keyId));
      toast.success('✅ API key revoked');
    }
  };

  const handleCopyApiKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success('✅ API key copied');
  };

  const handleExportAuditLog = () => {
    const csv = [
      ['Timestamp', 'Action', 'User', 'IP Address', 'Status', 'Details'],
      ...auditLogs.map(log => [
        log.timestamp.toLocaleString(),
        log.action,
        log.user,
        log.ipAddress,
        log.status,
        log.details
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('✅ Audit log exported');
  };

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Shield className="text-blue-400" size={32} />
          Security Management
        </h1>
        <p className="text-slate-400 mt-2">Manage API keys, audit logs, and security settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'apikeys', label: 'API Keys' },
          { id: 'auditlog', label: 'Audit Log' },
          { id: 'threats', label: 'Threat Detection' }
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Security Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="admin-card border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="text-green-400" size={24} />
                <h3 className="font-bold text-white">SSL/TLS</h3>
              </div>
              <p className="text-green-400 text-sm">Enabled & Valid</p>
              <p className="text-xs text-slate-500 mt-2">Expires: 2025-12-31</p>
            </div>

            <div className="admin-card border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="text-green-400" size={24} />
                <h3 className="font-bold text-white">2FA Admin</h3>
              </div>
              <p className="text-green-400 text-sm">Enabled</p>
              <p className="text-xs text-slate-500 mt-2">3 admins configured</p>
            </div>

            <div className="admin-card border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <Key className="text-blue-400" size={24} />
                <h3 className="font-bold text-white">API Keys</h3>
              </div>
              <p className="text-blue-400 text-sm">{apiKeys.length} Active</p>
              <p className="text-xs text-slate-500 mt-2">All keys rotated</p>
            </div>
          </div>

          {/* Security Recommendations */}
          <div className="admin-card">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="text-yellow-400" size={24} />
              Security Status
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-800 rounded">
                <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={18} />
                <div>
                  <p className="text-white font-semibold">✓ HTTPS Enabled</p>
                  <p className="text-xs text-slate-400">All connections are encrypted</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-800 rounded">
                <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={18} />
                <div>
                  <p className="text-white font-semibold">✓ CORS Configured</p>
                  <p className="text-xs text-slate-400">Only whitelisted origins allowed</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-800 rounded">
                <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={18} />
                <div>
                  <p className="text-white font-semibold">✓ Rate Limiting</p>
                  <p className="text-xs text-slate-400">100 requests per 15 minutes</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-800 rounded">
                <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={18} />
                <div>
                  <p className="text-white font-semibold">✓ Password Hashing</p>
                  <p className="text-xs text-slate-400">bcrypt with 10 rounds</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'apikeys' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">API Keys</h2>
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Key size={18} /> Create New Key
            </button>
          </div>

          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div key={key.id} className="admin-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-white">{key.name}</h3>
                      {key.active ? (
                        <span className="px-2 py-1 bg-green-900 text-green-200 rounded text-xs">Active</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-900 text-red-200 rounded text-xs">Revoked</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <code className="text-slate-300 font-mono text-sm bg-slate-800 px-3 py-2 rounded">
                        {key.key}
                      </code>
                      <button
                        onClick={() => handleCopyApiKey(key.key)}
                        className="p-2 hover:bg-slate-700 rounded transition text-blue-400"
                      >
                        <Key size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Created</p>
                        <p className="text-white">{key.createdAt.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Last Used</p>
                        <p className="text-white">{key.lastUsed ? key.lastUsed.toLocaleDateString() : 'Never'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Permissions</p>
                        <p className="text-white">{key.permissions.join(', ')}</p>
                      </div>
                    </div>
                  </div>

                  {key.active && (
                    <button
                      onClick={() => handleRevokeApiKey(key.id)}
                      className="p-2 hover:bg-slate-700 rounded transition text-red-400"
                      title="Revoke key"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {showApiKeyModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="admin-card w-full max-w-md">
                <h2 className="text-xl font-bold text-white mb-4">Create New API Key</h2>
                <p className="text-slate-400 text-sm mb-4">
                  API keys are used to authenticate requests to the API. Keep them secret and never share them.
                </p>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="label text-white">Key Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Integration API"
                      className="input bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="label text-white">Permissions</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-white">
                        <input type="checkbox" className="w-4 h-4 rounded" defaultChecked />
                        <span className="text-sm">Read</span>
                      </label>
                      <label className="flex items-center gap-2 text-white">
                        <input type="checkbox" className="w-4 h-4 rounded" defaultChecked />
                        <span className="text-sm">Write</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowApiKeyModal(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateApiKey}
                    className="btn bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'auditlog' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Audit Log</h2>
            <button
              onClick={handleExportAuditLog}
              className="btn bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Download size={18} /> Export CSV
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="admin-card">
                <div className="flex items-start gap-4">
                  <div>
                    {log.status === 'success' ? (
                      <CheckCircle className="text-green-400" size={24} />
                    ) : (
                      <AlertCircle className="text-red-400" size={24} />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">{log.action}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        log.status === 'success'
                          ? 'bg-green-900 text-green-200'
                          : 'bg-red-900 text-red-200'
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-slate-300 text-sm mb-2">{log.details}</p>

                    <div className="flex gap-4 text-xs text-slate-400">
                      <span>User: {log.user}</span>
                      <span>IP: {log.ipAddress}</span>
                      <span>Time: {log.timestamp.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Threat Detection Tab */}
      {activeTab === 'threats' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Threat Detection</h2>

          <div className="admin-card">
            <h3 className="font-bold text-white mb-4">Recent Suspicious Activities</h3>
            <div className="space-y-3">
              <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-white">Multiple Failed Logins</p>
                    <p className="text-sm text-slate-400 mt-1">IP: 203.0.113.45 - 5 failed attempts from 203.0.113.45</p>
                    <p className="text-xs text-slate-500 mt-1">Last seen: 2 hours ago</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-400 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-white">Unusual API Usage</p>
                    <p className="text-sm text-slate-400 mt-1">API key sk_test_* making 500+ requests in 1 hour</p>
                    <p className="text-xs text-slate-500 mt-1">Status: Monitoring</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-white">System Security Status</p>
                    <p className="text-sm text-slate-400 mt-1">All security checks passed</p>
                    <p className="text-xs text-slate-500 mt-1">Last scan: 1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="font-bold text-white mb-4">Blocked IPs</h3>
            <div className="space-y-2">
              <p className="text-slate-400">203.0.113.45 - Brute force attack (5 attempts)</p>
              <p className="text-slate-400">198.51.100.89 - Suspicious API usage</p>
              <p className="text-slate-400">192.0.2.120 - Multiple failed logins</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}