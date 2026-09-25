import React, { useState } from 'react';
import { LayoutDashboard, Users, UtensilsCrossed, Settings, Menu as MenuIcon, Bell, X, LogOut, Store, ChefHat } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getNavItems = () => {
    const role = user?.role || 'SUPER_ADMIN';
    if (role === 'SUPER_ADMIN') {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { label: 'Branches', icon: Store, path: '/admin/branches' },
        { label: 'Branch Owners', icon: Users, path: '/admin/branch-owners' },
        { label: 'Menu Management', icon: UtensilsCrossed, path: '/admin/menu' },
        { label: 'Settings', icon: Settings, path: '/admin/settings' },
      ];
    } else {
      // Branch Owner (FRANCHISE_OWNER)
      return [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { label: 'Billing / Desk', icon: UtensilsCrossed, path: '/admin/billing' },
        { label: 'Kitchen Display', icon: ChefHat, path: '/admin/kitchen' },
        { label: 'Employees', icon: Users, path: '/admin/employees' },
        { label: 'Settings', icon: Settings, path: '/admin/settings' },
      ];
    }
  };

  const NAV_ITEMS = getNavItems();

  const handleLogout = () => {
    logout();
    navigate('/auth?mode=login');
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
          <span className="text-2xl font-bold text-primary dark:text-primary-dark">DineOps</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary dark:text-primary-dark font-medium' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary dark:text-primary-dark' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 z-10">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-500 hover:text-primary transition-colors"
          >
            <MenuIcon className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-4 ml-auto">
            <button className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 relative">
              <Bell className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3 border-l border-gray-200 dark:border-gray-700 pl-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-gray-700 dark:text-gray-200">{user?.name || 'Admin'}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs capitalize">{user?.role?.replace('_', ' ') || 'Super Admin'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
