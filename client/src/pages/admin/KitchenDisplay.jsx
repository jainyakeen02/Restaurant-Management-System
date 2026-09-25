import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChefHat, Clock, Flame, CheckCircle2, ArrowRight, RefreshCw,
  AlertTriangle, Volume2, VolumeX, Users, UtensilsCrossed,
  Package, Timer, Maximize, Minimize
} from 'lucide-react';
import apiClient from '../../api/apiClient';

// ─── Audio Helper ─────────────────────────────────────────────────────────────
const playBeep = (frequency = 880, duration = 200, count = 2) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < count; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = frequency;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.3 + duration / 1000);
      osc.start(ctx.currentTime + i * 0.3);
      osc.stop(ctx.currentTime + i * 0.3 + duration / 1000);
    }
  } catch (e) {
    // Audio not supported
  }
};

// ─── Time Helpers ─────────────────────────────────────────────────────────────
const getMinutesAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / 60000);
};

const formatTimeAgo = (dateStr) => {
  const mins = getMinutesAgo(dateStr);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
};

// ─── Column Config ────────────────────────────────────────────────────────────
const COLUMNS = [
  {
    key: 'PENDING',
    label: 'New Orders',
    icon: Package,
    gradient: 'from-amber-500 to-orange-500',
    bgCard: 'border-l-amber-400',
    pulse: true,
    action: { label: 'Accept', nextStatus: 'CONFIRMED', icon: CheckCircle2 },
  },
  {
    key: 'CONFIRMED',
    label: 'Confirmed',
    icon: CheckCircle2,
    gradient: 'from-blue-500 to-cyan-500',
    bgCard: 'border-l-blue-400',
    pulse: false,
    action: { label: 'Start Cooking', nextStatus: 'PREPARING', icon: Flame },
  },
  {
    key: 'PREPARING',
    label: 'Cooking',
    icon: Flame,
    gradient: 'from-orange-500 to-red-500',
    bgCard: 'border-l-orange-400',
    pulse: false,
    action: { label: 'Mark Ready', nextStatus: 'READY', icon: CheckCircle2 },
  },
  {
    key: 'READY',
    label: 'Ready to Serve',
    icon: UtensilsCrossed,
    gradient: 'from-emerald-500 to-green-500',
    bgCard: 'border-l-emerald-400',
    pulse: false,
    action: null,
  },
];

// ─── Order Card ───────────────────────────────────────────────────────────────
const OrderCard = ({ order, column, onUpdateStatus, updating }) => {
  const minutesAgo = getMinutesAgo(order.createdAt);
  const isUrgent = minutesAgo > 20 && column.key !== 'READY';
  const isVeryUrgent = minutesAgo > 35 && column.key !== 'READY';

  return (
    <div
      className={`
        relative bg-gray-800/80 backdrop-blur-sm rounded-xl border-l-4 ${column.bgCard} 
        shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden
        ${isVeryUrgent ? 'ring-2 ring-red-500/60 animate-pulse' : ''}
        ${isUrgent && !isVeryUrgent ? 'ring-1 ring-amber-500/40' : ''}
      `}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 tracking-wide">
            #{order.billNumber || order._id?.slice(-6)?.toUpperCase()}
          </span>
          {isUrgent && (
            <AlertTriangle className={`w-4 h-4 ${isVeryUrgent ? 'text-red-400' : 'text-amber-400'}`} />
          )}
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full
          ${isVeryUrgent ? 'bg-red-500/20 text-red-300' : isUrgent ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-700 text-gray-300'}`}>
          <Timer className="w-3 h-3" />
          {formatTimeAgo(order.createdAt)}
        </div>
      </div>

      {/* Customer & Type */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-white truncate max-w-[140px]">
            {order.customerName || 'Walk-in'}
          </span>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
          ${order.orderType === 'DINE_IN' ? 'bg-purple-500/20 text-purple-300' :
            order.orderType === 'TAKEAWAY' ? 'bg-teal-500/20 text-teal-300' :
            'bg-sky-500/20 text-sky-300'}`}>
          {order.orderType?.replace('_', ' ')}
        </span>
      </div>

      {/* Items List */}
      <div className="px-4 pb-3">
        <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-gray-300 truncate flex-1">
                {item.name}
              </span>
              <span className="ml-2 bg-gray-700/80 text-white font-bold text-xs px-2 py-0.5 rounded-md min-w-[32px] text-center">
                ×{item.quantity}
              </span>
            </div>
          ))}
        </div>
        {order.notes && (
          <div className="mt-2 px-2.5 py-1.5 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <p className="text-xs text-yellow-300 italic">📝 {order.notes}</p>
          </div>
        )}
      </div>

      {/* Action Button */}
      {column.action && (
        <div className="px-4 pb-4">
          <button
            onClick={() => onUpdateStatus(order._id, column.action.nextStatus)}
            disabled={updating === order._id}
            className={`
              w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm
              transition-all duration-200 active:scale-95
              ${updating === order._id ? 'opacity-50 cursor-wait' : 'hover:brightness-110 hover:shadow-lg'}
              ${column.key === 'PENDING'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-500/30'
                : column.key === 'CONFIRMED'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-500/30'
                : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-emerald-500/30'
              }
              shadow-md
            `}
          >
            {updating === order._id ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <column.action.icon className="w-4 h-4" />
            )}
            {column.action.label}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Kitchen Column ───────────────────────────────────────────────────────────
const KitchenColumn = ({ column, orders, onUpdateStatus, updating }) => {
  const Icon = column.icon;
  return (
    <div className="flex flex-col h-full min-w-[300px]">
      {/* Column Header */}
      <div className={`bg-gradient-to-r ${column.gradient} rounded-t-xl px-4 py-3 flex items-center justify-between shadow-lg`}>
        <div className="flex items-center gap-2.5">
          <Icon className="w-5 h-5 text-white" />
          <h2 className="text-white font-bold text-sm uppercase tracking-wider">{column.label}</h2>
        </div>
        <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[28px] text-center">
          {orders.length}
        </span>
      </div>

      {/* Column Body */}
      <div className="flex-1 bg-gray-900/40 backdrop-blur-sm rounded-b-xl border border-gray-700/30 border-t-0 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {orders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 py-12">
            <Icon className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No orders</p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              column={column}
              onUpdateStatus={onUpdateStatus}
              updating={updating}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const KitchenDisplay = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const prevOrderIdsRef = useRef(new Set());
  const pollIntervalRef = useRef(null);

  // Fetch kitchen orders
  const fetchOrders = useCallback(async (isFirstLoad = false) => {
    try {
      if (isFirstLoad) setLoading(true);
      setError(null);
      const res = await apiClient.get('/billing/kitchen');
      const newOrders = res.data.data || [];

      // Detect new PENDING orders for audio alert
      const newPendingIds = new Set(
        newOrders.filter(o => o.orderStatus === 'PENDING').map(o => o._id)
      );
      const prevIds = prevOrderIdsRef.current;
      const freshOrders = [...newPendingIds].filter(id => !prevIds.has(id));

      if (freshOrders.length > 0 && soundEnabled && !isFirstLoad) {
        playBeep(880, 200, 3);
      }

      // Update prev IDs
      prevOrderIdsRef.current = new Set(newOrders.map(o => o._id));
      setOrders(newOrders);
      setLastOrderCount(newOrders.length);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch kitchen orders');
    } finally {
      setLoading(false);
    }
  }, [soundEnabled]);

  // Initial load + polling
  useEffect(() => {
    fetchOrders(true);
    pollIntervalRef.current = setInterval(() => fetchOrders(false), 10000);
    return () => clearInterval(pollIntervalRef.current);
  }, [fetchOrders]);

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await apiClient.patch(`/billing/orders/${orderId}/status`, { status: newStatus });
      // Refresh immediately
      await fetchOrders(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Group orders by status
  const grouped = {};
  COLUMNS.forEach(col => { grouped[col.key] = []; });
  orders.forEach(order => {
    if (grouped[order.orderStatus]) {
      grouped[order.orderStatus].push(order);
    }
  });

  // Current time display
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col">
      {/* ── Top Bar ── */}
      <header className="flex-shrink-0 bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50 px-6 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-xl shadow-lg shadow-orange-500/20">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Kitchen Display
            </h1>
            <p className="text-xs text-gray-400">
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              {' · '}
              {lastOrderCount} active order{lastOrderCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-lg border transition-all duration-200 ${
              soundEnabled
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                : 'border-gray-600 bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            title={soundEnabled ? 'Mute alerts' : 'Enable alerts'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Refresh */}
          <button
            onClick={() => fetchOrders(false)}
            disabled={loading}
            className="p-2.5 rounded-lg border border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            title="Refresh now"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-lg border border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ── Error Banner ── */}
      {error && (
        <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300 flex-1">{error}</p>
          <button onClick={() => fetchOrders(true)} className="text-sm text-red-400 hover:text-red-300 font-medium underline">
            Retry
          </button>
        </div>
      )}

      {/* ── Kanban Board ── */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-10 h-10 text-gray-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Loading kitchen orders…</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-4 overflow-x-auto">
          <div className="grid grid-cols-4 gap-4 h-full min-h-[calc(100vh-7rem)]">
            {COLUMNS.map((col) => (
              <KitchenColumn
                key={col.key}
                column={col}
                orders={grouped[col.key]}
                onUpdateStatus={handleUpdateStatus}
                updating={updating}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Custom scrollbar styles ── */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.25);
        }
      `}</style>
    </div>
  );
};

export default KitchenDisplay;
