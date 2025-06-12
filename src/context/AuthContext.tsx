
import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'cajero' | 'cocinero' | 'mesero' | 'usuario';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulated login - in real app this would be an API call
    console.log('Login attempt:', { email, password });
    
    // Demo users for testing
    const demoUsers: Record<string, User> = {
      'admin@casa.com': { id: '1', name: 'Admin Casa', email: 'admin@casa.com', role: 'admin' },
      'cajero@casa.com': { id: '2', name: 'Cajero Casa', email: 'cajero@casa.com', role: 'cajero' },
      'cocinero@casa.com': { id: '3', name: 'Cocinero Casa', email: 'cocinero@casa.com', role: 'cocinero' },
      'mesero@casa.com': { id: '4', name: 'Mesero Casa', email: 'mesero@casa.com', role: 'mesero' },
      'usuario@casa.com': { id: '5', name: 'Usuario Casa', email: 'usuario@casa.com', role: 'usuario' },
    };

    if (demoUsers[email] && password === '123456') {
      const userData = demoUsers[email];
      setUser(userData);
      localStorage.setItem('token', 'demo-jwt-token');
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }
    
    return false;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    // Simulated registration
    console.log('Register attempt:', userData);
    
    if (userData.password !== userData.confirmPassword) {
      return false;
    }
    
    if (!userData.acceptTerms) {
      return false;
    }

    // Create new user with 'usuario' role by default
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      role: 'usuario'
    };

    setUser(newUser);
    localStorage.setItem('token', 'demo-jwt-token');
    localStorage.setItem('user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
