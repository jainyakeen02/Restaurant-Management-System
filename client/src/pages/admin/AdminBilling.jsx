import React, { useState, useEffect, useCallback, useRef } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import {
  Plus, Minus, ShoppingCart, CreditCard, Search, User, Phone,
  ChefHat, Bell, BellRing, CheckCircle2, Clock, Truck, XCircle,
  RefreshCw, Volume2, VolumeX, X, Eye, Banknote, Smartphone,
  CreditCard as CardIcon, AlertCircle, UtensilsCrossed, Package
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

// ─── Audio Helper ─────────────────────────────────────────────────────────────
const playNotification = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Pleasant rising chime
    const notes = [523, 659, 784];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.4);
    });
  } catch (e) { /* Audio not supported */ }
};

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING:    { color: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: Clock, label: 'Pending' },
  CONFIRMED:  { color: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: CheckCircle2, label: 'Confirmed' },
  PREPARING:  { color: 'bg-orange-500/15 text-orange-400 border-orange-500/30', icon: ChefHat, label: 'Cooking' },
  READY:      { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: UtensilsCrossed, label: 'Ready' },
  SERVED:     { color: 'bg-teal-500/15 text-teal-400 border-teal-500/30', icon: Truck, label: 'Served' },
  COMPLETED:  { color: 'bg-green-500/15 text-green-400 border-green-500/30', icon: CheckCircle2, label: 'Completed' },
  CANCELLED:  { color: 'bg-red-500/15 text-red-400 border-red-500/30', icon: XCircle, label: 'Cancelled' },
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminBilling = () => {
  const { user } = useAuth();

  // Menu state
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [menuSearch, setMenuSearch] = useState('');
  const [menuLoading, setMenuLoading] = useState(true);

  // Cart state
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState('DINE_IN');
  const [orderNotes, setOrderNotes] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('ACTIVE');
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const prevReadyIdsRef = useRef(new Set());

  // View mode: 'pos' or 'orders'
  const [viewMode, setViewMode] = useState('pos');

  // ─── Fetch Menu ───────────────────────────────────────────────────────
  const fetchMenu = useCallback(async () => {
    setMenuLoading(true);
    try {
      const res = await apiClient.get('/billing/menu');
      setCategories(res.data.data.categories || []);
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setMenuLoading(false);
    }
  }, []);

  // ─── Fetch Orders ─────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      const res = await apiClient.get('/billing/orders');
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // ─── Fetch Notifications ──────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiClient.get('/billing/notifications');
      const readyOrders = res.data.data?.ready || [];
      const newCount = res.data.unreadCount || 0;

      // Detect newly ready orders
      const newReadyIds = new Set(readyOrders.map(o => o._id));
      const prevIds = prevReadyIdsRef.current;
      const freshlyReady = readyOrders.filter(o => !prevIds.has(o._id));

      if (freshlyReady.length > 0 && soundEnabled) {
        playNotification();
      }

      prevReadyIdsRef.current = newReadyIds;
      setNotifications(readyOrders);
      setUnreadCount(newCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [soundEnabled]);

  // ─── Initial Load + Polling ───────────────────────────────────────────
  useEffect(() => {
    fetchMenu();
    fetchOrders();
    fetchNotifications();

    const orderPoll = setInterval(fetchOrders, 15000);
    const notifPoll = setInterval(fetchNotifications, 12000);

    return () => {
      clearInterval(orderPoll);
      clearInterval(notifPoll);
    };
  }, [fetchMenu, fetchOrders, fetchNotifications]);

  // ─── Menu Filtering ───────────────────────────────────────────────────
  const allItems = categories.flatMap(cat =>
    cat.items.map(item => ({ ...item, categoryName: cat.name }))
  );

  const filteredItems = allItems.filter(item => {
    const matchCategory = activeCategory === 'All' || item.categoryName === activeCategory;
    const matchSearch = !menuSearch || item.name.toLowerCase().includes(menuSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  const categoryNames = ['All', ...categories.map(c => c.name)];

  // ─── Cart Ops ─────────────────────────────────────────────────────────
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c._id === item._id);
      if (existing) {
        return prev.map(c => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const existing = prev.find(c => c._id === itemId);
      if (existing?.quantity === 1) {
        return prev.filter(c => c._id !== itemId);
      }
      return prev.map(c => c._id === itemId ? { ...c, quantity: c.quantity - 1 } : c);
    });
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setOrderNotes('');
    setOrderType('DINE_IN');
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const taxRate = 5;
  const taxes = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + taxes;

  // ─── Place Order ──────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setPlacingOrder(true);
    try {
      const payload = {
        items: cart.map(item => ({
          menuItemId: item._id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        orderType,
        customerName: customerName || 'Walk-in Customer',
        customerPhone: customerPhone || undefined,
        discount: 0,
        taxRate,
        notes: orderNotes || undefined,
      };
      await apiClient.post('/billing/orders', payload);
      clearCart();
      fetchOrders(); // Refresh order list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  // ─── Update Order Status ──────────────────────────────────────────────
  const handleUpdateStatus = async (orderId, status) => {
    try {
      await apiClient.patch(`/billing/orders/${orderId}/status`, { status });
      fetchOrders();
      fetchNotifications();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  // ─── Mark Paid ────────────────────────────────────────────────────────
  const [payingOrder, setPayingOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  const handleMarkPaid = async (orderId) => {
    try {
      const res = await apiClient.patch(`/billing/orders/${orderId}/pay`, { paymentMethod });
      if (res.data.whatsappUrl) {
        window.open(res.data.whatsappUrl, '_blank');
      }
      setPayingOrder(null);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as paid');
    }
  };

  // ─── Filtered Orders ──────────────────────────────────────────────────
  const filteredOrders = orders.filter(order => {
    if (orderFilter === 'ACTIVE') {
      return ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'].includes(order.orderStatus);
    }
    if (orderFilter === 'COMPLETED') return order.orderStatus === 'COMPLETED';
    if (orderFilter === 'CANCELLED') return order.orderStatus === 'CANCELLED';
    return true;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 h-[calc(100vh-8rem)]">

        {/* ── Top Controls Bar ── */}
        <div className="flex items-center justify-between gap-3 flex-shrink-0">
          {/* View Toggle */}
          <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setViewMode('pos')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'pos'
                  ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <ShoppingCart className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              POS
            </button>
            <button
              onClick={() => setViewMode('orders')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                viewMode === 'orders'
                  ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Package className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              Orders
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              className="relative p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {unreadCount > 0 ? (
                <BellRing className="w-5 h-5 text-emerald-500 animate-bounce" />
              ) : (
                <Bell className="w-5 h-5 text-gray-400" />
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border transition-colors ${
                soundEnabled
                  ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400'
              }`}
              title={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Refresh */}
            <button
              onClick={() => { fetchOrders(); fetchNotifications(); }}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 hover:text-primary transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Notification Banner ── */}
        {unreadCount > 0 && (
          <div className="flex-shrink-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl px-5 py-3 flex items-center gap-3 animate-in slide-in-from-top">
            <div className="bg-emerald-500 p-1.5 rounded-lg">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                🔔 {unreadCount} order{unreadCount > 1 ? 's' : ''} ready for delivery!
              </p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
                {notifications.slice(0, 3).map(o => `#${o.billNumber || o._id?.slice(-6)}`).join(', ')}
                {notifications.length > 3 ? ` +${notifications.length - 3} more` : ''}
              </p>
            </div>
            <button
              onClick={() => { setViewMode('orders'); setOrderFilter('ACTIVE'); }}
              className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View Orders →
            </button>
          </div>
        )}

        {/* ── Notification Panel (Popover) ── */}
        {showNotifPanel && (
          <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowNotifPanel(false)}>
            <div
              className="w-96 h-full bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BellRing className="w-5 h-5 text-emerald-500" />
                  Ready Orders
                </h3>
                <button onClick={() => setShowNotifPanel(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Bell className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No ready orders right now</p>
                  </div>
                ) : (
                  notifications.map(order => (
                    <div key={order._id} className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                          #{order.billNumber || order._id?.slice(-6)}
                        </span>
                        <span className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                          {order.customerName || 'Walk-in'}
                        </span>
                      </div>
                      <div className="space-y-1 mb-3">
                        {order.items?.map((item, i) => (
                          <p key={i} className="text-xs text-gray-600 dark:text-gray-400">
                            {item.name} ×{item.quantity}
                          </p>
                        ))}
                      </div>
                      <button
                        onClick={() => { handleUpdateStatus(order._id, 'SERVED'); setShowNotifPanel(false); }}
                        className="w-full py-2 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <Truck className="w-4 h-4" /> Mark as Served
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Main Content ── */}
        {viewMode === 'pos' ? (
          /* ═══════════════════════════════════════════════
             POS VIEW — Menu + Cart
             ═══════════════════════════════════════════════ */
          <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">

            {/* Menu Section */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-0">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">Menu</h2>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      className="pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 w-48"
                    />
                  </div>
                </div>
                {/* Categories */}
                <div className="overflow-x-auto no-scrollbar pb-1">
                  <div className="flex space-x-2">
                    {categoryNames.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          activeCategory === cat
                            ? 'bg-primary text-white shadow-sm shadow-primary/20'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/30">
                {menuLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <RefreshCw className="w-8 h-8 text-gray-300 animate-spin" />
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">No items found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredItems.map(item => {
                      const inCart = cart.find(c => c._id === item._id);
                      return (
                        <div
                          key={item._id}
                          onClick={() => addToCart(item)}
                          className={`relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden border cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.97] ${
                            inCart
                              ? 'border-primary shadow-sm shadow-primary/10'
                              : 'border-gray-100 dark:border-gray-700 hover:border-primary/50'
                          }`}
                        >
                          {inCart && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center z-10 shadow-lg">
                              {inCart.quantity}
                            </div>
                          )}
                          <div className="p-4 pt-3">
                            <p className="font-semibold text-gray-800 dark:text-white text-sm line-clamp-2 mb-1">{item.name}</p>
                            <p className="text-xs text-gray-400 mb-2">{item.categoryName}</p>
                            <p className="text-primary font-bold text-base">₹{item.price}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Cart Section */}
            <div className="w-full lg:w-[380px] flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex-shrink-0 min-h-0">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" /> New Order
                </h3>
                {cart.length > 0 && (
                  <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-600 font-medium">
                    Clear All
                  </button>
                )}
              </div>

              {/* Customer Info */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 space-y-3 flex-shrink-0">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Customer name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                {/* Order Type Selector */}
                <div className="flex rounded-lg bg-gray-100 dark:bg-gray-900 p-0.5 border border-gray-200 dark:border-gray-700">
                  {[
                    { value: 'DINE_IN', label: 'Dine In', icon: '🍽️' },
                    { value: 'TAKEAWAY', label: 'Takeaway', icon: '📦' },
                    { value: 'DELIVERY', label: 'Delivery', icon: '🛵' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setOrderType(opt.value)}
                      className={`flex-1 px-2 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        orderType === opt.value
                          ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 min-h-0">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8">
                    <ShoppingCart className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">Cart is empty</p>
                    <p className="text-xs mt-1 opacity-60">Click on items to add them</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item._id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="font-medium text-gray-800 dark:text-white text-sm truncate">{item.name}</p>
                          <p className="text-gray-400 text-xs mt-0.5">₹{item.price} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-0.5">
                            <button onClick={() => removeFromCart(item._id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors">
                              <Minus className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                            </button>
                            <span className="w-7 text-center text-sm font-bold text-gray-800 dark:text-white">{item.quantity}</span>
                            <button onClick={() => addToCart(item)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors">
                              <Plus className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                            </button>
                          </div>
                          <p className="font-bold text-sm text-gray-800 dark:text-white w-14 text-right">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {/* Notes */}
                    <textarea
                      placeholder="Add order notes (optional)"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
                <div className="space-y-1.5 mb-4 text-sm">
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Tax ({taxRate}%)</span>
                    <span>₹{taxes}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={cart.length === 0 || placingOrder}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-base shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {placingOrder ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <CreditCard className="w-5 h-5" />
                  )}
                  {placingOrder ? 'Placing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ═══════════════════════════════════════════════
             ORDERS VIEW — Live order tracker
             ═══════════════════════════════════════════════ */
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-0">
            {/* Filter Tabs */}
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                {[
                  { key: 'ACTIVE', label: 'Active', count: orders.filter(o => ['PENDING','CONFIRMED','PREPARING','READY','SERVED'].includes(o.orderStatus)).length },
                  { key: 'COMPLETED', label: 'Completed', count: orders.filter(o => o.orderStatus === 'COMPLETED').length },
                  { key: 'CANCELLED', label: 'Cancelled', count: orders.filter(o => o.orderStatus === 'CANCELLED').length },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setOrderFilter(tab.key)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                      orderFilter === tab.key
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400">{orders.length} total today</p>
            </div>

            {/* Order Cards */}
            <div className="flex-1 overflow-y-auto p-4">
              {ordersLoading ? (
                <div className="flex items-center justify-center h-48">
                  <RefreshCw className="w-8 h-8 text-gray-300 animate-spin" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No {orderFilter.toLowerCase()} orders</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredOrders.map(order => {
                    const statusConf = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PENDING;
                    const StatusIcon = statusConf.icon;
                    return (
                      <div key={order._id} className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                        {/* Order Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-white">
                              #{order.billNumber || order._id?.slice(-6)}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusConf.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConf.label}
                          </span>
                        </div>

                        {/* Customer Info */}
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className="text-gray-600 dark:text-gray-300 font-medium">
                            {order.customerName || 'Walk-in'}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full
                            ${order.orderType === 'DINE_IN' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                              order.orderType === 'TAKEAWAY' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' :
                              'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'}`}>
                            {order.orderType?.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Items */}
                        <div className="space-y-1 mb-3 max-h-28 overflow-y-auto">
                          {order.items?.map((item, i) => (
                            <div key={i} className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>{item.name}</span>
                              <span className="font-semibold">×{item.quantity} = ₹{item.totalPrice}</span>
                            </div>
                          ))}
                        </div>

                        {/* Total */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700 mb-3">
                          <span className="text-sm font-bold text-gray-800 dark:text-white">Total: ₹{order.total}</span>
                          <span className={`text-xs font-semibold ${
                            order.paymentStatus === 'PAID' ? 'text-green-500' : 'text-amber-500'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {order.orderStatus === 'READY' && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'SERVED')}
                              className="flex-1 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Truck className="w-3.5 h-3.5" /> Deliver
                            </button>
                          )}
                          {order.orderStatus === 'SERVED' && order.paymentStatus !== 'PAID' && (
                            <button
                              onClick={() => setPayingOrder(order._id)}
                              className="flex-1 py-2 rounded-lg text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center justify-center gap-1.5"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Collect Payment
                            </button>
                          )}
                          {['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.orderStatus) && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'CANCELLED')}
                              className="py-2 px-3 rounded-lg text-xs font-semibold bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Payment Modal ── */}
        {payingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setPayingOrder(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Collect Payment
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Select payment method for order #{orders.find(o => o._id === payingOrder)?.billNumber || payingOrder.slice(-6)}
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { value: 'CASH', label: 'Cash', icon: Banknote, color: 'emerald' },
                  { value: 'CARD', label: 'Card', icon: CardIcon, color: 'blue' },
                  { value: 'UPI', label: 'UPI', icon: Smartphone, color: 'purple' },
                  { value: 'ONLINE', label: 'Online', icon: CreditCard, color: 'sky' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPaymentMethod(opt.value)}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === opt.value
                        ? `border-${opt.color}-500 bg-${opt.color}-50 dark:bg-${opt.color}-900/20 text-${opt.color}-600 dark:text-${opt.color}-400`
                        : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <opt.icon className="w-5 h-5" />
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPayingOrder(null)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleMarkPaid(payingOrder)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-primary hover:bg-rose-700 text-white transition-colors shadow-md shadow-primary/20"
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBilling;
