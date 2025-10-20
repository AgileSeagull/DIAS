import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await apiClient.get('/api/auth/me');
          setUser(response.data.data);
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      const { user, token } = response.data.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, user };
    } catch (error) {
      let message = error.response?.data?.message || 'Login failed';
      
      // If there are validation errors, show them
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        message = errors.map(e => e.message).join('. ');
      }
      
      return { success: false, error: message };
    }
  };

  const signup = async (email, password, name, phone) => {
    try {
      const response = await apiClient.post('/api/auth/register', {
        email,
        password,
        name,
        phone,
      });
      const { user, token } = response.data.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, user };
    } catch (error) {
      let message = error.response?.data?.message || 'Signup failed';
      
      // If there are validation errors, show them
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        message = errors.map(e => e.message).join('. ');
      }
      
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

