import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on initial mount
    const storedToken = localStorage.getItem('dineops_token');
    const storedUser = localStorage.getItem('dineops_user');

    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const customerLogin = async (identifier, password) => {
    try {
      const response = await apiClient.post('/auth/customer/login', { identifier, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('dineops_token', token);
      localStorage.setItem('dineops_user', JSON.stringify(userData));

      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Customer login failed. Please check your credentials.',
      };
    }
  };

  const customerRegister = async ({ name, email, phone, password }) => {
    try {
      const response = await apiClient.post('/auth/customer/register', { name, email, phone, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('dineops_token', token);
      localStorage.setItem('dineops_user', JSON.stringify(userData));

      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Customer registration failed.',
      };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/admin/login', { email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('dineops_token', token);
      localStorage.setItem('dineops_user', JSON.stringify(userData));

      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Admin login failed. Please check your email and password.',
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('dineops_token', token);
      localStorage.setItem('dineops_user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  /**
   * Owner Portal login — authenticates using Name + Code instead of email/password.
   * @param {string} name - Organisation or Branch name
   * @param {string} code - Unique access code created by Super Admin
   * @param {string} ownerType - 'organization' | 'branch'
   */
  const ownerLogin = async (name, code, ownerType) => {
    try {
      const response = await apiClient.post('/auth/owner-login', { name, code, ownerType });
      const { token, user: userData } = response.data;

      localStorage.setItem('dineops_token', token);
      localStorage.setItem('dineops_user', JSON.stringify(userData));

      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your Name and Code.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('dineops_token');
    localStorage.removeItem('dineops_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, customerLogin, customerRegister, adminLogin, ownerLogin, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

