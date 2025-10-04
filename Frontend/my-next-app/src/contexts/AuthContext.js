'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, apiUtils } from '@/lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (apiUtils.isAuthenticated()) {
        const response = await authAPI.getCurrentUser();
        setUser(response.data.user);
        setCompany(response.data.company);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      apiUtils.removeAuthToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        apiUtils.setAuthToken(response.token);
        setUser(response.data.user);
        setCompany(response.data.company);
        setIsAuthenticated(true);
        return { success: true, message: response.message, user: response.data.user };
      }
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.signup(userData);
      
      if (response.success) {
        // Don't set token or authenticate yet - user needs to verify email first
        return { success: true, message: response.message, user: response.data.user };
      }
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      setLoading(true);
      const response = await authAPI.verifyEmail(email, code);
      
      if (response.success) {
        return { success: true, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (email) => {
    try {
      setLoading(true);
      const response = await authAPI.resendVerification(email);
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };


  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await authAPI.forgotPassword(email);
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      const response = await authAPI.resetPassword(token, password);
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };


  const logout = () => {
    apiUtils.logout();
    setUser(null);
    setCompany(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  const value = {
    user,
    company,
    loading,
    isAuthenticated,
    login,
    signup,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
