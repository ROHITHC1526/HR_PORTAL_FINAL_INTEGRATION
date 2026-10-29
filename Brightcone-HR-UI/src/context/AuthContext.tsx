import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth.api';
import { LoginPayload, RegisterPayload, User } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('brightcone_user') || localStorage.getItem('user');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const currentUser = await authApi.getMe();
      setUser(currentUser);
      localStorage.setItem('brightcone_user', JSON.stringify(currentUser));
      localStorage.setItem('user', JSON.stringify(currentUser));
    } catch {
      // If unauthorized and no token, clear user
      const token = localStorage.getItem('brightcone_token') || localStorage.getItem('token');
      if (!token) {
        setUser(null);
        localStorage.removeItem('brightcone_user');
        localStorage.removeItem('user');
        localStorage.removeItem('brightcone_token');
        localStorage.removeItem('token');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(payload);
      setUser(res.user);
      localStorage.setItem('brightcone_user', JSON.stringify(res.user));
      localStorage.setItem('user', JSON.stringify(res.user));
      if (res.token) {
        localStorage.setItem('brightcone_token', res.token);
        localStorage.setItem('token', res.token);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('brightcone_auth_change', { detail: { user: res.user } }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(payload);
      setUser(res.user);
      localStorage.setItem('brightcone_user', JSON.stringify(res.user));
      localStorage.setItem('user', JSON.stringify(res.user));
      if (res.token) {
        localStorage.setItem('brightcone_token', res.token);
        localStorage.setItem('token', res.token);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('brightcone_auth_change', { detail: { user: res.user } }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      localStorage.removeItem('brightcone_user');
      localStorage.removeItem('user');
      localStorage.removeItem('brightcone_token');
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('brightcone_auth_change', { detail: { user: null } }));
      }
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
