import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore authentication on boot
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: jwt, role, firstName, lastName, id } = response.data;

      const userProfile: User = { id, email, firstName, lastName, role };

      // Commit to state
      setToken(jwt);
      setUser(userProfile);

      // Commit to storage
      if (rememberMe) {
        localStorage.setItem('token', jwt);
        localStorage.setItem('user', JSON.stringify(userProfile));
      } else {
        sessionStorage.setItem('token', jwt);
        sessionStorage.setItem('user', JSON.stringify(userProfile));
        // Also add fallback to local storage so interceptor can fetch it, but clear it on tab close
        localStorage.setItem('token', jwt);
        localStorage.setItem('user', JSON.stringify(userProfile));
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, logout }}>
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
