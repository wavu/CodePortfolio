import React, { useState, createContext, useEffect } from 'react';
import { API_SAP } from '../App';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isValidating, setIsValidating] = useState(true);
  const isAuthenticated = user !== null;

  useEffect(() => {
    const validateToken = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser);

        try {
          const response = await fetch(`${API_SAP}/auth/validate-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            setUser(user);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Error al validar el token:', error);
          logout();
        }
      } else {
        logout();
      }

      setIsValidating(false);
    };

    validateToken();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, isAuthenticated, isValidating, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
