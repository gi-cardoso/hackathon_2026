import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id_usuario: number;
  nome: string;
  matricula: string;
  email: string;
  ativo: boolean;
  role: string;
}

interface AuthContextData {
  user: User | null;
  signIn: (email: string, senha: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storagedUser = localStorage.getItem('@COCAPEC:user');
    const storagedToken = localStorage.getItem('@COCAPEC:token');

    if (storagedUser && storagedToken) {
      setUser(JSON.parse(storagedUser));
    }
  }, []);

  const signIn = async (email: string, senha: string) => {
    const response = await api.post('/auth/internal/login', { email, senha });

    const { user, token } = response.data;

    localStorage.setItem('@COCAPEC:user', JSON.stringify(user));
    localStorage.setItem('@COCAPEC:token', token);

    setUser(user);
  };

  const signOut = () => {
    localStorage.removeItem('@COCAPEC:user');
    localStorage.removeItem('@COCAPEC:token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
