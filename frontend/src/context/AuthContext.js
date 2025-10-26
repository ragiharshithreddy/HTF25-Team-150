import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
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
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data);
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
  const response = await authAPI.login({ email, password });
  localStorage.setItem('token', response.token);
  setToken(response.token);
  setUser(response.user);
      toast.success('Login successful!');
      return response;
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
  const response = await authAPI.register(userData);
  localStorage.setItem('token', response.token);
  setToken(response.token);
  setUser(response.user);
      toast.success('Registration successful!');
      return response;
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local data anyway
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  const enterAsRole = (role) => {
    localStorage.removeItem('token');
    setToken(null);

    const demoUser = {
      id: `demo-${role}`,
      name: role === 'admin' ? 'Demo Admin' : 'Demo Student',
      email: role === 'admin' ? 'admin@demo.app' : 'student@demo.app',
      role,
    };

    setUser(demoUser);
    toast.success(`Now browsing as ${role}`);
    return demoUser;
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data);
      toast.success('Profile updated successfully');
      return response;
    } catch (error) {
      toast.error(error.message || 'Update failed');
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    enterAsRole,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
