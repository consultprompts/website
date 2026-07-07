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
    // The OAuth callback page stores fresh tokens and immediately hard-redirects
    // to "/"; fetching /auth/me here would race that navigation — the aborted
    // fetch lands in the catch below and would wipe the just-stored tokens.
    if (window.location.pathname === '/auth/callback') {
      setLoading(false);
      return;
    }
    const restore = async () => {
      if (!api.tokenStore.getAccess()) {
        setLoading(false);
        return;
      }
      try {
        const profile = await api.getMe();
        setUser(profile);
      } catch (err) {
        // Only a real rejection means the session is dead — a network hiccup
        // or a fetch aborted by navigation must not wipe stored tokens.
        if (err instanceof api.APIError && (err.status === 401 || err.status === 403)) {
          api.tokenStore.clear();
        }
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
