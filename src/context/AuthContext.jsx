import React, { createContext, useState, useEffect } from 'react';
import { decodeToken } from '../utils/decodeToken';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(null);
   const [role, setRole] = useState(null);
   const [token, setToken] = useState(localStorage.getItem('token') || null);
   const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUser(decoded);
        setRole(decoded.role);
      } else {
        // Invalid token
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const decoded = decodeToken(newToken);
    if (decoded) {
      setUser(decoded);
      setRole(decoded.role);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
