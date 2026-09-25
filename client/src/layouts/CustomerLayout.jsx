import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UtensilsCrossed,
  Store,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  Building2,
  LayoutDashboard,
  LogIn,
  Truck
} from 'lucide-react';

const CustomerLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLoginMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isStaff = user && ['SUPER_ADMIN', 'ORGANIZATION_OWNER', 'FRANCHISE_OWNER'].includes(user.role);

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo: Always routes to Default Restaurant Selection / */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Dine<span className="text-primary">Ops</span>
              </span>
            </Link>

            {/* Middle Nav Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Store className="w-4 h-4" />
                <span>All Branches</span>
              </Link>
              <Link 
                to="/order" 
                className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Browse Menu</span>
              </Link>
              <button 
                onClick={() => {
                  const lastOrder = localStorage.getItem('dineops_last_order');
                  if (lastOrder) {
                    navigate(`/track-order/${lastOrder}`);
                  } else {
                    navigate('/order');
                  }
                }}
                className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Truck className="w-4 h-4 text-emerald-500" />
                <span>Track Order</span>
              </button>
            </div>
            
            {/* Right Action: Multi-Role Login / User Profile */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {user ? (
                /* Authenticated User Menu */
                <div className="flex items-center space-x-3">
                  {/* Dashboard link for Admins / Franchise Owners */}
                  {isStaff && (
                    <Link
                      to="/admin/dashboard"
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:text-primary text-xs font-bold rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <div className="hidden sm:flex items-center space-x-2 bg-gray-50 dark:bg-gray-700/60 px-3 py-1.5 rounded-full border border-gray-200/80 dark:border-gray-600">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 max-w-[120px] truncate">
                      {user.name || 'User'}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs font-bold">Sign Out</span>
                  </button>
                </div>
              ) : (
                /* Unauthenticated: Top Right Multi-Role Login Dropdown */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setLoginMenuOpen(!loginMenuOpen)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:bg-rose-700 transition-all shadow-sm shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${loginMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Multi-Role Login Dropdown Menu */}
                  {loginMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                          Choose Account Type
                        </span>
                      </div>

                      {/* 1. Customer Login */}
                      <Link
                        to="/auth?tab=customer&mode=login"
                        onClick={() => setLoginMenuOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-rose-50/70 dark:hover:bg-rose-950/20 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                            Customer Sign In
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            Order food, browse menus & track orders
                          </p>
                        </div>
                      </Link>

                      {/* 2. Branch Owner Login */}
                      <Link
                        to="/auth?tab=branch"
                        onClick={() => setLoginMenuOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-amber-50/70 dark:hover:bg-amber-950/20 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">
                            Branch Owner Login
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            Manage restaurant orders, kitchen & billing
                          </p>
                        </div>
                      </Link>

                      {/* 3. Admin Portal */}
                      <Link
                        to="/auth?tab=admin"
                        onClick={() => setLoginMenuOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50/70 dark:hover:bg-blue-950/20 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            Administrator Portal
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            Platform control, menu setup & analytics
                          </p>
                        </div>
                      </Link>

                      <div className="p-2.5 pt-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750 text-center">
                        <Link
                          to="/auth"
                          onClick={() => setLoginMenuOpen(false)}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          View Full Authentication Hub &rarr;
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto pb-24 sm:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 px-6 py-2.5 flex justify-around items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <Link to="/" className="flex flex-col items-center text-primary dark:text-primary-dark">
          <Store className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium">Branches</span>
        </Link>
        <Link to="/order" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-primary">
          <UtensilsCrossed className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium">Menu</span>
        </Link>
        {user ? (
          <button onClick={handleLogout} className="flex flex-col items-center text-red-500 hover:text-red-700 transition-colors">
            <LogOut className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] font-medium">Sign Out</span>
          </button>
        ) : (
          <Link to="/auth" className="flex flex-col items-center text-primary">
            <LogIn className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] font-medium">Sign In</span>
          </Link>
        )}
      </nav>
    </div>
  );
};

export default CustomerLayout;
