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
      console.log('Checking auth status...');
      if (apiUtils.isAuthenticated()) {
        console.log('Token exists, fetching user data...');
        const response = await authAPI.getCurrentUser();
        console.log('User data response:', response);
        if (response.success) {
          console.log('Setting user and company data');
          setUser(response.data.user);
          setCompany(response.data.company);
          setIsAuthenticated(true);
        } else {
          console.log('User data fetch failed, clearing auth');
          // If response is not successful, clear auth
          apiUtils.removeAuthToken();
          setIsAuthenticated(false);
        }
      } else {
        console.log('No token found, user not authenticated');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Don't automatically clear token - let user manually logout
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log('Attempting login...');
      const response = await authAPI.login(credentials);
      console.log('Login response:', response);
      
      if (response.success && response.token) {
        console.log('Login successful, setting token and user data');
        // Set token first before updating state
        apiUtils.setAuthToken(response.token);
        
        // Wait a tick to ensure localStorage is updated
        await new Promise(resolve => setTimeout(resolve, 0));
        
        setUser(response.data.user);
        setCompany(response.data.company);
        setIsAuthenticated(true);
        console.log('User authenticated:', response.data.user);
        console.log('Token stored:', apiUtils.getAuthToken());
        return { success: true, message: response.message, user: response.data.user };
      } else {
        console.log('Login failed:', response.message || 'No token received');
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
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
