"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'paciente' | 'profissional';
  role?: 'USER' | 'ADMIN';
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

// Sample users data - in a real app, this would come from your database
let sampleUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    type: 'paciente',
    telefone: '(11) 99999-9999',
    dataNascimento: '1990-05-15',
    genero: 'masculino',
    endereco: 'Rua das Flores, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567'
  },
  {
    id: '2',
    name: 'Dr. Ana Silva',
    email: 'ana@email.com',
    type: 'profissional',
    crp: 'CRP 06/123456',
    especialidades: ['Ansiedade', 'Depressão', 'Terapia Cognitivo-Comportamental'],
    formacao: 'Psicologia - Universidade de São Paulo',
    experiencia: '8 anos',
    bio: 'Especialista em terapia cognitivo-comportamental com foco em transtornos de ansiedade e depressão. Atendimento presencial e online.',
    valorConsulta: '150',
    aceitaOnline: true,
    aceitaPresencial: true,
    horariosDisponibilidade: 'Segunda a Sexta, 8h às 18h'
  },
  {
    id: '3',
    name: 'Maria Santos',
    email: 'maria@email.com',
    type: 'paciente',
    telefone: '(11) 88888-8888',
    dataNascimento: '1985-03-20',
    genero: 'feminino',
    endereco: 'Av. Paulista, 456',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01310-100'
  },
  {
    id: '4',
    name: 'Dr. Carlos Mendes',
    email: 'carlos@email.com',
    type: 'profissional',
    crp: 'CRP 05/789012',
    especialidades: ['Terapia de Casal', 'Família', 'Psicologia Positiva'],
    formacao: 'Psicologia - PUC-SP',
    experiencia: '12 anos',
    bio: 'Especialista em terapia familiar e de casal, com vasta experiência em resolução de conflitos e fortalecimento de relacionamentos.',
    valorConsulta: '180',
    aceitaOnline: true,
    aceitaPresencial: true,
    horariosDisponibilidade: 'Terça a Quinta, 14h às 20h'
  },
  {
    id: '5',
    name: 'Admin OASIS da Superdotação',
    email: 'admin@admin.com',
    type: 'profissional',
    role: 'ADMIN',
    crp: 'CRP 06/000000',
    especialidades: ['Administração', 'Gestão'],
    formacao: 'Psicologia - USP',
    experiencia: '15 anos',
    bio: 'Administrador do OASIS da Superdotação',
    valorConsulta: '0',
    aceitaOnline: false,
    aceitaPresencial: false,
    horariosDisponibilidade: 'Segunda a Sexta, 8h às 18h'
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('psicoasis_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
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
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find admin user in sample data
    const foundUser = sampleUsers.find(u => 
      u.email === email && u.type === 'profissional' && u.role === 'ADMIN'
    );
    
    if (foundUser) {
      // Validate specific admin credentials
      if (email === 'admin@admin.com' && password === 'Creative1@') {
        setUser(foundUser);
        localStorage.setItem('psicoasis_user', JSON.stringify(foundUser));
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    }
    
    setIsLoading(false);
    return false;
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
            especialidades: (userData as any).especialidades,
            formacao: (userData as any).formacao,
            experiencia: (userData as any).experiencia,
            bio: (userData as any).bio,
            valorConsulta: (userData as any).valorConsulta,
            aceitaOnline: (userData as any).aceitaOnline,
            aceitaPresencial: (userData as any).aceitaPresencial,
            horariosDisponibilidade: (userData as any).horariosDisponibilidade
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
