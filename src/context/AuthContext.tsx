import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../lib/api';
import type { UserProfile } from '../lib/api';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount if a token exists
  useEffect(() => {
    const restore = async () => {
      if (!api.tokenStore.getAccess()) {
        setLoading(false);
        return;
      }
      try {
        const profile = await api.getMe();
        setUser(profile);
      } catch {
        api.tokenStore.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const profile = await api.login(email, password);
    setUser(profile);
    return profile;
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    await api.register(email, password);
    // Backend requires email verification before login —
    // the caller shows a "check your inbox" message instead of logging in.
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAdmin: api.isAdmin(user) }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
