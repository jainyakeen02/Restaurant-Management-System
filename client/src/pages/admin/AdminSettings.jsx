import React from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Shield, LogOut, Bell, Palette } from 'lucide-react';

const AdminSettings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth?mode=login');
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account and platform preferences.</p>
        </div>

        {/* Profile Card */}
        <div className="card bg-white dark:bg-gray-800 mb-6">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
              <input type="text" defaultValue={user?.name} className="input-field" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
              <input type="email" defaultValue={user?.email} className="input-field" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Role</label>
              <input type="text" defaultValue={user?.role?.replace(/_/g, ' ')} className="input-field capitalize" readOnly />
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="card bg-white dark:bg-gray-800 mb-6">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h2>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your account is secured with a bcrypt-hashed password. To change your password, contact the system administrator.
            </p>
            <button className="btn-primary">Change Password</button>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="card bg-white dark:bg-gray-800 mb-6">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
          </div>
          <div className="space-y-4">
            {['New Order Alerts', 'Branch Status Changes', 'New User Registrations'].map(label => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none">
                  <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white shadow-sm transition-transform"></span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card bg-white dark:bg-gray-800 border-2 border-red-100 dark:border-red-900/30">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-red-100 dark:border-red-900/30">
            <LogOut className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Danger Zone</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">Sign out of your account</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">You will be redirected to the login page.</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
