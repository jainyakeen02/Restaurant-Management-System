import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import {
  IndianRupee, ShoppingBag, Users, Clock, TrendingUp, RefreshCw,
  AlertCircle, Download, LayoutList, CalendarDays, CalendarRange
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

// ─── Palette ──────────────────────────────────────────────────────────────────
const COLORS = ['#e11d48', '#d97706', '#0ea5e9', '#10b981', '#8b5cf6'];

// ─── Sub-components ───────────────────────────────────────────────────────────

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

const StatCard = ({ label, value, sub, icon: Icon, accent, loading }) => (
  <div className="card bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
    {loading ? (
      <div className="space-y-3">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-3 w-full" />
      </div>
    ) : (
      <>
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <div className={`p-2 rounded-xl ${accent}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</h3>
        {sub && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</p>}
      </>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
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

const EmptyChart = ({ label }) => (
  <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-center">
    <TrendingUp className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">No {label} data yet</p>
    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Will populate when orders are placed</p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const BranchDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('monthly'); // 'daily' | 'monthly' | 'yearly'
  const [chartType, setChartType] = useState('area');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/admin/branch-stats');
      setStats(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load branch analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const s = stats?.summary;

  // --- Stat cards config ---
  const TODAY_CARDS = [
    {
      label: "Today's Revenue",
      value: s ? `₹${(s.todayRevenue ?? 0).toLocaleString()}` : null,
      sub: `${s?.todayOrders ?? 0} orders today`,
      icon: IndianRupee,
      accent: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      label: "Today's Orders",
      value: s?.todayOrders,
      sub: `${s?.pendingOrders ?? 0} pending / active`,
      icon: ShoppingBag,
      accent: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      label: "Today's Customers",
      value: s?.todayCustomers,
      sub: `${s?.totalCustomers ?? 0} all-time unique`,
      icon: Users,
      accent: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
    {
      label: 'Pending Orders',
      value: s?.pendingOrders,
      sub: 'Awaiting preparation / confirmation',
      icon: Clock,
      accent: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    },
  ];

  const PERIOD_CARDS = [
    {
      label: 'This Month Revenue',
      value: s ? `₹${(s.monthRevenue ?? 0).toLocaleString()}` : null,
      sub: `${s?.monthOrders ?? 0} orders this month`,
      icon: IndianRupee,
      accent: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    },
    {
      label: 'This Month Orders',
      value: s?.monthOrders,
      sub: 'All order types',
      icon: CalendarDays,
      accent: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
    },
    {
      label: 'This Year Revenue',
      value: s ? `₹${(s.yearRevenue ?? 0).toLocaleString()}` : null,
      sub: `${s?.yearOrders ?? 0} orders this year`,
      icon: IndianRupee,
      accent: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    },
    {
      label: 'This Year Orders',
      value: s?.yearOrders,
      sub: 'Calendar year total',
      icon: CalendarRange,
      accent: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
    },
  ];

  // --- Active chart data ---
  const activeChartData =
    chartPeriod === 'daily'   ? stats?.dailyChart   :
    chartPeriod === 'monthly' ? stats?.monthlyChart :
    stats?.yearlyChart;

  const activeChartLabel =
    chartPeriod === 'daily'   ? 'Daily (last 30 days)' :
    chartPeriod === 'monthly' ? 'Monthly (last 6 months)' :
    'Yearly (last 3 years)';

  // --- CSV export ---
  const handleExport = () => {
    if (!activeChartData?.length) { alert('No data to export.'); return; }
    const headers = ['Period', 'Revenue (₹)', 'Orders'];
    const rows = activeChartData.map(d => [d.name, d.Revenue, d.Orders]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BranchReport_${chartPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- Order type pie ---
  const pieData = (stats?.orderTypeBreakdown || []).map(d => ({
    name: d._id?.replace('_', ' ') || 'Unknown',
    value: d.count,
  }));

  const orderStatusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    PREPARING: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    READY: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    SERVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Branch Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Live analytics for <span className="font-semibold text-primary">{user?.name || 'your branch'}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              disabled={loading}
              title="Refresh"
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary hover:border-primary transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExport}
              disabled={loading}
              className="btn-primary flex items-center gap-2 shadow-md shadow-primary/20"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
            <button onClick={fetchStats} className="ml-auto text-sm text-red-600 underline">Retry</button>
          </div>
        )}

        {/* ── TODAY Section ── */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Today</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TODAY_CARDS.map((c, i) => <StatCard key={i} {...c} loading={loading} />)}
          </div>
        </div>

        {/* ── MONTHLY / YEARLY Section ── */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Period Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PERIOD_CARDS.map((c, i) => <StatCard key={i} {...c} loading={loading} />)}
          </div>
        </div>

        {/* ── Revenue & Orders Chart ── */}
        <div className="card bg-white dark:bg-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue & Orders</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{activeChartLabel}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Period Toggle */}
              <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
                {[['daily','Daily'],['monthly','Monthly'],['yearly','Yearly']].map(([k,l]) => (
                  <button
                    key={k}
                    onClick={() => setChartPeriod(k)}
                    className={`px-3 py-1.5 font-medium transition-colors ${chartPeriod === k ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {/* Chart Type */}
              <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
                {[['area','Area'],['bar','Bar']].map(([k,l]) => (
                  <button
                    key={k}
                    onClick={() => setChartType(k)}
                    className={`px-3 py-1.5 font-medium transition-colors ${chartType === k ? 'bg-gray-700 text-white dark:bg-gray-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : !activeChartData?.length ? (
            <EmptyChart label="revenue" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={activeChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#e11d48" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="Revenue" stroke="#e11d48" fill="url(#revGrad)" strokeWidth={2} dot={{ fill: '#e11d48', r: 3 }} />
                    <Area type="monotone" dataKey="Orders" stroke="#d97706" fill="none" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#d97706', r: 3 }} />
                  </AreaChart>
                ) : (
                  <BarChart data={activeChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="Revenue" fill="#e11d48" radius={[4,4,0,0]} />
                    <Bar dataKey="Orders" fill="#d97706" radius={[4,4,0,0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ── Bottom row: Top Items + Order Type Breakdown + Recent Orders ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Top Selling Items */}
          <div className="card bg-white dark:bg-gray-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">🔥 Top Selling Items</h3>
            {loading ? (
              <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-8 w-full" />)}</div>
            ) : !stats?.topItems?.length ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                <LayoutList className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No orders yet
              </div>
            ) : (
              <div className="space-y-3">
                {stats.topItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">{i+1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{item._id}</p>
                      <p className="text-xs text-gray-500">₹{item.totalRevenue.toLocaleString()}</p>
                    </div>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full font-semibold text-gray-600 dark:text-gray-300">×{item.totalQty}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Type Breakdown */}
          <div className="card bg-white dark:bg-gray-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">📊 Order Types</h3>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : !pieData.length ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No orders yet
              </div>
            ) : (
              <>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-1.5">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-gray-700 dark:text-gray-300 capitalize">{d.name.toLowerCase()}</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Recent Orders */}
          <div className="card bg-white dark:bg-gray-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">🕐 Recent Orders</h3>
            {loading ? (
              <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : !stats?.recentOrders?.length ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No orders yet
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-72">
                {stats.recentOrders.map((order, i) => (
                  <div key={i} className="flex items-start justify-between p-2.5 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-xs font-semibold text-gray-800 dark:text-white capitalize">{order.orderType?.replace('_',' ').toLowerCase()}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">₹{order.total}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${orderStatusColors[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </AdminLayout>
  );
};

export default BranchDashboard;
