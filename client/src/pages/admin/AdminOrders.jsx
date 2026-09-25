import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import apiClient from '../../api/apiClient';
import {
  ShoppingBag,
  RefreshCw,
  AlertCircle,
  Search,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  Clock,
  Truck
} from 'lucide-react';

const STATUS_COLORS = {
  PENDING: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PREPARING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  READY: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-300',
  DELIVERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  SERVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_OPTIONS = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'SERVED',
  'COMPLETED',
  'CANCELLED',
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev =>
        prev.map(o => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter(
    o =>
      o.billNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o._id?.toLowerCase().includes(search.toLowerCase()) ||
      o.restaurant?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders & Delivery System</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Live orders, kitchen preparation, and delivery tracking across all branches.
            </p>
          </div>
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button onClick={fetchOrders} className="ml-auto text-sm text-red-600 underline">
              Retry
            </button>
          </div>
        )}

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Bill No, customer name, phone, branch..."
            className="input-field pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="card bg-white dark:bg-gray-800 overflow-x-auto shadow-sm">
          {loading ? (
            <div className="space-y-4 p-4">
              {[1, 2, 3, 4, 5].map(i => (
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
                <tr className="border-b border-gray-100 dark:border-gray-700 text-xs">
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-500 dark:text-gray-400">Order / Bill</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-500 dark:text-gray-400">Customer</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-500 dark:text-gray-400">Branch</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-500 dark:text-gray-400">Type</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-500 dark:text-gray-400">Total</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-gray-500 dark:text-gray-400">Live Status</th>
                  <th className="text-right py-3.5 px-4 font-semibold text-gray-500 dark:text-gray-400">Tracking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filtered.map(order => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                        #{order.billNumber || order._id.slice(-6).toUpperCase()}
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {order.customerName || 'Customer'}
                      </div>
                      {order.customerPhone && (
                        <div className="text-xs text-gray-400">{order.customerPhone}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">
                      {order.restaurant?.name || '—'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        order.orderType === 'DELIVERY'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {order.orderType?.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-black text-gray-900 dark:text-white">
                      ₹{order.total}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.orderStatus}
                          disabled={updatingId === order._id}
                          onChange={e => handleStatusChange(order._id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${
                            STATUS_COLORS[order.orderStatus] || STATUS_COLORS.PENDING
                          } cursor-pointer focus:outline-none`}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                              {opt.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/track-order/${order._id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-bold transition-colors"
                      >
                        <span>Live Track</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
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
