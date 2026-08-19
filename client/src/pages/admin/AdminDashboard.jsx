import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { DollarSign, ShoppingBag, Users, Store, Download, RefreshCw, AlertCircle } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import apiClient from '../../api/apiClient';

// ─── Reusable Components ──────────────────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon, trend, sub, loading }) => (
  <div className="card bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
    {loading ? (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    ) : (
      <>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</h3>
          </div>
          <div className={`p-2.5 rounded-xl ${trend === 'up' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : trend === 'neutral' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {sub && <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{sub}</p>}
      </>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.name === 'Revenue' ? `₹${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('area'); // 'area' | 'bar'
  const [exporting, setExporting] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/admin/stats');
      setStats(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleGenerateReport = async () => {
    setExporting(true);
    try {
      // Build CSV from chart data
      if (!stats?.chartData?.length) {
        alert('No data available to export.');
        setExporting(false);
        return;
      }
      const headers = ['Month', 'Revenue (₹)', 'Orders'];
      const rows = stats.chartData.map(d => [d.name, d.Revenue, d.Orders]);
      const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `DineOps_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setExporting(false);
    }
  };

  const s = stats?.summary;

  const STAT_CARDS = [
    { label: 'Total Revenue', value: s ? `₹${s.totalRevenue.toLocaleString()}` : null, icon: DollarSign, trend: 'up', sub: `From ${s?.totalOrders ?? 0} total orders` },
    { label: 'Total Branches', value: s?.totalBranches, icon: Store, trend: 'neutral', sub: `${s?.activeBranches ?? 0} currently active` },
    { label: 'Total Users', value: s?.totalUsers, icon: Users, trend: 'neutral', sub: 'Customers & Branch Owners' },
    { label: 'Total Orders', value: s?.totalOrders, icon: ShoppingBag, trend: 'up', sub: 'All time across all branches' },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Live platform data from MongoDB.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              disabled={loading}
              title="Refresh Data"
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary hover:border-primary transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={exporting || loading}
              className="btn-primary flex items-center gap-2 shadow-md shadow-primary/20"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
            <button onClick={fetchStats} className="ml-auto text-sm text-red-600 underline">Retry</button>
          </div>
        )}

        {/* Stats Grid - Live from DB */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {STAT_CARDS.map((card, i) => (
            <StatCard key={i} {...card} loading={loading} />
          ))}
        </div>

        {/* Revenue Analytics Chart */}
        <div className="card bg-white dark:bg-gray-800 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Analytics</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Chart type:</span>
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${chartType === 'area' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                Area
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${chartType === 'bar' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
              >
                Bar
              </button>
            </div>
          </div>

          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : !stats?.chartData?.length ? (
            <div className="h-80 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <DollarSign className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No revenue data yet</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Place your first order to see analytics here</p>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={stats.chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e11d48" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-gray-500" />
                    <YAxis tick={{ fontSize: 12 }} className="text-gray-500" tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="Revenue" stroke="#e11d48" fill="url(#revenueGradient)" strokeWidth={2} dot={{ fill: '#e11d48', r: 4 }} />
                    <Area type="monotone" dataKey="Orders" stroke="#d97706" fill="none" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#d97706', r: 4 }} />
                  </AreaChart>
                ) : (
                  <BarChart data={stats.chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="Revenue" fill="#e11d48" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Orders" fill="#d97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Branch Owners Table */}
        <div className="card bg-white dark:bg-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Branch Owners</h3>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : !stats?.branchOwners?.length ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No Branch Owners registered yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Owner</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Joined</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.branchOwners.map((owner) => (
                    <tr key={owner._id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                            {owner.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{owner.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{owner.email}</td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                        {new Date(owner.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full">
                          Branch Owner
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
