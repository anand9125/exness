"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { backendUrl } from './url';

interface User {
  id: string;
  username: string;
  balance?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, userId: string) => void;
  logout: () => void;
  fetchBalance: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    if (userId && username) {
      setUser({ id: userId, username });
      fetchUserBalance(userId);
    }

    setIsLoading(false);
  }, []);

  const fetchUserBalance = async (userId: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${backendUrl}/user/balance`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        setUser(prev => prev ? { ...prev, balance: parseFloat(data.usd_balance || '0') } : null);
      }
    } catch (error) {
      console.error('Failed to fetch balance for user:', userId, error);
    }
  };

  const login = (username: string, userId: string) => {
    const newUser = { id: userId, username };
    setUser(newUser);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    fetchUserBalance(userId);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('token');
  };

  const fetchBalance = () => fetchUserBalance(user?.id || '');

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    fetchBalance
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
