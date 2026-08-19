import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { UtensilsCrossed, AlertCircle, Loader2, User, KeyRound, Building2 } from 'lucide-react';

const AuthForms = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, ownerLogin } = useAuth();

  // Parse mode from URL query string
  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get('mode') === 'signup' ? 'signup' : 'login';

  // 'customer' | 'branch'
  const [tab, setTab] = useState('customer');
  const [mode, setMode] = useState(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Customer form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
  });

  // Branch form state (name + code only)
  const [orgData, setOrgData] = useState({ name: '', code: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    setError(null);
  };

  // ── Branch login submit ──
  const handleOrgSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await ownerLogin(orgData.name, orgData.code, 'branch');

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  // ── Customer login / signup submit ──
  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        await apiClient.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
        const loginRes = await login(formData.email, formData.password);
        if (loginRes.success) {
          navigate('/branches');
        } else {
          setError(loginRes.message);
        }
      } else {
        const loginRes = await login(formData.email, formData.password);
        if (loginRes.success) {
          const userObj = JSON.parse(localStorage.getItem('dineops_user') || '{}');
          if (['SUPER_ADMIN', 'ORGANIZATION_OWNER', 'FRANCHISE_OWNER'].includes(userObj.role)) {
            navigate('/admin/dashboard');
          } else {
            navigate('/branches');
          }
        } else {
          setError(loginRes.message);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const isOrg = tab === 'branch';

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center space-x-2 mb-6">
          <UtensilsCrossed className="w-10 h-10 text-primary dark:text-primary-dark" />
          <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">DineOps</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {isOrg ? 'Branch Sign In' : (mode === 'login' ? 'Sign in to your account' : 'Create your account')}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card bg-white dark:bg-gray-800 py-8 px-4 sm:px-10 shadow-xl border-gray-100 dark:border-gray-700">

          {/* ── Tab switcher ── */}
          <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 p-1 mb-6 gap-1 bg-gray-50 dark:bg-gray-900/50">
            <button
              type="button"
              id="tab-customer"
              onClick={() => handleTabSwitch('customer')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                !isOrg
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <User className="w-4 h-4" />
              Customer
            </button>
            <button
              type="button"
              id="tab-branch"
              onClick={() => handleTabSwitch('branch')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isOrg
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Branch
            </button>
          </div>

          {/* ── Error banner ── */}
          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 dark:bg-red-900/30 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* ══════════════════════════════════════
              BRANCH TAB — Name + Code only
          ══════════════════════════════════════ */}
          {isOrg && (
            <form className="space-y-5" onSubmit={handleOrgSubmit}>
              <div>
                <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Branch Name
                </label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    id="org-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="e.g. Spice Empire"
                    className="input-field pl-9"
                    value={orgData.name}
                    onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="org-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Access Code
                </label>
                <div className="relative mt-1">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    id="org-code"
                    name="code"
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="e.g. SPICEEMP01"
                    className="input-field pl-9 uppercase tracking-widest font-semibold"
                    value={orgData.code}
                    onChange={(e) => setOrgData({ ...orgData, code: e.target.value.toUpperCase() })}
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                  Code is provided by your Super Admin
                </p>
              </div>

              <button
                id="org-login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-2.5 flex justify-center items-center text-lg shadow-lg shadow-primary/20"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Sign In as Branch Owner'}
              </button>
            </form>
          )}

          {/* ══════════════════════════════════════
              CUSTOMER TAB — email + password flow
          ══════════════════════════════════════ */}
          {!isOrg && (
            <>
              <form className="space-y-6" onSubmit={handleCustomerSubmit}>
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <div className="mt-1">
                      <input
                        name="name"
                        type="text"
                        required
                        className="input-field"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      name="email"
                      type="email"
                      required
                      className="input-field"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      name="password"
                      type="password"
                      required
                      className="input-field"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      Remember me
                    </label>
                  </div>

                  {mode === 'login' && (
                    <div className="text-sm">
                      <a href="#" className="font-medium text-primary hover:text-primary-dark">
                        Forgot password?
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary py-2.5 flex justify-center items-center text-lg shadow-lg shadow-primary/20"
                  >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (mode === 'login' ? 'Sign In' : 'Sign Up')}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      {mode === 'login' ? 'New to DineOps?' : 'Already have an account?'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
                    className="font-medium text-primary hover:text-primary-dark transition-colors"
                  >
                    {mode === 'login' ? 'Create a new account' : 'Sign in to your account'}
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default AuthForms;

