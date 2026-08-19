import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import LandingPage from '../pages/LandingPage';
import AuthForms from '../pages/auth/AuthForms';
import OwnerLogin from '../pages/auth/OwnerLogin';
import BranchSelector from '../pages/customer/BranchSelector';
import CustomerMenu from '../pages/customer/CustomerMenu';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import BranchDashboard from '../pages/admin/BranchDashboard';
import AdminBranches from '../pages/admin/AdminBranches';
import AdminBranchOwners from '../pages/admin/AdminBranchOwners';
import AdminMenuManagement from '../pages/admin/AdminMenuManagement';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminSettings from '../pages/admin/AdminSettings';

import AdminBilling from '../pages/admin/AdminBilling';
import AdminEmployees from '../pages/admin/AdminEmployees';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Renders the correct dashboard depending on logged-in user's role
const DashboardRoute = () => {
  const { user } = useAuth();
  return user?.role === 'FRANCHISE_OWNER' ? <BranchDashboard /> : <AdminDashboard />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthForms />} />
        <Route path="/owner-login" element={<OwnerLogin />} />
        
        {/* Customer Protected Routes */}
        <Route path="/branches" element={<ProtectedRoute><BranchSelector /></ProtectedRoute>} />
        <Route path="/order/:branchId" element={<ProtectedRoute><CustomerMenu /></ProtectedRoute>} />
        
        {/* Protected Admin Routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_OWNER', 'FRANCHISE_OWNER']}>
              <Routes>
                <Route path="dashboard" element={<DashboardRoute />} />
                <Route path="branches" element={<AdminBranches />} />
                <Route path="branch-owners" element={<AdminBranchOwners />} />
                <Route path="menu" element={<AdminMenuManagement />} />
                <Route path="billing" element={<AdminBilling />} />
                <Route path="employees" element={<AdminEmployees />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          } 
        />
        
        {/* Fallbacks */}
        <Route path="/unauthorized" element={
          <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
            <h1 className="text-4xl font-bold text-red-500 mb-4">403</h1>
            <p className="text-gray-600 text-lg mb-6">You are not authorized to view this page.</p>
            <a href="/" className="btn-primary">Go Home</a>
          </div>
        } />
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">404</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">Page not found.</p>
            <a href="/" className="btn-primary">Go Home</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
