"use client";

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
  abordagens?: string[];
  profile?: any;
  canPostBlog?: boolean;
  approved?: boolean;
  photoUrl?: string | null;
};

type CourseSection = {
  id: string;
  label: string;
};

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<NormalizedUser[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<{ name: string; email: string; profile: any; photoUrl?: string }>({ name: "", email: "", profile: {}, photoUrl: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleTarget, setRoleTarget] = useState<NormalizedUser | null>(null);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [blogTarget, setBlogTarget] = useState<NormalizedUser | null>(null);
  const [showAddProfessionalModal, setShowAddProfessionalModal] = useState(false);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [approvalResult, setApprovalResult] = useState<{ title: string; message: string } | null>(null);
  const [courseSections, setCourseSections] = useState<CourseSection[]>([]);

  const initialProfessionalForm = {
    nome: "",
    email: "",
    telefone: "",
    dataNascimento: "",
    genero: "",
    photoUrl: "",
    crp: "",
    abordagens: [] as string[],
    especialidades: [] as string[],
    formacao: "",
    experiencia: "",
    bio: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    valorConsulta: "",
    aceitaOnline: false,
    aceitaPresencial: false,
    senha: "",
    confirmarSenha: "",
    aceitaTermos: false,
    aceitaPrivacidade: false
  };
  const [createForm, setCreateForm] = useState(initialProfessionalForm);

  const getAuthHeaders = (includeContentType = false): HeadersInit => {
    const token = localStorage.getItem("psicoasis_token");
    return {
      ...(includeContentType ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Same list used in registration for professionals
  const abordagensOptions = [
    "Terapia Cognitivo-Comportamental (TCC)",
    "Psicanálise",
    "Terapia do Esquema (TCC)",
    "Terapia de Aceitação e Compromisso (TCC)",
    "Terapia Comportamental Dialética (TCC)",
    "Análise do Comportamento (ABA)",
    "Neuropsicologia Clínica",
    "Reabilitação Neuropsicológica",
    "Fenomenologia-Existencial",
    "Abordagem Centrada na Pessoa (ACP)",
    "Gestalt-terapia",
    "Psicologia Analítica (Junguiana)",
    "Terapia Sistêmica",
    "Psicodrama"
  ];
  const especialidadesOptions = [
    "Altas Habilidades e Superdotação",
    "Autismo (TEA)",
    "TDAH",
    "Outras Neurodivergências",
    "Assincronia no Desenvolvimento Intelectual",
    "Perfeccionismo Paralisante e Sub-Rendimento",
    "Hipersensibilidades",
    "Masking e Burnout",
    "Dificuldade de Pertencimento",
    "Ansiedade Generalizada e Pânico",
    "Depressão Existencial",
    "Burnout Profissional e Acadêmico",
    "Conflitos Familiares e Sistêmicos",
    "Autoestima e Autoconceito",
    "Traumas no Desenvolvimento",
    "Transtornos do Afeto",
    "Transtornos do Humor",
    "Transtornos da Aprendizagem (Dislexia, Disgrafia, Discalculia)"
  ];

  const formatOnlyLetters = (value: string, maxLength: number) =>
    value
      .replace(/[^A-Za-zÀ-ÿ\s]/g, "")
      .replace(/\s{2,}/g, " ")
      .slice(0, maxLength);

  const formatOnlyNumbers = (value: string, maxLength: number) =>
    value.replace(/\D/g, "").slice(0, maxLength);

  const formatDate = (value: string) => {
    const digits = formatOnlyNumbers(value, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const formatPhone = (value: string) => {
    const digits = formatOnlyNumbers(value, 11);
    if (!digits) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const formatCrp = (value: string) => {
    const digits = formatOnlyNumbers(value, 7);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const formatExperience = (value: string) => {
    const digits = formatOnlyNumbers(value, 2);
    return digits ? `${digits} anos` : "";
  };

  const formatCep = (value: string) => {
    const digits = formatOnlyNumbers(value, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  const formatValorConsulta = (value: string) => {
    const digits = formatOnlyNumbers(value, 12);
    if (!digits) return "";
    const padded = digits.padStart(3, "0");
    const integerPart = padded.slice(0, -2);
    const decimalPart = padded.slice(-2);
    const normalizedInteger = integerPart.replace(/^0+(?=\d)/, "");
    return `${normalizedInteger},${decimalPart}`;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/users', {
          cache: 'no-store',
          headers: getAuthHeaders(),
        });
        if (!res.ok) return;
        const data = await res.json();
        setUsers(data.users);
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await fetch("/api/courses", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data.sections)) {
          setCourseSections([]);
          return;
        }
        const nextSections = data.sections
          .filter((section: CourseSection) => section?.id && section?.label)
          .map((section: CourseSection) => ({ id: section.id, label: section.label }));
        setCourseSections(nextSections);
      } catch {
        setCourseSections([]);
      }
    };
    loadCourses();
  }, []);

  const handleCreatePhotoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCreateForm(prev => ({ ...prev, photoUrl: typeof reader.result === "string" ? reader.result : "" }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    let nextValue = value;
    if (type !== "checkbox") {
      if (name === "nome") nextValue = formatOnlyLetters(value, 50);
      if (name === "telefone") nextValue = formatPhone(value);
      if (name === "dataNascimento") nextValue = formatDate(value);
      if (name === "crp") nextValue = formatCrp(value);
      if (name === "formacao") nextValue = value.slice(0, 50);
      if (name === "experiencia") nextValue = formatExperience(value);
      if (name === "bio") nextValue = value.slice(0, 250);
      if (name === "valorConsulta") nextValue = formatValorConsulta(value);
      if (name === "endereco") nextValue = value.slice(0, 60);
      if (name === "cidade") nextValue = formatOnlyLetters(value, 30);
      if (name === "estado") nextValue = formatOnlyLetters(value, 2).toUpperCase();
      if (name === "cep") nextValue = formatCep(value);
      if (name === "senha") nextValue = value.slice(0, 20);
      if (name === "confirmarSenha") nextValue = value.slice(0, 20);
    }

    setCreateForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : nextValue
    }));

    if (createErrors[name]) {
      setCreateErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleCreateEspecialidadeChange = (especialidade: string) => {
    setCreateForm(prev => ({
      ...prev,
      especialidades: prev.especialidades.includes(especialidade)
        ? prev.especialidades.filter(e => e !== especialidade)
        : [...prev.especialidades, especialidade]
    }));
    if (createErrors.especialidades) {
      setCreateErrors(prev => ({ ...prev, especialidades: "" }));
    }
  };
  const handleCreateAbordagemChange = (abordagem: string) => {
    setCreateForm(prev => ({
      ...prev,
      abordagens: prev.abordagens.includes(abordagem)
        ? prev.abordagens.filter(a => a !== abordagem)
        : [...prev.abordagens, abordagem]
    }));
    if (createErrors.abordagens) {
      setCreateErrors(prev => ({ ...prev, abordagens: "" }));
    }
  };

  const validateCreateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!createForm.nome.trim()) newErrors.nome = "Nome é obrigatório";
    else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(createForm.nome)) newErrors.nome = "Nome deve conter apenas letras";
    else if (createForm.nome.trim().length > 50) newErrors.nome = "Nome deve ter no máximo 50 caracteres";
    if (!createForm.email.trim()) newErrors.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(createForm.email)) newErrors.email = "Email inválido";
    if (!createForm.telefone.trim()) newErrors.telefone = "Telefone é obrigatório";
    else if (formatOnlyNumbers(createForm.telefone, 11).length !== 11) newErrors.telefone = "Telefone deve ter 11 números";
    if (!createForm.dataNascimento) newErrors.dataNascimento = "Data de nascimento é obrigatória";
    else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(createForm.dataNascimento)) newErrors.dataNascimento = "Data deve estar no formato dd/mm/aaaa";
    if (!createForm.crp.trim()) newErrors.crp = "CRP é obrigatório";
    else if (formatOnlyNumbers(createForm.crp, 7).length !== 7) newErrors.crp = "CRP deve ter 7 números";
    if (!createForm.genero) newErrors.genero = "Gênero é obrigatório";
    if (createForm.abordagens.length === 0) newErrors.abordagens = "Selecione pelo menos uma abordagem";
    if (createForm.especialidades.length === 0) newErrors.especialidades = "Selecione pelo menos uma especialidade";
    if (!createForm.formacao.trim()) newErrors.formacao = "Formação é obrigatória";
    else if (createForm.formacao.trim().length > 50) newErrors.formacao = "Formação deve ter no máximo 50 caracteres";
    if (!createForm.experiencia.trim()) newErrors.experiencia = "Anos de experiência é obrigatório";
    else if (formatOnlyNumbers(createForm.experiencia, 2).length < 1) newErrors.experiencia = "Informe os anos de experiência";
    if (!createForm.bio.trim()) newErrors.bio = "Biografia é obrigatória";
    else if (createForm.bio.trim().length > 250) newErrors.bio = "Biografia deve ter no máximo 250 caracteres";
    if (!createForm.valorConsulta.trim()) newErrors.valorConsulta = "Valor da consulta é obrigatório";
    if (!createForm.endereco.trim()) newErrors.endereco = "Endereço é obrigatório";
    else if (createForm.endereco.trim().length > 60) newErrors.endereco = "Endereço deve ter no máximo 60 caracteres";
    if (!createForm.cidade.trim()) newErrors.cidade = "Cidade é obrigatória";
    else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(createForm.cidade)) newErrors.cidade = "Cidade deve conter apenas letras";
    else if (createForm.cidade.trim().length > 30) newErrors.cidade = "Cidade deve ter no máximo 30 caracteres";
    if (!createForm.estado.trim()) newErrors.estado = "Estado é obrigatório";
    else if (!/^[A-Za-z]{2}$/.test(createForm.estado)) newErrors.estado = "Estado deve ter 2 letras";
    if (!createForm.cep.trim()) newErrors.cep = "CEP é obrigatório";
    else if (formatOnlyNumbers(createForm.cep, 8).length !== 8) newErrors.cep = "CEP deve ter 8 números";
    if (!createForm.senha) newErrors.senha = "Senha é obrigatória";
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,20}$/.test(createForm.senha)) {
      newErrors.senha = "Senha deve ter 6-20 caracteres, maiúscula, minúscula, número e caractere";
    }
    if (createForm.senha !== createForm.confirmarSenha) newErrors.confirmarSenha = "Senhas não coincidem";
    if (!createForm.aceitaTermos) newErrors.aceitaTermos = "Você deve aceitar os termos de uso";
    if (!createForm.aceitaPrivacidade) newErrors.aceitaPrivacidade = "Você deve aceitar a política de privacidade";

    setCreateErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitCreateProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCreateForm()) return;
    setIsCreating(true);

    try {
      const profile = {
        telefone: createForm.telefone,
        dataNascimento: createForm.dataNascimento,
        genero: createForm.genero,
        endereco: createForm.endereco,
        cidade: createForm.cidade,
        estado: createForm.estado,
        cep: createForm.cep,
        crp: createForm.crp,
        abordagens: createForm.abordagens,
        especialidades: createForm.especialidades,
        formacao: createForm.formacao,
        experiencia: createForm.experiencia,
        bio: createForm.bio,
        valorConsulta: createForm.valorConsulta,
        photoUrl: createForm.photoUrl,
        aceitaOnline: createForm.aceitaOnline,
        aceitaPresencial: createForm.aceitaPresencial
      };

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          type: 'profissional',
          name: createForm.nome,
          email: createForm.email,
          profile
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Falha ao adicionar profissional.' }));
        if (res.status === 409) {
          setCreateErrors(prev => ({ ...prev, email: data.error || 'Email já cadastrado.' }));
          return;
        }
        setCreateErrors(prev => ({ ...prev, form: data.error || 'Falha ao adicionar profissional.' }));
        return;
      }

      const data = await res.json();
      setUsers(prev => [data.user, ...prev]);
      setShowAddProfessionalModal(false);
      setCreateForm(initialProfessionalForm);
      setCreateErrors({});
    } catch {
      setCreateErrors(prev => ({ ...prev, form: 'Falha ao adicionar profissional.' }));
    } finally {
      setIsCreating(false);
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

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === "all"
      || (filter === "paciente" ? user.type === "paciente" && user.role !== "ADMIN" : user.type === filter)
      || user.role === filter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDeleteUser = (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
      .then(res => {
        if (!res.ok) throw new Error('delete_failed');
        setUsers(users.filter(user => user.id !== userId));
      })
      .catch(() => alert('Falha ao excluir usuário.'));
  };

  const requestRoleChange = (target: NormalizedUser) => {
    setRoleTarget(target);
    setShowRoleModal(true);
  };

  const confirmRoleChange = () => {
    if (!roleTarget) return;
    const newRole = roleTarget.role === 'ADMIN' ? 'USER' : 'ADMIN';
    fetch(`/api/admin/users/${roleTarget.id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ role: newRole })
    })
      .then(res => {
        if (!res.ok) throw new Error('toggle_failed');
        setUsers(prev => prev.map(u => u.id === roleTarget.id ? { ...u, role: newRole } : u));
        setShowRoleModal(false);
        setRoleTarget(null);
      })
      .catch(() => alert('Falha ao atualizar papel do usuário.'));
  };

  const handleToggleBlogAuth = async (therapistId: string, currentStatus: boolean) => {
    try {
      const method = currentStatus ? 'DELETE' : 'POST';
      const res = await fetch(`/api/admin/therapists/${therapistId}/authorize-blog`, {
        method,
        headers: getAuthHeaders(),
      });
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

  const requestBlogAuthChange = (target: NormalizedUser) => {
    setBlogTarget(target);
    setShowBlogModal(true);
  };

  const confirmBlogAuthChange = () => {
    if (!blogTarget) return;
    handleToggleBlogAuth(blogTarget.id, blogTarget.canPostBlog || false);
    setShowBlogModal(false);
    setBlogTarget(null);
  };

  const handleToggleApproval = async (therapistId: string, currentStatus: boolean) => {
    try {
      const action = currentStatus ? 'reject' : 'approve';
      const res = await fetch(`/api/admin/therapists/${therapistId}/${action}`, { 
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('toggle_failed');
      setUsers(prev => prev.map(u => 
        u.id === therapistId && u.type === 'profissional' 
          ? { ...u, approved: !currentStatus } 
          : u
      ));
      if (!currentStatus) {
        setApprovalResult({
          title: 'Profissional aprovado',
          message: 'Profissional aprovado com suceso para utilização do portal!'
        });
      } else {
        setApprovalResult({
          title: 'Profissional retirado',
          message: 'Profissional retirado da lista de aprovados com sucesso!'
        });
      }
    } catch {
      alert('Falha ao atualizar status de aprovação.');
    }
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const openEditModal = (user: any) => {
    const baseProfile = user.profile || {};
    const mergedProfile = {
      ...baseProfile,
      especialidades: Array.isArray(baseProfile.especialidades)
        ? baseProfile.especialidades
        : (Array.isArray(user.especialidades) ? user.especialidades : []),
      abordagens: Array.isArray(baseProfile.abordagens)
        ? baseProfile.abordagens
        : []
    };
    setSelectedUser(user);
    setEditForm({ name: user.name, email: user.email, profile: mergedProfile, photoUrl: user.photoUrl || "" });
    setShowEditModal(true);
  };

  const getCourseTopics = (profile: any) =>
    Array.isArray(profile?.cursosLiberados) ? profile.cursosLiberados : [];

  const hasMonthlyCourseAccess = (profile: any) =>
    Boolean(profile?.cursosMensal) ||
    profile?.cursosPlano === "mensal" ||
    Boolean(profile?.cursosLiberado);

  const toggleMonthlyCourseAccess = () => {
    setEditForm((prev) => {
      const nextMonthly = !hasMonthlyCourseAccess(prev.profile);
      return {
        ...prev,
        profile: {
          ...prev.profile,
          cursosMensal: nextMonthly,
          cursosLiberado: nextMonthly,
          cursosPlano: nextMonthly ? "mensal" : undefined
        }
      };
    });
  };

  const toggleCourseTopic = (topicId: string) => {
    setEditForm((prev) => {
      const current = getCourseTopics(prev.profile);
      const next = current.includes(topicId)
        ? current.filter((id: string) => id !== topicId)
        : [...current, topicId];
      return {
        ...prev,
        profile: {
          ...prev.profile,
          cursosLiberados: next
        }
      };
    });
  };

  const handleEditPhotoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setEditForm(prev => ({ ...prev, photoUrl: typeof reader.result === "string" ? reader.result : "" }));
    };
    reader.readAsDataURL(file);
  };

  const submitEdit = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          profile: editForm.profile,
          photoUrl: selectedUser.type === 'profissional' ? editForm.photoUrl?.trim() || null : undefined
        })
      });
      if (!res.ok) throw new Error('edit_failed');
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, name: editForm.name, email: editForm.email, profile: editForm.profile, photoUrl: selectedUser.type === 'profissional' ? editForm.photoUrl?.trim() || null : u.photoUrl } : u));
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
    if (user.type === "profissional") {
      if (user.approved === false) return "bg-yellow-100 text-yellow-800";
      if (user.approved === true) return "bg-green-100 text-green-800";
      return "bg-blue-100 text-blue-800";
    }
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (user: any) => {
    if (user.role === "ADMIN") return "Admin";
    if (user.type === "profissional") {
      if (user.approved === false) return "Pendente";
      if (user.approved === true) return "Aprovado";
      return "Profissional";
    }
    return "Paciente";
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
              <p className="mt-2 text-gray-600">Gerencie todos os usuários registrados na plataforma</p>
            </div>
            <button
              onClick={() => setShowAddProfessionalModal(true)}
              className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-green-700 transition-colors"
            >
              Adicionar Profissional
            </button>
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
                    {users.filter(u => u.type === "paciente" && u.role !== "ADMIN").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            {user.type === "profissional" ? (
                              user.photoUrl ? (
                                <img
                                  src={user.photoUrl}
                                  alt={user.name}
                                  className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-green-700">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              )
                            ) : user.profile?.photoUrl ? (
                              <img
                                src={user.profile.photoUrl}
                                alt={user.name}
                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-green-700">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            )}
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
                            <>
                              <button
                                onClick={() => handleToggleApproval(user.id, user.approved || false)}
                                className={`${user.approved ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                                title={user.approved ? "Rejeitar profissional (não aparecerá na página pública)" : "Aprovar profissional (aparecerá na página OASIS da Psicologia)"}
                              >
                                {user.approved ? "Rejeitar" : "Aprovar"}
                              </button>
                              {user.approved && (
                                <button
                                  onClick={() => requestBlogAuthChange(user)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  {user.canPostBlog ? "Revogar Blog" : "Autorizar Blog"}
                                </button>
                              )}
                            </>
                          )}
                          {user.role !== "ADMIN" && (
                            <>
                              <button
                                onClick={() => requestRoleChange(user)}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                Tornar Admin
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

        {showAddProfessionalModal && (
          <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto w-11/12 md:w-3/4 lg:w-2/3 shadow-2xl rounded-2xl bg-white border border-gray-100">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Adicionar Profissional</h3>
                    <p className="text-sm text-gray-500">Preencha os dados do novo psicólogo</p>
                  </div>
                  <button
                    onClick={() => { setShowAddProfessionalModal(false); setCreateErrors({}); setCreateForm(initialProfessionalForm); }}
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {createErrors.form && (
                  <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {createErrors.form}
                  </div>
                )}

                <form onSubmit={submitCreateProfessional} className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Foto de Perfil</label>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCreatePhotoFileChange}
                        className="w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-green-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-100"
                      />
                      {createForm.photoUrl ? (
                        <img
                          src={createForm.photoUrl}
                          alt="Prévia da foto"
                          className="h-16 w-16 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm">
                          Sem foto
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG ou WEBP (até 2MB).</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Informações Pessoais</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="create-nome" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                        <input
                          type="text"
                          id="create-nome"
                          name="nome"
                          value={createForm.nome}
                          onChange={handleCreateInputChange}
                          maxLength={50}
                          className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                            createErrors.nome ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Nome completo"
                        />
                        {createErrors.nome && <p className="text-red-500 text-sm mt-1">{createErrors.nome}</p>}
                      </div>

                      <div>
                        <label htmlFor="create-email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          id="create-email"
                          name="email"
                          value={createForm.email}
                          onChange={handleCreateInputChange}
                          maxLength={254}
                          className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                            createErrors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="seu@email.com"
                        />
                        {createErrors.email && <p className="text-red-500 text-sm mt-1">{createErrors.email}</p>}
                      </div>

                      <div>
                        <label htmlFor="create-telefone" className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                        <input
                          type="tel"
                          id="create-telefone"
                          name="telefone"
                          value={createForm.telefone}
                          onChange={handleCreateInputChange}
                          inputMode="numeric"
                          maxLength={15}
                          className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                            createErrors.telefone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="(00) 00000-0000"
                        />
                        {createErrors.telefone && <p className="text-red-500 text-sm mt-1">{createErrors.telefone}</p>}
                      </div>

                      <div>
                        <label htmlFor="create-dataNascimento" className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento *</label>
                        <input
                          type="text"
                          id="create-dataNascimento"
                          name="dataNascimento"
                          value={createForm.dataNascimento}
                          onChange={handleCreateInputChange}
                          inputMode="numeric"
                          maxLength={10}
                          className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                            createErrors.dataNascimento ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="dd/mm/aaaa"
                        />
                        {createErrors.dataNascimento && <p className="text-red-500 text-sm mt-1">{createErrors.dataNascimento}</p>}
                      </div>

                      <div>
                        <label htmlFor="create-genero" className="block text-sm font-medium text-gray-700 mb-1">Gênero *</label>
                        <select
                          id="create-genero"
                          name="genero"
                          value={createForm.genero}
                          onChange={handleCreateInputChange}
                          className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                            createErrors.genero ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Selecione</option>
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                          <option value="nao-binario">Não-binário</option>
                          <option value="prefiro-nao-informar">Prefiro não informar</option>
                        </select>
                        {createErrors.genero && <p className="text-red-500 text-sm mt-1">{createErrors.genero}</p>}
                      </div>

                      <div>
                        <label htmlFor="create-crp" className="block text-sm font-medium text-gray-700 mb-1">CRP *</label>
                        <input
                          type="text"
                          id="create-crp"
                          name="crp"
                          value={createForm.crp}
                          onChange={handleCreateInputChange}
                          inputMode="numeric"
                          maxLength={8}
                          className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                            createErrors.crp ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="11/11111"
                        />
                        {createErrors.crp && <p className="text-red-500 text-sm mt-1">{createErrors.crp}</p>}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Informações Profissionais</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Abordagem *</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {abordagensOptions.map((abordagem) => (
                            <label key={abordagem} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={createForm.abordagens.includes(abordagem)}
                                onChange={() => handleCreateAbordagemChange(abordagem)}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">{abordagem}</span>
                            </label>
                          ))}
                        </div>
                        {createErrors.abordagens && <p className="text-red-500 text-sm mt-1">{createErrors.abordagens}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Especialidades *</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {especialidadesOptions.map((especialidade) => (
                            <label key={especialidade} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={createForm.especialidades.includes(especialidade)}
                                onChange={() => handleCreateEspecialidadeChange(especialidade)}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">{especialidade}</span>
                            </label>
                          ))}
                        </div>
                        {createErrors.especialidades && <p className="text-red-500 text-sm mt-1">{createErrors.especialidades}</p>}
                      </div>

                      <div>
                        <label htmlFor="create-formacao" className="block text-sm font-medium text-gray-700 mb-1">Formação Acadêmica *</label>
                        <input
                          type="text"
                          id="create-formacao"
                          name="formacao"
                          value={createForm.formacao}
                          onChange={handleCreateInputChange}
                          maxLength={50}
                          className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                            createErrors.formacao ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Ex: Psicologia - Universidade de São Paulo"
                        />
                        {createErrors.formacao && <p className="text-red-500 text-sm mt-1">{createErrors.formacao}</p>}
                      </div>

                      <div>
                        <label htmlFor="create-experiencia" className="block text-sm font-medium text-gray-700 mb-1">Anos de Experiência *</label>
                        <input
                          type="text"
                          id="create-experiencia"
                          name="experiencia"
                          value={createForm.experiencia}
                          onChange={handleCreateInputChange}
                          inputMode="numeric"
                          maxLength={7}
                          className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                            createErrors.experiencia ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="00 anos"
                        />
                        {createErrors.experiencia && <p className="text-red-500 text-sm mt-1">{createErrors.experiencia}</p>}
                      </div>

                      <div>
                        <label htmlFor="create-bio" className="block text-sm font-medium text-gray-700 mb-1">Biografia Profissional *</label>
                        <textarea
                          id="create-bio"
                          name="bio"
                          value={createForm.bio}
                          onChange={handleCreateInputChange}
                          rows={4}
                          maxLength={250}
                          className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                            createErrors.bio ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Conte um pouco sobre sua experiência, abordagem terapêutica e como você pode ajudar seus pacientes..."
                        />
                        <div className="flex items-center justify-between">
                          {createErrors.bio ? <p className="text-red-500 text-sm mt-1">{createErrors.bio}</p> : <span />}
                          <p className="text-xs text-gray-500 mt-1">{createForm.bio.length}/250</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Informações de Atendimento</h4>
                    <div>
                      <label htmlFor="create-valorConsulta" className="block text-sm font-medium text-gray-700 mb-1">Valor da Consulta *</label>
                      <input
                        type="text"
                        id="create-valorConsulta"
                        name="valorConsulta"
                        value={createForm.valorConsulta}
                        onChange={handleCreateInputChange}
                        inputMode="numeric"
                        maxLength={16}
                        className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                          createErrors.valorConsulta ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="000,00"
                      />
                      {createErrors.valorConsulta && <p className="text-red-500 text-sm mt-1">{createErrors.valorConsulta}</p>}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Endereço do Consultório</h4>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="create-endereco" className="block text-sm font-medium text-gray-700 mb-1">Endereço *</label>
                        <input
                          type="text"
                          id="create-endereco"
                          name="endereco"
                          value={createForm.endereco}
                          onChange={handleCreateInputChange}
                          maxLength={60}
                          className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                            createErrors.endereco ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Rua, número, complemento"
                        />
                        {createErrors.endereco && <p className="text-red-500 text-sm mt-1">{createErrors.endereco}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="create-cidade" className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                          <input
                            type="text"
                            id="create-cidade"
                            name="cidade"
                            value={createForm.cidade}
                            onChange={handleCreateInputChange}
                            maxLength={30}
                            className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                              createErrors.cidade ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Sua cidade"
                          />
                          {createErrors.cidade && <p className="text-red-500 text-sm mt-1">{createErrors.cidade}</p>}
                        </div>

                        <div>
                          <label htmlFor="create-estado" className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                          <input
                            type="text"
                            id="create-estado"
                            name="estado"
                            value={createForm.estado}
                            onChange={handleCreateInputChange}
                            maxLength={2}
                            className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 uppercase focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                              createErrors.estado ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="UF"
                          />
                          {createErrors.estado && <p className="text-red-500 text-sm mt-1">{createErrors.estado}</p>}
                        </div>

                        <div>
                          <label htmlFor="create-cep" className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                          <input
                            type="text"
                            id="create-cep"
                            name="cep"
                            value={createForm.cep}
                            onChange={handleCreateInputChange}
                            inputMode="numeric"
                            maxLength={9}
                            className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                              createErrors.cep ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="00000-000"
                          />
                          {createErrors.cep && <p className="text-red-500 text-sm mt-1">{createErrors.cep}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Segurança</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="create-senha" className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
                        <input
                          type="password"
                          id="create-senha"
                          name="senha"
                          value={createForm.senha}
                          onChange={handleCreateInputChange}
                          maxLength={20}
                          className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                            createErrors.senha ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Até 20 caracteres"
                        />
                        {createErrors.senha && <p className="text-red-500 text-sm mt-1">{createErrors.senha}</p>}
                      </div>

                      <div>
                        <label htmlFor="create-confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha *</label>
                        <input
                          type="password"
                          id="create-confirmarSenha"
                          name="confirmarSenha"
                          value={createForm.confirmarSenha}
                          onChange={handleCreateInputChange}
                          maxLength={20}
                          className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                            createErrors.confirmarSenha ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Digite a senha novamente"
                        />
                        {createErrors.confirmarSenha && <p className="text-red-500 text-sm mt-1">{createErrors.confirmarSenha}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="create-aceitaTermos"
                        name="aceitaTermos"
                        checked={createForm.aceitaTermos}
                        onChange={handleCreateInputChange}
                        className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="create-aceitaTermos" className="ml-2 text-sm text-gray-700">
                        Eu aceito os termos de uso da plataforma *
                      </label>
                    </div>
                    {createErrors.aceitaTermos && <p className="text-red-500 text-sm">{createErrors.aceitaTermos}</p>}

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="create-aceitaPrivacidade"
                        name="aceitaPrivacidade"
                        checked={createForm.aceitaPrivacidade}
                        onChange={handleCreateInputChange}
                        className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="create-aceitaPrivacidade" className="ml-2 text-sm text-gray-700">
                        Eu aceito a política de privacidade e autorizo o tratamento dos dados *
                      </label>
                    </div>
                    {createErrors.aceitaPrivacidade && <p className="text-red-500 text-sm">{createErrors.aceitaPrivacidade}</p>}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => { setShowAddProfessionalModal(false); setCreateErrors({}); setCreateForm(initialProfessionalForm); }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-green-400 transition-colors"
                    >
                      {isCreating ? "Adicionando..." : "Adicionar Profissional"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {approvalResult && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
            <div className="w-full max-w-lg shadow-2xl rounded-2xl bg-white border border-gray-100">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{approvalResult.title}</h3>
                    <p className="text-sm text-gray-500">Status atualizado</p>
                  </div>
                  <button
                    onClick={() => setApprovalResult(null)}
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-700">
                  {approvalResult.title === 'Profissional retirado' ? (
                    <>
                      <span className="block">Profissional retirado da lista de aprovados com sucesso!</span>
                    </>
                  ) : (
                    approvalResult.message
                  )}
                </p>
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setApprovalResult(null)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Ok
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Detail Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-16 mx-auto w-11/12 md:w-3/4 lg:w-1/2 shadow-2xl rounded-2xl bg-white border border-gray-100">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Detalhes do Usuário</h3>
                    <p className="text-sm text-gray-500">Visualização somente leitura</p>
                  </div>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Dados básicos</h4>
                    <div className="flex items-center gap-4 mb-4">
                      {selectedUser.type === "profissional" ? (
                        selectedUser.photoUrl ? (
                          <img
                            src={selectedUser.photoUrl}
                            alt={selectedUser.name}
                            className="h-14 w-14 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-green-700">
                              {selectedUser.name.split(' ').map((n: string) => n[0]).join('')}
                            </span>
                          </div>
                        )
                      ) : selectedUser.profile?.photoUrl ? (
                        <img
                          src={selectedUser.profile.photoUrl}
                          alt={selectedUser.name}
                          className="h-14 w-14 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-green-700">
                            {selectedUser.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{selectedUser.name}</p>
                        <p className="text-sm text-gray-600">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Tipo</label>
                        <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser)}`}>
                          {getStatusText(selectedUser)}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">ID</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.id}</p>
                      </div>
                    </div>
                  </div>

                  {selectedUser.type === 'paciente' && (
                    <div className="rounded-xl border border-gray-200 p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">Dados do paciente</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900">Telefone</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.telefone || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900">Data nascimento</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.dataNascimento || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900">Genero</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.genero || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900">CEP</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.cep || '-'}</p>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-900">Endereco</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.endereco || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900">Cidade</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.cidade || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900">Estado</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.estado || '-'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedUser.type === 'profissional' && (
                    <div className="rounded-xl border border-gray-200 p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">Dados do profissional</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900">CRP</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.crp || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900">Formacao</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.formacao || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900">Experiencia</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.experiencia || '-'}</p>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-900">Bio</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.bio || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900">Valor consulta</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.valorConsulta || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900">Online</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.aceitaOnline ? 'Sim' : 'Não'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900">Presencial</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.aceitaPresencial ? 'Sim' : 'Não'}</p>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-900">Horarios</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.horariosDisponibilidade || '-'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Fechar
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    onClick={() => { setShowUserModal(false); openEditModal(selectedUser); }}
                  >
                    Editar Usuario
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Edit Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-16 mx-auto w-11/12 md:w-3/4 lg:w-1/2 shadow-2xl rounded-2xl bg-white border border-gray-100">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Editar Usuário</h3>
                    <p className="text-sm text-gray-500">Atualize dados e permissões</p>
                  </div>
                  <button onClick={() => setShowEditModal(false)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Dados básicos</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Nome</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-400 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-400 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {selectedUser.type === 'paciente' && (
                    <div className="rounded-xl border border-gray-200 p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">Dados do paciente</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { field: 'telefone', label: 'Telefone' },
                          { field: 'dataNascimento', label: 'Data nascimento' },
                          { field: 'genero', label: 'Genero' },
                          { field: 'cep', label: 'CEP' },
                          { field: 'endereco', label: 'Endereco' },
                          { field: 'cidade', label: 'Cidade' },
                          { field: 'estado', label: 'Estado' },
                        ].map(({ field, label }) => (
                          <div key={field} className={field==='endereco' ? 'col-span-2' : ''}>
                            <label className="block text-sm font-medium text-gray-900 mb-1">{label}</label>
                            <input
                              type="text"
                              value={editForm.profile?.[field] || ''}
                              onChange={(e) => setEditForm(prev => ({ ...prev, profile: { ...prev.profile, [field]: e.target.value } }))}
                              className="w-full px-3 py-2 border border-gray-400 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 p-4">
                        <h5 className="text-sm font-semibold text-gray-900 mb-3">Acessos liberados</h5>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Cursos</p>
                            <div className="mt-2 flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={toggleMonthlyCourseAccess}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                  hasMonthlyCourseAccess(editForm.profile)
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                                }`}
                              >
                                {hasMonthlyCourseAccess(editForm.profile)
                                  ? "Mensal ativo"
                                  : "Liberar Mensal"}
                              </button>
                            </div>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                              {courseSections.length > 0 ? (
                                courseSections.map((section) => {
                                  const selected = getCourseTopics(editForm.profile).includes(section.id);
                                  const disabled = hasMonthlyCourseAccess(editForm.profile);
                                  return (
                                    <button
                                      key={section.id}
                                      type="button"
                                      onClick={() => toggleCourseTopic(section.id)}
                                      disabled={disabled}
                                      className={`px-3 py-2 rounded-md text-sm font-medium text-left transition-colors border ${
                                        selected
                                          ? "border-green-600 bg-green-50 text-green-700"
                                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                                      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                                    >
                                      {section.label}
                                    </button>
                                  );
                                })
                              ) : (
                                <p className="text-xs text-gray-500">Nenhum tópico cadastrado.</p>
                              )}
                            </div>
                            {hasMonthlyCourseAccess(editForm.profile) && (
                              <p className="mt-2 text-xs text-gray-500">
                                Plano mensal libera todos os tópicos automaticamente.
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setEditForm(prev => ({
                                  ...prev,
                                  profile: {
                                    ...prev.profile,
                                    avaliacaoNeuropsicologicaLiberada:
                                      !prev.profile?.avaliacaoNeuropsicologicaLiberada
                                  }
                                }))
                              }
                              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                editForm.profile?.avaliacaoNeuropsicologicaLiberada
                                  ? "bg-green-600 text-white hover:bg-green-700"
                                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                              }`}
                            >
                              {editForm.profile?.avaliacaoNeuropsicologicaLiberada
                                ? "Avaliação liberada"
                                : "Liberar Avaliação"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedUser.type === 'profissional' && (
                    <div className="rounded-xl border border-gray-200 p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">Dados do profissional</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-900 mb-1">Foto de Perfil</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditPhotoFileChange}
                            className="w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-green-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-100"
                          />
                          {editForm.photoUrl ? (
                            <div className="mt-3 flex items-center gap-3">
                              <img
                                src={editForm.photoUrl}
                                alt="Prévia da foto do profissional"
                                className="h-16 w-16 rounded-full object-cover border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => setEditForm(prev => ({ ...prev, photoUrl: "" }))}
                                className="text-sm text-red-600 hover:text-red-700"
                              >
                                Remover foto
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 mt-2">JPG, PNG ou WEBP (até 2MB).</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1">Telefone</label>
                          <input
                            type="text"
                            value={editForm.profile?.telefone || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, profile: { ...prev.profile, telefone: e.target.value } }))}
                            className="w-full px-3 py-2 border border-gray-400 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        {[
                          { field: 'crp', label: 'CRP' },
                          { field: 'formacao', label: 'Formacao' },
                          { field: 'experiencia', label: 'Experiencia' },
                          { field: 'bio', label: 'Bio' },
                          { field: 'valorConsulta', label: 'Valor consulta' },
                          { field: 'horariosDisponibilidade', label: 'Horarios disponibilidade' },
                        ].map(({ field, label }) => (
                          <div key={field} className={field==='bio' ? 'col-span-2' : ''}>
                            <label className="block text-sm font-medium text-gray-900 mb-1">{label}</label>
                            {field==='bio' ? (
                              <textarea
                                rows={3}
                                value={editForm.profile?.[field] || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, profile: { ...prev.profile, [field]: e.target.value } }))}
                                className="w-full px-3 py-2 border border-gray-400 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              />
                            ) : (
                              <input
                                type="text"
                                value={editForm.profile?.[field] || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, profile: { ...prev.profile, [field]: e.target.value } }))}
                                className="w-full px-3 py-2 border border-gray-400 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              />
                            )}
                          </div>
                        ))}
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-900 mb-2">Abordagem</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {abordagensOptions.map((abordagem) => {
                              const current = Array.isArray(editForm.profile?.abordagens) ? editForm.profile.abordagens : [];
                              const checked = current.includes(abordagem);
                              return (
                                <label key={abordagem} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                      const next = new Set(current);
                                      if (e.target.checked) next.add(abordagem); else next.delete(abordagem);
                                      setEditForm(prev => ({ ...prev, profile: { ...prev.profile, abordagens: Array.from(next) } }));
                                    }}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">{abordagem}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-900 mb-2">Especialidades</label>
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
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">{esp}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-8 flex justify-end gap-3">
                  <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
                  <button onClick={submitEdit} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">Salvar alterações</button>
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

        {/* Role Confirmation Modal */}
        {showRoleModal && roleTarget && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 h-full w-full z-50 flex items-center justify-center px-4">
            <div className="w-full md:w-3/4 lg:w-1/2 max-w-2xl p-5 border shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Confirmar permissão de usuário para Administrador</h3>
                  <button
                    onClick={() => { setShowRoleModal(false); setRoleTarget(null); }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-700">
                  Tem certeza que deseja promover <span className="font-semibold">{roleTarget.name}</span> a administrador?
                </p>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => { setShowRoleModal(false); setRoleTarget(null); }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmRoleChange}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Authorization Modal */}
        {showBlogModal && blogTarget && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 h-full w-full z-50 flex items-center justify-center px-4">
            <div className="w-full md:w-3/4 lg:w-1/2 max-w-2xl p-5 border shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Autorização de escrita para psicólgo no Blog</h3>
                  <button
                    onClick={() => { setShowBlogModal(false); setBlogTarget(null); }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-700">
                  {blogTarget.canPostBlog
                    ? <>Deseja revogar a permissão de <span className="font-semibold">{blogTarget.name}</span> para publicar no blog?</>
                    : <>Deseja autorizar <span className="font-semibold">{blogTarget.name}</span> a publicar no blog?</>
                  }
                </p>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => { setShowBlogModal(false); setBlogTarget(null); }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmBlogAuthChange}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

