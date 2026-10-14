import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getToken, setToken } from '../lib/api';
import * as authService from '../services/auth';
import type { Client, RegisterInput } from '../services/auth';

interface AuthContextValue {
  client: Client | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    authService
      .me()
      .then(setClient)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setClient(await authService.login(email, password));
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    setClient(await authService.register(input));
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* token is cleared regardless */
    }
    setClient(null);
  }, []);

  return (
    <AuthContext.Provider value={{ client, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
