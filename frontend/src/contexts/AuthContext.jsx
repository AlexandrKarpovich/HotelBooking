import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await authAPI.getMe();
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    const response = await authAPI.login({ username, password });
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    const userResponse = await authAPI.getMe();
    setUser(userResponse.data);
    toast.success('Добро пожаловать!');
    return response.data;
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    toast.success('Регистрация успешна!');
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    toast.success('Вы вышли из системы');
  };

  const changePassword = async (currentPassword, newPassword) => {
    const response = await authAPI.changePassword({
      current_password: currentPassword,
      new_password: newPassword,
    });
    toast.success('Пароль успешно изменен');
    return response.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        changePassword,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isManager: user?.role === 'manager' || user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};