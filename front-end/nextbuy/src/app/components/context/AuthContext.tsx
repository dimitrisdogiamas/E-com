'use client';

// θα φτίαξουμε το authContext για να έχουμε global state για το auth
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../../types/user';
import { login as loginService } from '../../services/authService';
// ορίζουμε τον τύπο του authContext
type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// δημιουργούμε το authContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// we create the auth provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // fetch the user data from the server
  useEffect(() => {
    //receive the token from the local storage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);


  // login function 
  const login = async(email: string, password: string) => {
    const data = await loginService(email, password) // we await the login service
    setToken(data.token);
    setUser(data.user);
 // we store the token and the user in local storage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  // logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
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

