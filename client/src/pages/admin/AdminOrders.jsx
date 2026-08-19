import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import apiClient from '../../api/apiClient';
import { ShoppingBag, RefreshCw, AlertCircle, Search } from 'lucide-react';

const STATUS_COLORS = {
  PENDING: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PREPARING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  READY: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  SERVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/orders');
      setOrders(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = orders.filter(o =>
    o._id?.toLowerCase().includes(search.toLowerCase()) ||
    o.restaurant?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders & POS</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">All orders across every branch, in real-time.</p>
          </div>
          <button onClick={fetchOrders} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary transition-colors">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button onClick={fetchOrders} className="ml-auto text-sm text-red-600 underline">Retry</button>
          </div>
        )}

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by order ID or branch..." className="input-field pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="card bg-white dark:bg-gray-800 overflow-x-auto">
          {loading ? (
            <div className="space-y-4 p-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <ShoppingBag className="w-14 h-14 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {search ? 'No orders match your search.' : 'No orders placed yet.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Branch</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order._id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      {order.restaurant?.name || '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{order.orderType?.replace('_', ' ')}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">₹{order.total}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${STATUS_COLORS[order.orderStatus] || STATUS_COLORS.PENDING}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
