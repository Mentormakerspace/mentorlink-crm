"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as backendLogin } from '../lib/apiClient';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, check localStorage for user and token
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { token, user } = await backendLogin(email, password);
      
      // Store auth data
      localStorage.setItem('jwt', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      setUser(user);
      
      // Force a state update
      setLoading(false);
      return true;
    } catch (error: any) {
      console.error('Login failed:', error.response?.data || error.message);
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    // Clear auth data
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    setUser(null);
    // Force a hard navigation to the login page
    window.location.href = '/login';
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

