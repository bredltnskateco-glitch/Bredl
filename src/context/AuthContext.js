import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, mfaApi, ensureCsrfToken } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Two-stage login state: when the server returns mfaRequired, we hold the
  // short-lived challenge token here until the user submits a TOTP / backup code.
  const [pendingMfa, setPendingMfa] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const { user: me } = await authApi.me();
      setUser(me);
      return me;
    } catch (err) {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      // Prime CSRF cookie so the first mutating request doesn't pay an extra round-trip.
      await ensureCsrfToken();
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = async (email, password) => {
    try {
      const result = await authApi.login(email, password);
      if (result.mfaRequired && result.challengeToken) {
        setPendingMfa({ challengeToken: result.challengeToken, email });
        return { success: true, mfaRequired: true };
      }
      setPendingMfa(null);
      setUser(result.user);
      return {
        success: true,
        user: result.user,
        mfaSetupRequired: result.mfaSetupRequired === true,
      };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid email or password' };
    }
  };

  const verifyMfaLogin = async ({ code, backupCode }) => {
    if (!pendingMfa) {
      return { success: false, error: 'No MFA challenge in progress' };
    }
    try {
      const { user: signedIn } = await mfaApi.verifyLogin(pendingMfa.challengeToken, { code, backupCode });
      setUser(signedIn);
      setPendingMfa(null);
      return { success: true, user: signedIn };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid MFA code' };
    }
  };

  const cancelMfaLogin = () => setPendingMfa(null);

  const register = async (payload) => {
    try {
      const { user: created } = await authApi.register(payload);
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

  const logout = async () => {
    try { await authApi.logout(); } catch (_) { /* server-side may already be gone */ }
    setUser(null);
    setPendingMfa(null);
  };

  const isAdmin = () => user?.role === 'admin';
  const isClient = () => user?.role === 'client';
  const isAuthenticated = () => !!user;
  const mfaEnabled = () => !!user?.mfaEnabled;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      pendingMfa,
      login,
      verifyMfaLogin,
      cancelMfaLogin,
      register,
      logout,
      updateProfile,
      refresh,
      isAdmin,
      isClient,
      isAuthenticated,
      mfaEnabled,
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
