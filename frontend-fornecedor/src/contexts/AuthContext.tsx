import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

interface Fornecedor {
  id_fornecedor: number;
  codigo_fornecedor_cocapec: string | null;
  nome_fornecedor: string;
  cnpj: string;
  contato: string | null;
  ativo: boolean;
}

interface AuthContextData {
  fornecedor: Fornecedor | null;
  signIn: (cnpj: string, senha: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(() => {
    const storagedFornecedor = localStorage.getItem('@COCAPEC_FORNECEDOR:user');
    const storagedToken = localStorage.getItem('@COCAPEC_FORNECEDOR:token');
    if (!storagedFornecedor || !storagedToken) return null;
    try {
      return JSON.parse(storagedFornecedor) as Fornecedor;
    } catch {
      return null;
    }
  });

  const signIn = async (cnpj: string, senha: string) => {
    // Remove formatting from CNPJ to send only numbers
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    const response = await api.post('/auth/fornecedor/login', { cnpj: cleanCnpj, senha });

    const { user, token } = response.data;

    localStorage.setItem('@COCAPEC_FORNECEDOR:user', JSON.stringify(user));
    localStorage.setItem('@COCAPEC_FORNECEDOR:token', token);

    setFornecedor(user);
  };

  const signOut = () => {
    localStorage.removeItem('@COCAPEC_FORNECEDOR:user');
    localStorage.removeItem('@COCAPEC_FORNECEDOR:token');
    setFornecedor(null);
  };

  return (
    <AuthContext.Provider
      value={{
        fornecedor,
        signIn,
        signOut,
        isAuthenticated: !!fornecedor,
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
