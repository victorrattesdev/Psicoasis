"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedUserTypes?: ('paciente' | 'profissional')[];
}

export default function ProtectedRoute({ 
  children, 
  allowedUserTypes = ['paciente', 'profissional'] 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (user && !allowedUserTypes.includes(user.type)) {
        // Redirect to appropriate dashboard based on user type
        if (user.type === 'paciente') {
          router.push('/dashboard/paciente');
        } else {
          router.push('/dashboard/profissional');
        }
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, allowedUserTypes, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (!allowedUserTypes.includes(user.type)) {
    return null;
  }

  return <>{children}</>;
}

