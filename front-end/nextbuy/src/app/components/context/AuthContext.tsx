'use client';

// θα φτίαξουμε το authContext για να έχουμε global state για το auth
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../../types/user';
import { login as loginService } from '../../services/authService';
import SecureStorage from '../../lib/secureStorage';
import { useErrorHandler } from '../../lib/errorHandler';

// ορίζουμε τον τύπο του authContext
type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// δημιουργούμε το authContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// we create the auth provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

  // fetch the user data from secure storage
  useEffect(() => {
    try {
      // Use secure storage instead of direct localStorage
      const storedToken = SecureStorage.getToken();
      const storedUser = SecureStorage.getUser();
      
      if (storedToken) {
        setToken(storedToken);
      }
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Failed to load auth data:', error);
      // Clear potentially corrupted data
      SecureStorage.clearAuth();
    }
  }, []);

  // login function 
  const login = async(email: string, password: string) => {
    try {
      const data = await loginService(email, password); // we await the login service
      
      setToken(data.accessToken);
      setUser(data.user);
      
      // Use secure storage with expiration
      SecureStorage.setToken(data.accessToken, 24); // 24 hours expiration
      SecureStorage.setUser(data.user);
    } catch (error) {
      const errorMessage = handleError(error, 'Login failed');
      throw new Error(errorMessage);
    }
  };

  // logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    // Clear all auth data securely
    SecureStorage.clearAuth();
  }

  // Check if user is authenticated
  const isAuthenticated = Boolean(token && user && SecureStorage.isAuthenticated());

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

