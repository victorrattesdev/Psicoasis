"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

type ActivityItem = {
  id: string;
  type: "user" | "therapist" | "post";
  title: string;
  description: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ users: number; therapists: number; posts: number; sessions: number; sessionsCompleted: number; sessionsScheduled: number } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("psicoasis_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const load = async () => {
      setIsLoadingStats(true);
      try {
        const res = await fetch('/api/stats/admin', { cache: 'no-store' });
        if (!res.ok) {
          console.error('Failed to load stats:', res.status);
          return;
        }
        const data = await res.json();
        console.log('Stats loaded:', data);
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadActivity = async () => {
      setIsLoadingActivity(true);
      try {
        const res = await fetch('/api/admin/activity', {
          cache: 'no-store',
          headers: getAuthHeaders(),
        });
        if (!res.ok) {
          console.error('Failed to load activity:', res.status);
          return;
        }
        const data = await res.json();
        setRecentActivity(Array.isArray(data?.activities) ? data.activities : []);
      } catch (error) {
        console.error('Error loading activity:', error);
      } finally {
        setIsLoadingActivity(false);
      }
    };
    loadActivity();
  }, []);

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const time = date.getTime();
    if (Number.isNaN(time)) return "";
    const diffMs = Date.now() - time;
    if (diffMs <= 0) return "agora mesmo";
    const minutes = Math.floor(diffMs / 1000 / 60);
    if (minutes < 1) return "agora mesmo";
    if (minutes < 60) return `há ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours} ${hours === 1 ? "hora" : "horas"}`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `há ${days} ${days === 1 ? "dia" : "dias"}`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `há ${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
    const months = Math.floor(days / 30);
    if (months < 12) return `há ${months} ${months === 1 ? "mês" : "meses"}`;
    const years = Math.floor(days / 365);
    return `há ${years} ${years === 1 ? "ano" : "anos"}`;
  };

  const activityMeta: Record<ActivityItem["type"], { bg: string; text: string; icon: JSX.Element }> = {
    post: {
      bg: "bg-green-100",
      text: "text-green-600",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    user: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    therapist: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  };

  // Check if user is admin
  if (user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="mt-2 text-gray-600">Gerencie o OASIS da Superdotação</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pacientes</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {isLoadingStats ? '...' : (stats?.users ?? 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Psicólogos</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {isLoadingStats ? '...' : (stats?.therapists ?? 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Artigos Publicados</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {isLoadingStats ? '...' : (stats?.posts ?? 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Blog Management */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Gerenciar Blog</h2>
                <Link
                  href="/dashboard/admin/blog"
                  className="text-green-600 hover:text-green-500 text-sm font-medium"
                >
                  Ver todos
                </Link>
              </div>
              <p className="text-gray-600 mb-4">
                Gerencie os artigos e posts do blog. Crie, edite e publique conteúdo para seus usuários.
              </p>
              <div className="flex space-x-3">
                <Link
                  href="/dashboard/admin/blog"
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Gerenciar Posts
                </Link>
                <Link
                  href="/dashboard/admin/blog/new"
                  className="bg-white text-green-600 border border-green-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-green-50 transition-colors"
                >
                  Novo Post
                </Link>
              </div>
            </div>

            {/* User Management */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Gerenciar Usuários</h2>
                <Link
                  href="/dashboard/admin/users"
                  className="text-green-600 hover:text-green-500 text-sm font-medium"
                >
                  Ver todos
                </Link>
              </div>
              <p className="text-gray-600 mb-4">
                Gerencie usuários, psicólogos e permissões do sistema.
              </p>
              <div className="flex space-x-3">
                <Link
                  href="/dashboard/admin/users"
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Ver Usuários
                </Link>
              </div>
            </div>

          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Atividade Recente</h2>
            </div>
            <div className="p-6">
              {isLoadingActivity ? (
                <p className="text-sm text-gray-500">Carregando atividade recente...</p>
              ) : recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma atividade recente encontrada.</p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const meta = activityMeta[activity.type];
                    const relativeTime = formatRelativeTime(activity.createdAt);
                    return (
                      <div key={`${activity.type}-${activity.id}`} className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`h-8 w-8 rounded-full ${meta.bg} ${meta.text} flex items-center justify-center`}>
                            {meta.icon}
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-500">
                            {activity.description} {relativeTime && `· ${relativeTime}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
