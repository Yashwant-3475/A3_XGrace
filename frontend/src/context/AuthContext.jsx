import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const BACKEND_URL = 'http://localhost:5000';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On startup: validate any stored token against the backend.
  // DO NOT trust localStorage blindly — always confirm with the server.
  useEffect(() => {
    const verifyStoredToken = async () => {
      const storedToken = localStorage.getItem('authToken');

      if (!storedToken) {
        // No token at all — user must log in
        setIsLoading(false);
        return;
      }

      try {
        // Ask the backend if this token is still valid
        const response = await axios.get(`${BACKEND_URL}/api/auth/validate`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (response.data.valid) {
          // Backend confirmed the token — safe to authenticate
          setToken(storedToken);
          // Restore the user object (name, email, role) from localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try { setUser(JSON.parse(storedUser)); } catch (_) { }
          }
        } else {
          // Backend rejected it — clear and force re-login
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        // Token expired, invalid signature, or server error — clear it
        console.warn('Token validation failed:', err.response?.data?.message || err.message);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyStoredToken();
  }, []);

  // Login: called after a successful POST /api/auth/login response
  // Accepts both the JWT token and the user object { id, name, email, role }
  const login = (newToken, newUser) => {
    localStorage.setItem('authToken', newToken);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
    }
    setToken(newToken);
  };

  // Logout: clear everything
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Only true after backend has confirmed the token
  const isAuthenticated = !!token;

  const value = {
    isAuthenticated,
    token,
    user,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;