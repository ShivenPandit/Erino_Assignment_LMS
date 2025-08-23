import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';

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
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking authentication status...');
      console.log('Current cookies:', document.cookie);
      
      // Check authentication status using cookies
      const response = await api.get('/api/auth/me');
      console.log('Auth check response:', response.data);
      
      if (response.data.success) {
        console.log('User authenticated:', response.data.data.user);
        setUser(response.data.data.user);
      } else {
        console.log('Auth check failed:', response.data);
        setUser(null);
      }
    } catch (error) {
      // User is not authenticated or token is invalid
      console.log('User not authenticated or token invalid:', error);
      console.log('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data
      });
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      console.log('Login response:', response.data);
      console.log('Cookies after login:', document.cookie);

      if (response.data.success) {
        setUser(response.data.data.user);
        // Store session ID for cross-domain authentication
        if (response.data.data.sessionId) {
          localStorage.setItem('sessionId', response.data.data.sessionId);
          console.log('Session ID stored for cross-domain use');
        }
        console.log('Login successful, user set:', response.data.data.user);
        toast.success('Login successful!');
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      console.log('Login error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data
      });
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);

      if (response.data.success) {
        setUser(response.data.data.user);
        // Store session ID for cross-domain authentication
        if (response.data.data.sessionId) {
          localStorage.setItem('sessionId', response.data.data.sessionId);
          console.log('Session ID stored for cross-domain use');
        }
        toast.success('Registration successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
      setUser(null);
      // Clear session ID from localStorage
      localStorage.removeItem('sessionId');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state even if logout request fails
      setUser(null);
      localStorage.removeItem('sessionId');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/api/auth/profile', profileData);
      
      if (response.data.success) {
        setUser(response.data.data.user);
        toast.success('Profile updated successfully');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
