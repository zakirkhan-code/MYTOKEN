import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, Eye, Trash2, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminReports() {
  const [reports, setReports] = useState([
    {
      id: 1,
      name: 'Monthly System Report',
      type: 'system',
      period: 'June 2024',
      createdAt: new Date('2024-06-30'),
      status: 'completed',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'User Activity Report',
      type: 'users',
      period: 'June 2024',
      createdAt: new Date('2024-06-30'),
      status: 'completed',
      size: '1.8 MB'
    },
    {
      id: 3,
      name: 'Transaction Analysis',
      type: 'transactions',
      period: 'June 2024',
      createdAt: new Date('2024-06-30'),
      status: 'completed',
      size: '3.2 MB'
    },
    {
      id: 4,
      name: 'Staking Pool Report',
      type: 'staking',
      period: 'June 2024',
      createdAt: new Date('2024-06-29'),
      status: 'completed',
      size: '1.5 MB'
    },
    {
      id: 5,
      name: 'Security Audit Log',
      type: 'security',
      period: 'June 2024',
      createdAt: new Date('2024-06-28'),
      status: 'completed',
      size: '4.1 MB'
    }
  ]);

  const [filterType, setFilterType] = useState('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleGenerateReport = (type) => {
    const newReport = {
      id: reports.length + 1,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
      type: type,
      period: new Date().toLocaleDateString(),
      createdAt: new Date(),
      status: 'processing',
      size: '0 MB'
    };

    setReports([newReport, ...reports]);
    toast.loading('Generating report...');

    setTimeout(() => {
      newReport.status = 'completed';
      newReport.size = (Math.random() * 4 + 1).toFixed(1) + ' MB';
      setReports([...reports.filter(r => r.id !== newReport.id), newReport]);
      toast.dismiss();
      toast.success('✅ Report generated');
    }, 3000);

    setShowGenerateModal(false);
  };

  const handleDownload = (report) => {
    toast.success(`✅ Downloading ${report.name}`);
  };

  const handleDelete = (reportId) => {
    if (window.confirm('Delete this report?')) {
      setReports(reports.filter(r => r.id !== reportId));
      toast.success('✅ Report deleted');
    }
  };

  const filteredReports = reports.filter(r => filterType === 'all' || r.type === filterType);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-400" size={18} />;
      case 'processing':
        return <Clock className="text-yellow-400 animate-spin" size={18} />;
      case 'error':
        return <AlertCircle className="text-red-400" size={18} />;
      default:
        return null;
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      system: 'bg-blue-900 text-blue-200',
      users: 'bg-green-900 text-green-200',
      transactions: 'bg-purple-900 text-purple-200',
      staking: 'bg-yellow-900 text-yellow-200',
      security: 'bg-red-900 text-red-200'
    };
    return colors[type] || 'bg-slate-900 text-slate-200';
  };

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <FileText className="text-blue-400" size={32} />
            Reports
          </h1>
          <p className="text-slate-400 mt-2">Generate and download system reports</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Plus size={18} /> Generate Report
        </button>
      </div>

      {/* Filter */}
      <div className="admin-card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-blue-400" size={20} />
          <h3 className="font-semibold text-white">Filter by Type</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {['all', 'system', 'users', 'transactions', 'staking', 'security'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`p-2 rounded-lg font-medium text-sm transition capitalize ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="admin-card hover:shadow-lg transition cursor-pointer"
              onClick={() => {
                setSelectedReport(report);
                setShowModal(true);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <FileText className="text-blue-400" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg">{report.name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getTypeColor(report.type)}`}>
                        {report.type}
                      </span>
                      <span className="text-slate-400 text-sm">Period: {report.period}</span>
                      <span className="text-slate-500 text-sm">Size: {report.size}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    {getStatusIcon(report.status)}
                    <span className="text-sm capitalize">{report.status}</span>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {report.status === 'completed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(report);
                        }}
                        className="p-2 hover:bg-slate-700 rounded transition text-green-400"
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReport(report);
                        setShowModal(true);
                      }}
                      className="p-2 hover:bg-slate-700 rounded transition text-blue-400"
                      title="View details"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(report.id);
                      }}
                      className="p-2 hover:bg-slate-700 rounded transition text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-2">
                Generated: {report.createdAt.toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <div className="admin-card text-center py-12">
            <FileText size={48} className="mx-auto mb-4 opacity-50 text-slate-400" />
            <p className="text-slate-400">No reports found</p>
          </div>
        )}
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="admin-card w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Generate New Report</h2>

            <div className="space-y-3 mb-6">
              {[
                { id: 'system', label: 'System Report', desc: 'Complete system overview' },
                { id: 'users', label: 'User Report', desc: 'User statistics and details' },
                { id: 'transactions', label: 'Transaction Report', desc: 'All transactions analysis' },
                { id: 'staking', label: 'Staking Report', desc: 'Staking pool information' },
                { id: 'security', label: 'Security Report', desc: 'Security audit and logs' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleGenerateReport(type.id)}
                  className="w-full p-4 bg-slate-800 hover:bg-slate-700 rounded-lg text-left transition"
                >
                  <p className="font-semibold text-white">{type.label}</p>
                  <p className="text-xs text-slate-400 mt-1">{type.desc}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowGenerateModal(false)}
              className="btn btn-secondary w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="admin-card w-full max-w-lg">
            <h2 className="text-xl font-bold text-white mb-4">{selectedReport.name}</h2>

            <div className="space-y-4 bg-slate-800 p-4 rounded mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-xs">Type</p>
                  <p className={`text-sm font-semibold capitalize rounded inline-block px-2 py-1 mt-1 ${getTypeColor(selectedReport.type)}`}>
                    {selectedReport.type}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedReport.status)}
                    <span className="text-white font-semibold capitalize">{selectedReport.status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Period</p>
                  <p className="text-white font-semibold mt-1">{selectedReport.period}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Size</p>
                  <p className="text-white font-semibold mt-1">{selectedReport.size}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <p className="text-slate-400 text-xs mb-1">Generated</p>
                <p className="text-white font-mono text-sm">
                  {selectedReport.createdAt.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary flex-1"
              >
                Close
              </button>
              {selectedReport.status === 'completed' && (
                <button
                  onClick={() => {
                    handleDownload(selectedReport);
                    setShowModal(false);
                  }}
                  className="btn bg-green-600 hover:bg-green-700 text-white flex-1 flex items-center justify-center gap-2"
                >
                  <Download size={18} /> Download
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}