import React, { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/axios';

export type Role = 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: Role;
  studentId: string | null;
  fullName: string | null;
  completionPercent: number | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string, refreshToken?: string) => void;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          if (data.success) {
            setUser({
              id: data.data.id,
              email: data.data.email,
              role: data.data.role,
              studentId: data.data.studentProfile?.studentId ?? null,
              fullName: data.data.studentProfile?.fullName ?? null,
              completionPercent: data.data.studentProfile?.completionPercent ?? null,
            });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('accessToken');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData: User, token: string, refreshToken?: string) => {
    localStorage.setItem('accessToken', token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed on server', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
