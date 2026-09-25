import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, ChevronRight, Store, Smartphone, TrendingUp } from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect them based on their role
  useEffect(() => {
    if (user) {
      if (['SUPER_ADMIN', 'ORGANIZATION_OWNER', 'FRANCHISE_OWNER'].includes(user.role)) {
        navigate('/admin/dashboard');
      } else {
        navigate('/branches');
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col">
      {/* Header */}
      <header className="h-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center space-x-2">
          <UtensilsCrossed className="w-8 h-8 text-primary dark:text-primary-dark" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">DineOps</span>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/auth?tab=branch" className="hidden sm:inline-block text-gray-600 dark:text-gray-300 text-sm font-medium hover:text-primary transition-colors">
            Branch Portal
          </Link>
          <Link to="/auth?tab=customer&mode=login" className="text-gray-600 dark:text-gray-300 text-sm font-medium hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link to="/auth?tab=customer&mode=signup" className="btn-primary flex items-center shadow-md shadow-primary/20 text-sm py-2 px-4">
            Order Food
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-primary-dark/10 rounded-full blur-3xl"></div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 max-w-4xl relative z-10">
          The Intelligent Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Modern Restaurants</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl relative z-10">
          Scale your franchise from a single branch to hundreds. Manage menus, process orders, and view live analytics—all in one place.
        </p>
        
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 relative z-10">
          <Link to="/auth?tab=customer&mode=login" className="btn-primary px-8 py-4 text-lg rounded-xl shadow-xl shadow-primary/30 flex items-center justify-center hover:-translate-y-1 transition-all">
            Order as Customer <ChevronRight className="ml-2 w-5 h-5" />
          </Link>
          <Link to="/auth?tab=branch" className="px-8 py-4 text-lg rounded-xl font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all flex items-center justify-center hover:-translate-y-1">
            Branch Owner Login
          </Link>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full relative z-10">
          <div className="card bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700 p-8 text-left hover:-translate-y-2 transition-transform duration-300">
            <Store className="w-12 h-12 text-primary dark:text-primary-dark mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Multi-Branch Sync</h3>
            <p className="text-gray-600 dark:text-gray-400">Manage multiple restaurant locations from a single unified dashboard.</p>
          </div>
          <div className="card bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700 p-8 text-left hover:-translate-y-2 transition-transform duration-300 delay-100">
            <Smartphone className="w-12 h-12 text-primary dark:text-primary-dark mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mobile POS</h3>
            <p className="text-gray-600 dark:text-gray-400">Lightning fast, beautiful ordering interface for customers and waiters.</p>
          </div>
          <div className="card bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700 p-8 text-left hover:-translate-y-2 transition-transform duration-300 delay-200">
            <TrendingUp className="w-12 h-12 text-primary dark:text-primary-dark mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Real-time Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400">Track revenue, kitchen queues, and staff performance in real-time.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
