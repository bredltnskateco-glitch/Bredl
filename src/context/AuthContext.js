import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, setToken, getToken } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return null;
    }
    try {
      const { user: me } = await authApi.me();
      setUser(me);
      return me;
    } catch (err) {
      setToken(null);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = async (email, password) => {
    try {
      const { user: signedIn, token } = await authApi.login(email, password);
      setToken(token);
      setUser(signedIn);
      return { success: true, user: signedIn };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid email or password' };
    }
  };

  const register = async (payload) => {
    try {
      const { user: created, token } = await authApi.register(payload);
      setToken(token);
      setUser(created);
      return { success: true, user: created };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const updateProfile = async (payload) => {
    try {
      const { user: updated } = await authApi.updateMe(payload);
      setUser(updated);
      return { success: true, user: updated };
    } catch (err) {
      return { success: false, error: err.message || 'Update failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin';
  const isClient = () => user?.role === 'client';
  const isAuthenticated = () => !!user;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      refresh,
      isAdmin,
      isClient,
      isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
