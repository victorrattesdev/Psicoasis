"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Extend NormalizedUser with profile for full edit/view
type NormalizedUser = {
  id: string;
  name: string;
  email: string;
  type: 'paciente' | 'profissional';
  role: 'USER' | 'ADMIN';
  createdAt: string;
  lastLogin: string;
  crp?: string;
  especialidades?: string[];
  profile?: any;
  canPostBlog?: boolean;
};

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<NormalizedUser[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<{ name: string; email: string; profile: any }>({ name: "", email: "", profile: {} });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Same list used in registration for professionals
  const especialidadesOptions = [
    "Ansiedade",
    "Depressão",
    "Terapia Cognitivo-Comportamental",
    "Terapia de Casal",
    "Família",
    "Psicologia Positiva",
    "Trauma",
    "EMDR",
    "Psicologia Hospitalar",
    "Adolescentes",
    "TDAH",
    "Terapia Comportamental",
    "Gestão de Estresse",
    "Mindfulness",
    "Terapia Breve",
    "Dependência Química",
    "Grupos Terapêuticos",
    "Terapia Motivacional"
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/users', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        setUsers(data.users);
      } catch {}
    };
    load();
  }, []);

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

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === "all" || user.type === filter || user.role === filter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDeleteUser = (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('delete_failed');
        setUsers(users.filter(user => user.id !== userId));
      })
      .catch(() => alert('Falha ao excluir usuário.'));
  };

  const handleToggleUserStatus = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    if (target.type !== 'paciente') {
      alert('Apenas contas de paciente podem ser promovidas a admin.');
      return;
    }
    const newRole = target.role === 'ADMIN' ? 'USER' : 'ADMIN';
    fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    })
      .then(res => {
        if (!res.ok) throw new Error('toggle_failed');
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      })
      .catch(() => alert('Falha ao atualizar papel do usuário.'));
  };

  const handleToggleBlogAuth = async (therapistId: string, currentStatus: boolean) => {
    try {
      const method = currentStatus ? 'DELETE' : 'POST';
      const res = await fetch(`/api/admin/therapists/${therapistId}/authorize-blog`, { method });
      if (!res.ok) throw new Error('toggle_failed');
      setUsers(prev => prev.map(u => 
        u.id === therapistId && u.type === 'profissional' 
          ? { ...u, canPostBlog: !currentStatus } 
          : u
      ));
    } catch {
      alert('Falha ao atualizar autorização de blog.');
    }
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setEditForm({ name: user.name, email: user.email, profile: user.profile || {} });
    setShowEditModal(true);
  };

  const submitEdit = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editForm.name, email: editForm.email, profile: editForm.profile })
      });
      if (!res.ok) throw new Error('edit_failed');
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, name: editForm.name, email: editForm.email, profile: editForm.profile } : u));
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (e) {
      alert('Falha ao editar usuário.');
    }
  };

  const openDeleteModal = (user: any) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!selectedUser) return;
    handleDeleteUser(selectedUser.id);
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const getStatusColor = (user: any) => {
    if (user.role === "ADMIN") return "bg-purple-100 text-purple-800";
    if (user.type === "profissional") return "bg-blue-100 text-blue-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (user: any) => {
    if (user.role === "ADMIN") return "Admin";
    if (user.type === "profissional") return "Profissional";
    return "Paciente";
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-indigo-600">
                  OASIS da Superdotação
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/dashboard/admin" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/dashboard/admin/blog" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Blog
                </Link>
                <span className="text-sm text-gray-500">Admin: {user?.name}</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
                <p className="mt-2 text-gray-600">Gerencie todos os usuários registrados na plataforma</p>
              </div>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                Adicionar Usuário
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total de Usuários</p>
                  <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pacientes</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.filter(u => u.type === "paciente").length}
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
                  <p className="text-sm font-medium text-gray-500">Profissionais</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.filter(u => u.type === "profissional" && u.role !== "ADMIN").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Administradores</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.filter(u => u.role === "ADMIN").length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === "all"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilter("paciente")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === "paciente"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Pacientes
                </button>
                <button
                  onClick={() => setFilter("profissional")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === "profissional"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Profissionais
                </button>
                <button
                  onClick={() => setFilter("ADMIN")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === "ADMIN"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Administradores
                </button>
              </div>

              <div className="flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrado em
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Último Login
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-600">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">
                              {user.type === "profissional" && user.crp ? user.crp : "ID: " + user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user)}`}>
                          {getStatusText(user)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Ver
                          </button>
                          <button className="text-gray-600 hover:text-gray-900" onClick={() => openEditModal(user)}>
                            Editar
                          </button>
                          {user.type === "profissional" && (
                            <button
                              onClick={() => handleToggleBlogAuth(user.id, user.canPostBlog || false)}
                              className={`${user.canPostBlog ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                            >
                              {user.canPostBlog ? "Revogar Blog" : "Autorizar Blog"}
                            </button>
                          )}
                          {user.role !== "ADMIN" && (
                            <>
                              <button
                                onClick={() => handleToggleUserStatus(user.id)}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                {user.role === "ADMIN" ? "Remover Admin" : "Tornar Admin"}
                              </button>
                              <button
                                onClick={() => openDeleteModal(user)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Excluir
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? "Tente ajustar sua busca." : "Nenhum usuário corresponde aos filtros selecionados."}
              </p>
            </div>
          )}
        </div>

        {/* User Detail Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Detalhes do Usuário</h3>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nome</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser)}`}>
                        {getStatusText(selectedUser)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ID</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.id}</p>
                    </div>
                  </div>

                  {/* Profile per type */}
                  {selectedUser.type === 'paciente' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Telefone</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.telefone || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.dataNascimento || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Gênero</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.genero || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">CEP</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.cep || '-'}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Endereço</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.endereco || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Cidade</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.cidade || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Estado</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.estado || '-'}</p>
                      </div>
                    </div>
                  )}

                  {selectedUser.type === 'profissional' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">CRP</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.crp || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Formação</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.formacao || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Experiência</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.experiencia || '-'}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Bio</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.bio || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Valor Consulta</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.valorConsulta || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Online</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.aceitaOnline ? 'Sim' : 'Não'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Presencial</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.aceitaPresencial ? 'Sim' : 'Não'}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Horários</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.horariosDisponibilidade || '-'}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Fechar
                  </button>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors" onClick={() => { setShowUserModal(false); openEditModal(selectedUser); }}>
                    Editar Usuário
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Edit Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Editar Usuário</h3>
                  <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {selectedUser.type === 'paciente' && (
                    <div className="grid grid-cols-2 gap-4">
                      {['telefone','dataNascimento','genero','cep','endereco','cidade','estado'].map((field) => (
                        <div key={field} className={field==='endereco' ? 'col-span-2' : ''}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                          <input
                            type="text"
                            value={editForm.profile?.[field] || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, profile: { ...prev.profile, [field]: e.target.value } }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedUser.type === 'profissional' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                        <input
                          type="text"
                          value={editForm.profile?.telefone || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, profile: { ...prev.profile, telefone: e.target.value } }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      {['crp','formacao','experiencia','bio','valorConsulta','horariosDisponibilidade'].map((field) => (
                        <div key={field} className={field==='bio' ? 'col-span-2' : ''}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                          {field==='bio' ? (
                            <textarea
                              rows={3}
                              value={editForm.profile?.[field] || ''}
                              onChange={(e) => setEditForm(prev => ({ ...prev, profile: { ...prev.profile, [field]: e.target.value } }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          ) : (
                            <input
                              type="text"
                              value={editForm.profile?.[field] || ''}
                              onChange={(e) => setEditForm(prev => ({ ...prev, profile: { ...prev.profile, [field]: e.target.value } }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          )}
                        </div>
                      ))}
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Especialidades</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {especialidadesOptions.map((esp) => {
                            const current = Array.isArray(editForm.profile?.especialidades) ? editForm.profile.especialidades : [];
                            const checked = current.includes(esp);
                            return (
                              <label key={esp} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    const next = new Set(current);
                                    if (e.target.checked) next.add(esp); else next.delete(esp);
                                    setEditForm(prev => ({ ...prev, profile: { ...prev.profile, especialidades: Array.from(next) } }));
                                  }}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">{esp}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Atendimento Online</label>
                        <input
                          type="checkbox"
                          checked={!!editForm.profile?.aceitaOnline}
                          onChange={(e) => setEditForm(prev => ({ ...prev, profile: { ...prev.profile, aceitaOnline: e.target.checked } }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Atendimento Presencial</label>
                        <input
                          type="checkbox"
                          checked={!!editForm.profile?.aceitaPresencial}
                          onChange={(e) => setEditForm(prev => ({ ...prev, profile: { ...prev.profile, aceitaPresencial: e.target.checked } }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
                  <button onClick={submitEdit} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">Salvar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Confirmar Exclusão</h3>
                  <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-700">Tem certeza que deseja excluir o usuário <span className="font-semibold">{selectedUser.name}</span>?</p>
                <div className="mt-6 flex justify-end space-x-3">
                  <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
                  <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors">Excluir</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

