import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Stub Components for initial routing
const AdminLogin = () => <div className="p-8 text-center"><h1 className="text-2xl font-bold mb-4">Admin Login</h1><p>Login form will go here.</p></div>;
const AdminDashboard = () => <div className="p-8 text-center"><h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1><p>Dashboard charts will go here.</p></div>;
const CustomerMenu = () => <div className="p-8 text-center"><h1 className="text-2xl font-bold mb-4">Customer Menu</h1><p>Mobile friendly ordering system.</p></div>;

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/order" replace />} />
        <Route path="/order" element={<CustomerMenu />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Admin Routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_OWNER']}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          } 
        />
        
        {/* Fallbacks */}
        <Route path="/unauthorized" element={<div className="p-8 text-center text-red-500">Unauthorized Access</div>} />
        <Route path="*" element={<div className="p-8 text-center">404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
