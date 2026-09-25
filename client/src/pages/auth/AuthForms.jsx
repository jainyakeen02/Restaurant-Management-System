import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  UtensilsCrossed,
  AlertCircle,
  Loader2,
  User,
  KeyRound,
  Building2,
  Phone,
  ShieldCheck,
  Mail,
  Lock,
  Store,
  ArrowRight,
} from 'lucide-react';

const AuthForms = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customerLogin, customerRegister, adminLogin, ownerLogin } = useAuth();

  // Parse tab and mode from URL query string
  const queryParams = new URLSearchParams(location.search);
  const initialTab = ['customer', 'branch', 'admin'].includes(queryParams.get('tab'))
    ? queryParams.get('tab')
    : 'customer';
  const initialMode = queryParams.get('mode') === 'signup' ? 'signup' : 'login';

  // ── Active Category Tab: 'customer' | 'branch' | 'admin' ──
  const [tab, setTab] = useState(initialTab);
  const [mode, setMode] = useState(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync state when URL query params change
  useEffect(() => {
    const qTab = queryParams.get('tab');
    if (['customer', 'branch', 'admin'].includes(qTab)) {
      setTab(qTab);
    }
    const qMode = queryParams.get('mode');
    if (qMode === 'signup' || qMode === 'login') {
      setMode(qMode);
    }
  }, [location.search]);

  // ── Form States ──
  // 1. Customer State
  const [customerData, setCustomerData] = useState({
    name: '',
    identifier: '', // Email or Phone for Login
    email: '',
    phone: '',
    password: '',
  });

  // 2. Branch State
  const [branchData, setBranchData] = useState({
    name: '',
    code: '',
  });

  // 3. Admin State
  const [adminData, setAdminData] = useState({
    email: '',
    password: '',
  });

  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    setError(null);
  };

  // ── 1. Customer Submit (Sign In or Sign Up) ──
  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const result = await customerRegister({
          name: customerData.name,
          email: customerData.email || undefined,
          phone: customerData.phone,
          password: customerData.password,
        });

        if (result.success) {
          navigate('/branches');
        } else {
          setError(result.message);
        }
      } else {
        const result = await customerLogin(
          customerData.identifier || customerData.email,
          customerData.password
        );

        if (result.success) {
          navigate('/branches');
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── 2. Branch Owner Submit ──
  const handleBranchSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await ownerLogin(branchData.name, branchData.code, 'branch');
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Branch sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── 3. Admin Submit ──
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await adminLogin(adminData.email, adminData.password);
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Admin sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2 mb-4 group">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Dine<span className="text-primary">Ops</span>
          </span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {tab === 'customer'
            ? mode === 'login'
              ? 'Customer Sign In'
              : 'Create Customer Account'
            : tab === 'branch'
            ? 'Branch Owner Portal'
            : 'Admin Control Center'}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {tab === 'customer'
            ? 'Order food, browse branch menus, and enjoy quick dining'
            : tab === 'branch'
            ? 'Sign in using your registered branch name and access code'
            : 'Restricted login for platform administrators and executives'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        {/* ── 3-Category Tab Switcher ── */}
        <div className="grid grid-cols-3 rounded-2xl bg-gray-100 dark:bg-gray-800 p-1.5 mb-6 gap-1 border border-gray-200 dark:border-gray-700 shadow-inner">
          {/* Tab 1: Customer */}
          <button
            type="button"
            id="tab-customer"
            onClick={() => handleTabSwitch('customer')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              tab === 'customer'
                ? 'bg-white dark:bg-gray-700 text-primary dark:text-primary-dark shadow-md shadow-black/5 border border-gray-200/80 dark:border-gray-600'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Customer</span>
          </button>

          {/* Tab 2: Branch */}
          <button
            type="button"
            id="tab-branch"
            onClick={() => handleTabSwitch('branch')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              tab === 'branch'
                ? 'bg-white dark:bg-gray-700 text-primary dark:text-primary-dark shadow-md shadow-black/5 border border-gray-200/80 dark:border-gray-600'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <Store className="w-4 h-4 shrink-0" />
            <span>Branch</span>
          </button>

          {/* Tab 3: Admin */}
          <button
            type="button"
            id="tab-admin"
            onClick={() => handleTabSwitch('admin')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              tab === 'admin'
                ? 'bg-white dark:bg-gray-700 text-primary dark:text-primary-dark shadow-md shadow-black/5 border border-gray-200/80 dark:border-gray-600'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Admin</span>
          </button>
        </div>

        {/* ── Main Form Card ── */}
        <div className="card bg-white dark:bg-gray-800 py-8 px-6 sm:px-10 shadow-xl border-gray-100 dark:border-gray-700 rounded-3xl">
          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 flex flex-col space-y-2">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300 font-medium leading-relaxed">
                  {error.includes('duplicate key') || error.includes('E11000')
                    ? 'An account with this email/phone already exists. Please sign in instead.'
                    : error}
                </p>
              </div>
              {tab === 'customer' && mode === 'signup' && (error.includes('already') || error.includes('duplicate') || error.includes('E11000')) && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="self-start ml-8 text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  Click here to switch to Sign In &rarr;
                </button>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════
              CATEGORY 1: CUSTOMER SECTION
              (Saved to & authenticated from 'customers' collection)
          ═════════════════════════════════════════════════ */}
          {tab === 'customer' && (
            <div>
              {/* Customer Mode Switcher: Sign In vs Sign Up */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-900/60 p-1 border border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mode === 'login'
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(null); }}
                    className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mode === 'signup'
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleCustomerSubmit}>
                {mode === 'signup' ? (
                  <>
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          className="input-field pl-10"
                          value={customerData.name}
                          onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number (for WhatsApp)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 9876543210"
                          className="input-field pl-10"
                          value={customerData.phone}
                          onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        Order confirmations will be sent to your WhatsApp
                      </p>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          type="email"
                          placeholder="e.g. john@example.com"
                          className="input-field pl-10"
                          value={customerData.email}
                          onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  /* Login: Identifier */
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email address or Phone number
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="john@example.com or 9876543210"
                        className="input-field pl-10"
                        value={customerData.identifier}
                        onChange={(e) => setCustomerData({ ...customerData, identifier: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    {mode === 'login' && (
                      <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="input-field pl-10"
                      value={customerData.password}
                      onChange={(e) => setCustomerData({ ...customerData, password: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-base font-bold shadow-lg shadow-primary/20 rounded-xl mt-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Sign In as Customer' : 'Create Customer Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Mode Switcher Link */}
              <div className="mt-6 text-center pt-4 border-t border-gray-100 dark:border-gray-700/60">
                <button
                  type="button"
                  onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                >
                  {mode === 'login' ? (
                    <span>New to DineOps? <strong className="text-primary font-semibold">Create an account</strong></span>
                  ) : (
                    <span>Already have a customer account? <strong className="text-primary font-semibold">Sign in</strong></span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════
              CATEGORY 2: BRANCH OWNER SECTION
              (Authenticated using Branch Name + Access Code)
          ═════════════════════════════════════════════════ */}
          {tab === 'branch' && (
            <div>
              <div className="mb-6 p-3.5 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200/70 dark:border-orange-800/30 flex items-start gap-3">
                <Store className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-orange-800 dark:text-orange-300 leading-relaxed">
                  Enter your assigned branch credentials created by your Super Admin to open POS, orders, and kitchen display.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleBranchSubmit}>
                <div>
                  <label htmlFor="branch-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Branch Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      id="branch-name"
                      type="text"
                      required
                      placeholder="e.g. SGRoad"
                      className="input-field pl-10"
                      value={branchData.name}
                      onChange={(e) => setBranchData({ ...branchData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="branch-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Branch Access Code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      id="branch-code"
                      type="text"
                      required
                      placeholder="e.g. SGROAD001"
                      className="input-field pl-10 uppercase tracking-widest font-semibold"
                      value={branchData.code}
                      onChange={(e) => setBranchData({ ...branchData, code: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    Contact your Super Admin if you don't know your branch code
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-base font-bold shadow-lg shadow-primary/20 rounded-xl mt-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In as Branch Owner</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ═════════════════════════════════════════════════
              CATEGORY 3: ADMIN SECTION
              (Super Admin / Organization Owner email + password)
          ═════════════════════════════════════════════════ */}
          {tab === 'admin' && (
            <div>
              <div className="mb-6 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-800/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  Administrator Portal: Access overall platform management, branch creation, user oversight, and global analytics.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleAdminSubmit}>
                <div>
                  <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      id="admin-email"
                      type="email"
                      required
                      placeholder="admin@dineops.com"
                      className="input-field pl-10"
                      value={adminData.email}
                      onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Master Password
                    </label>
                    <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      id="admin-password"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="input-field pl-10"
                      value={adminData.password}
                      onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-base font-bold shadow-lg shadow-primary/20 rounded-xl mt-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In as Administrator</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Quick Links below Card */}
        <div className="mt-8 flex justify-center items-center space-x-6 text-xs text-gray-400 dark:text-gray-500">
          <span>DineOps Restaurant Operating System</span>
          <span>•</span>
          <Link to="/branches" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            Browse Branches
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthForms;
