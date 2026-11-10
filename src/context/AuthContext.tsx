import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAdminToken, setAdminToken } from '../services/api';

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextValue {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .adminMe()
      .then((res) => {
        setAdmin(res.admin);
      })
      .catch(() => {
        setAdminToken(null);
        setAdmin(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.adminLogin(email, password);
    setAdminToken(res.token);
    setAdmin(res.admin);
  };

  const logout = () => {
    setAdminToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
