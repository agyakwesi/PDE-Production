import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored user", e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsInitialized(true);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isInitialized }}>
        {isInitialized ? children : (
          <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)' }}>
            <p style={{ color: 'var(--color-primary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              Initializing Matrix...
            </p>
          </div>
        )}
    </AuthContext.Provider>
  );
};
