import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import CustomerLayout from '../../layouts/CustomerLayout';
import {
  UtensilsCrossed,
  Package,
  CheckCircle2,
  Flame,
  Truck,
  MapPin,
  Clock,
  Phone,
  Store,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
  Copy,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  Info,
  Sparkles
} from 'lucide-react';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const pollIntervalRef = useRef(null);

  const fetchOrderDetails = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await apiClient.get(`/orders/track/${orderId}`);
      if (res.data?.success && res.data?.data) {
        setOrder(res.data.data);
        setSteps(res.data.steps || []);
        setCurrentStep(res.data.currentStep ?? 0);
        setError(null);
      } else {
        setError('Order details could not be found.');
      }
    } catch (err) {
      console.error('Error fetching order status:', err);
      setError(err.response?.data?.message || 'Failed to load order tracking details.');
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();

    // Auto-poll order status every 6 seconds for real-time kitchen & delivery updates
    pollIntervalRef.current = setInterval(() => {
      fetchOrderDetails();
    }, 6000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [orderId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getStepIcon = (index, stepKey) => {
    switch (stepKey) {
      case 'PENDING':
        return Package;
      case 'CONFIRMED':
        return CheckCircle2;
      case 'PREPARING':
        return Flame;
      case 'OUT_FOR_DELIVERY':
        return Truck;
      case 'READY':
        return UtensilsCrossed;
      case 'DELIVERED':
      case 'COMPLETED':
        return ShieldCheck;
      default:
        return Package;
    }
  };

  const isDelivery = order?.orderType === 'DELIVERY';

  if (loading) {
    return (
      <CustomerLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Connecting to Restaurant Live Tracker...</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Retrieving real-time kitchen and delivery status</p>
        </div>
      </CustomerLayout>
    );
  }

  if (error || !order) {
    return (
      <CustomerLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Order Not Found</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error || 'Please check your order ID or reference.'}</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => fetchOrderDetails(true)} className="btn-secondary px-5 py-2.5 rounded-xl text-sm font-semibold">
              Retry
            </button>
            <Link to="/order" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold">
              Browse Menu
            </Link>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              to={order.restaurant?._id ? `/order/${order.restaurant._id}` : '/order'}
              className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  Order #{order.billNumber || order._id.slice(-6).toUpperCase()}
                </h1>
                <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  order.orderStatus === 'DELIVERED' || order.orderStatus === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-300'
                    : order.orderStatus === 'OUT_FOR_DELIVERY'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-300 animate-pulse'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-300'
                }`}>
                  {order.orderStatus?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Top Actions: Refresh & Share */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => fetchOrderDetails(true)}
              disabled={refreshing}
              className="btn-secondary px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs"
              title="Refresh status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Live Refresh'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="btn-secondary px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Share Link'}</span>
            </button>
          </div>
        </div>

        {/* ─── LIVE TRACKER PROGRESS CARD ──────────────────────────────────── */}
        <div className="card bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 overflow-hidden relative">
          
          {/* Top Status Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-700 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Live Order Tracking
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {steps[currentStep]?.title || 'Order in Progress'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {steps[currentStep]?.desc || 'Your order is being processed by the branch.'}
              </p>
            </div>

            {/* Estimated Time Badge */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-4 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
                  {order.orderStatus === 'DELIVERED' || order.orderStatus === 'COMPLETED' ? 'Delivered Time' : 'Estimated Time'}
                </p>
                <p className="text-base font-extrabold text-emerald-900 dark:text-emerald-100">
                  {order.estimatedDeliveryTime
                    ? new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '25 - 35 mins'}
                </p>
              </div>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="py-8">
            <div className="relative">
              
              {/* Background Connecting Line */}
              <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1.5 bg-gray-100 dark:bg-gray-700 -translate-y-1/2 z-0 rounded-full" />
              
              {/* Active Connecting Line */}
              <div
                className="hidden sm:block absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-primary to-emerald-500 -translate-y-1/2 z-0 rounded-full transition-all duration-700"
                style={{
                  width: `${(currentStep / Math.max(1, steps.length - 1)) * 100}%`,
                }}
              />

              {/* Steps Icons & Labels */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
                {steps.map((step, index) => {
                  const Icon = getStepIcon(index, step.key);
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div key={step.key} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-md ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                            : isCurrent
                            ? 'bg-primary text-white ring-4 ring-primary/20 scale-110 shadow-primary/25 animate-bounce'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 sm:flex-none">
                        <p
                          className={`text-sm font-bold ${
                            isCompleted || isCurrent
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 hidden sm:block">
                          {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Delivery Partner Box (If Out for Delivery) */}
          {order.orderStatus === 'OUT_FOR_DELIVERY' && order.deliveryDriver && (
            <div className="mt-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 flex items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Delivery Partner Assigned
                  </span>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">
                    {order.deliveryDriver.name || 'Rahul Sharma (Partner)'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    On the way to your delivery address
                  </p>
                </div>
              </div>

              {order.deliveryDriver.phone && (
                <a
                  href={`tel:${order.deliveryDriver.phone}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Rider</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* ─── GRID: ORDER DETAILS & RESTAURANT INFO ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2 Cols): Ordered Items List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
                <span>Items in this Order ({order.items?.length || 0})</span>
              </h3>

              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 font-extrabold text-xs flex items-center justify-center text-gray-700 dark:text-gray-300">
                        {item.quantity}x
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                          {item.name}
                        </h4>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          ₹{item.unitPrice} each
                        </span>
                      </div>
                    </div>
                    <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                      ₹{item.totalPrice}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Taxes & Charges (GST 5%)</span>
                  <span>₹{order.taxAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-lg text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span>Grand Total</span>
                  <span className="text-primary">₹{order.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address (if Delivery order) */}
            {isDelivery && order.deliveryAddress && (
              <div className="card bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Delivery Address</span>
                </h3>
                <p className="font-bold text-gray-900 dark:text-white text-base">
                  {order.deliveryAddress.street || 'Address on file'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {[
                    order.deliveryAddress.landmark ? `Near ${order.deliveryAddress.landmark}` : null,
                    order.deliveryAddress.city,
                    order.deliveryAddress.state,
                    order.deliveryAddress.pincode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>

                {order.deliveryNotes && (
                  <p className="mt-3 text-xs bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-xl text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-600">
                    <span className="font-bold">Instructions:</span> {order.deliveryNotes}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column (1 Col): Restaurant Branch Info */}
          <div className="space-y-6">
            <div className="card bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" />
                <span>Restaurant Branch</span>
              </h3>

              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-rose-400 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-black text-gray-900 dark:text-white">
                    {order.restaurant?.name || 'DineOps Restaurant'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Branch Code: <span className="font-bold">{order.restaurant?.code || 'MAIN'}</span>
                  </p>
                </div>
              </div>

              {order.restaurant?.contact?.phone && (
                <a
                  href={`tel:${order.restaurant.contact.phone}`}
                  className="w-full py-2.5 px-4 mb-3 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>Call Restaurant ({order.restaurant.contact.phone})</span>
                </a>
              )}

              {/* Order Support & Re-order */}
              <Link
                to={order.restaurant?._id ? `/order/${order.restaurant._id}` : '/order'}
                className="w-full py-2.5 px-4 rounded-xl btn-primary font-bold text-xs flex items-center justify-center gap-2 shadow-sm text-center"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Order More from this Branch</span>
              </Link>
            </div>

            {/* WhatsApp Updates Card */}
            <div className="card bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-5 rounded-3xl text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Need WhatsApp Updates?</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Keep this link saved or send live updates directly to your WhatsApp chat.
                </p>
              </div>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Track my DineOps order live here: ${window.location.href}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </CustomerLayout>
  );
};

export default OrderTracking;
