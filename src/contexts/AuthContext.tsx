"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'paciente' | 'profissional';
  role?: 'USER' | 'ADMIN';
  photoUrl?: string;
  // Patient specific fields
  telefone?: string;
  dataNascimento?: string;
  genero?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  // Professional specific fields
  crp?: string;
  abordagens?: string[];
  especialidades?: string[];
  formacao?: string;
  experiencia?: string;
  bio?: string;
  valorConsulta?: string;
  aceitaOnline?: boolean;
  aceitaPresencial?: boolean;
  horariosDisponibilidade?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, userType: 'paciente' | 'profissional') => Promise<boolean>;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id'>) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const parseJwtPayload = (token: string) => {
    try {
      const payload = token.split(".")[1];
      if (!payload) return null;
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
      const decoded = atob(padded);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  };

  const getUserFromToken = (token: string): User | null => {
    const payload = parseJwtPayload(token);
    if (!payload) return null;
    if (payload.exp && Date.now() >= payload.exp * 1000) return null;
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name ?? "",
      type: payload.type,
      role: payload.role ?? "USER"
    } as User;
  };

  useEffect(() => {
    // Check if user is logged in on app start
    const savedToken = localStorage.getItem('psicoasis_token');
    if (savedToken) {
      const tokenUser = getUserFromToken(savedToken);
      if (tokenUser) {
        setUser(tokenUser);
      } else {
        localStorage.removeItem('psicoasis_token');
      }
    }
    if (!savedToken) {
      const savedUser = localStorage.getItem('psicoasis_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, userType: 'paciente' | 'profissional'): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: userType })
      });
      if (!res.ok) {
        setIsLoading(false);
        return false;
      }
      const data = await res.json();
      setUser(data.user);
      if (data.token) {
        localStorage.setItem('psicoasis_token', data.token);
      }
      localStorage.setItem('psicoasis_user', JSON.stringify(data.user));
      setIsLoading(false);
      return true;
    } catch (e) {
      setIsLoading(false);
      // Signal error so UI can show the generic error msg (handled by pages)
      return false;
    }
  };

  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        setIsLoading(false);
        return false;
      }

      const data = await res.json();
      setUser(data.user);
      if (data.token) {
        localStorage.setItem('psicoasis_token', data.token);
      }
      localStorage.setItem('psicoasis_user', JSON.stringify(data.user));
      setIsLoading(false);
      return true;
    } catch {
      setIsLoading(false);
      return false;
    }
  };

  const register = async (userData: Omit<User, 'id'>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userData.email, 
          name: userData.name, 
          type: userData.type,
          profile: {
            telefone: userData.telefone,
            dataNascimento: (userData as any).dataNascimento,
            genero: (userData as any).genero,
            endereco: (userData as any).endereco,
            cidade: (userData as any).cidade,
            estado: (userData as any).estado,
            cep: (userData as any).cep,
            crp: (userData as any).crp,
            abordagens: (userData as any).abordagens,
            especialidades: (userData as any).especialidades,
            formacao: (userData as any).formacao,
            experiencia: (userData as any).experiencia,
            bio: (userData as any).bio,
            valorConsulta: (userData as any).valorConsulta,
            photoUrl: (userData as any).photoUrl,
            aceitaOnline: (userData as any).aceitaOnline,
            aceitaPresencial: (userData as any).aceitaPresencial
          }
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
        console.error('Registration error:', errorData);
        setIsLoading(false);
        // Return false for email conflicts (409), throw for other errors
        if (res.status === 409) {
          return false;
        }
        throw new Error(errorData.error || 'Erro ao criar conta');
      }
      
      const created = await res.json();
      const normalized: User = {
        id: created.id,
        email: created.email,
        name: created.name,
        type: created.type,
        role: created.role ?? 'USER'
      };
      setUser(normalized);
      if (created.token) {
        localStorage.setItem('psicoasis_token', created.token);
      }
      localStorage.setItem('psicoasis_user', JSON.stringify(normalized));
      setIsLoading(false);
      return true;
    } catch (e: any) {
      console.error('Registration exception:', e);
      setIsLoading(false);
      // Re-throw to allow UI to show error message
      throw e;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('psicoasis_user');
    localStorage.removeItem('psicoasis_token');
  };

  const value = {
    user,
    login,
    loginAdmin,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
