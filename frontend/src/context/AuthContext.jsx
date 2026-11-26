import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('redstone_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and check token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('redstone_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (error) {
          console.error('[Auth] Token verification failed:', error);
          localStorage.removeItem('redstone_token');
          localStorage.removeItem('redstone_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('redstone_token', receivedToken);
    localStorage.setItem('redstone_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('redstone_token', receivedToken);
    localStorage.setItem('redstone_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const demoLogin = async (role) => {
    const demoAccounts = {
      admin: { email: 'admin@redstone.com', password: 'password123' },
      broker: { email: 'vikram.broker@redstone.com', password: 'password123' },
      owner: { email: 'amit.owner@example.com', password: 'password123' },
      client: { email: 'priya.client@example.com', password: 'password123' },
    };
    const creds = demoAccounts[role];
    if (creds) {
      return await login(creds.email, creds.password);
    }
  };

  const logout = () => {
    localStorage.removeItem('redstone_token');
    localStorage.removeItem('redstone_user');
    setUser(null);
    setToken(null);
    window.location.href = '/welcome';
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    setUser(res.data.user);
    localStorage.setItem('redstone_user', JSON.stringify(res.data.user));
    return res.data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        demoLogin,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
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
