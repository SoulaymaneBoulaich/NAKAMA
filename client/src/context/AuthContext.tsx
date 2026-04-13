import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthResponse, SignupData, LoginData } from '../../../shared/types/index.js';
import api from '../api/axios';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalView: 'login' | 'signup';
  openAuthModal: (view?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login');

  // Sync user state with localStorage token
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    } else {
      localStorage.removeItem('accessToken');
    }
  }, [accessToken]);

  const refreshSession = async () => {
    try {
      const response = await api.post<AuthResponse>('/auth/refresh');
      setUser(response.data.user);
      setAccessToken(response.data.accessToken);
    } catch (error) {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    setUser(response.data.user);
    setAccessToken(response.data.accessToken);
  };

  const signup = async (data: SignupData) => {
    const response = await api.post<AuthResponse>('/auth/signup', data);
    setUser(response.data.user);
    setAccessToken(response.data.accessToken);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    setAccessToken(null);
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const openAuthModal = (view: 'login' | 'signup' = 'login') => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout, 
      refreshSession,
      isAuthModalOpen,
      authModalView,
      openAuthModal,
      closeAuthModal
    }}>
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
