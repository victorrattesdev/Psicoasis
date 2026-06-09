"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { authHeaders } from "@/lib/api-client";

export default function PacienteDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [counts, setCounts] = useState<{ upcomingCount: number; completedCount: number; favoritesCount: number } | null>(null);
  const [profileData, setProfileData] = useState<{
    telefone?: string;
    dataNascimento?: string;
    genero?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    photoUrl?: string;
    cursosLiberado?: boolean;
    avaliacaoNeuropsicologicaLiberada?: boolean;
  } | null>(null);
  const [profileForm, setProfileForm] = useState({
    cep: "",
    endereco: "",
    cidade: "",
    estado: "",
    photoUrl: ""
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/stats/paciente?userId=${user.id}`, { cache: 'no-store', headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        setCounts(data);
      } catch {}
    };
    load();
  }, [user?.id]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/users/${user.id}`, { cache: "no-store", headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        setProfileData(data?.profile || {});
        setProfileForm({
          cep: data?.profile?.cep || "",
          endereco: data?.profile?.endereco || "",
          cidade: data?.profile?.cidade || "",
          estado: data?.profile?.estado || "",
          photoUrl: data?.profile?.photoUrl || ""
        });
      } catch {}
    };
    loadProfile();
  }, [user?.id]);

  const handleProfileChange = (field: keyof typeof profileForm, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const normalizeDateInput = (value?: string) => {
    if (!value) return "";
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      const [, dd, mm, yyyy] = match;
      return `${yyyy}-${mm}-${dd}`;
    }
    return "";
  };

  const handlePhotoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProfileMessage("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileMessage("A imagem deve ter no máximo 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      handleProfileChange("photoUrl", typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setIsSavingProfile(true);
    setProfileMessage("");
    setShowProfileSuccess(false);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            cep: profileForm.cep.trim(),
            endereco: profileForm.endereco.trim(),
            cidade: profileForm.cidade.trim(),
            estado: profileForm.estado.trim(),
            photoUrl: profileForm.photoUrl.trim() || null
          }
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setProfileMessage(data?.error || "Não foi possível salvar as alterações.");
        return;
      }
      const data = await res.json();
      setProfileData(data?.profile || {});
      setShowProfileSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setProfileMessage("Não foi possível salvar as alterações.");
    } finally {
      setIsSavingProfile(false);
    }
  };
  const [activeTab, setActiveTab] = useState("inicio");

  // Sample data - in a real app, this would come from the database
  const upcomingAppointments = [
    {
      id: 1,
      psychologist: "Dr. Ana Silva",
      specialty: "Ansiedade e Depressão",
      date: "2024-10-20",
      time: "14:00",
      type: "Online",
      status: "Confirmado"
    },
    {
      id: 2,
      psychologist: "Dr. Carlos Mendes",
      specialty: "Terapia de Casal",
      date: "2024-10-25",
      time: "16:30",
      type: "Presencial",
      status: "Agendado"
    }
  ];

  const recentAppointments = [
    {
      id: 3,
      psychologist: "Dr. Maria Santos",
      specialty: "Trauma e EMDR",
      date: "2024-10-15",
      time: "10:00",
      type: "Online",
      status: "Concluído"
    }
  ];

  const renderInicio = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-black to-[#b8860b] rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Bem-vindo de volta, {user?.name}!</h2>
        <p className="text-indigo-100">
          Como você está se sentindo hoje? Lembre-se de que estamos aqui para apoiá-lo em sua jornada de bem-estar mental.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#fff4c1] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-[#b8860b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6l-8 4 8 4 8-4-8-4zm0 8l-8-4v6l8 4 8-4v-6l-8 4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Acessar os Cursos</p>
              <p className="text-sm text-gray-500">Conteúdos exclusivos para você</p>
            </div>
          </div>
          <div className="mt-4">
            {profileData?.cursosLiberado ? (
              <Link
                href="/cursos"
                className="inline-flex items-center justify-center w-full rounded-lg border border-[#b8860b] bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900 transition-colors"
              >
                Acesse os cursos
              </Link>
            ) : (
              <Link
                href="/cursos"
                className="inline-flex items-center justify-center w-full rounded-lg border border-black bg-[#b8860b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9c6f0a] transition-colors"
              >
                Compre já os cursos
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#fff4c1] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-[#b8860b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h8M8 10h8M8 14h5M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Agendar Avaliação</p>
              <p className="text-sm text-gray-500">Avaliação Neuropsicológica</p>
            </div>
          </div>
          <div className="mt-4">
            {profileData?.avaliacaoNeuropsicologicaLiberada ? (
              <Link
                href="/avaliacao-neuropsicologica"
                className="inline-flex items-center justify-center w-full rounded-lg border border-[#b8860b] bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900 transition-colors"
              >
                Agendar Avaliação
              </Link>
            ) : (
              <Link
                href="/avaliacao-neuropsicologica"
                className="inline-flex items-center justify-center w-full rounded-lg border border-black bg-[#b8860b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9c6f0a] transition-colors"
              >
                Conheça nossa avaliação
              </Link>
            )}
          </div>
        </div>
      </div>

    </div>
  );

  const renderConsultas = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Minhas Consultas</h2>
        <Link 
          href="/psicologos"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Agendar Nova Consulta
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("proximas")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "proximas"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Próximas
          </button>
          <button
            onClick={() => setActiveTab("historico")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "historico"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Histórico
          </button>
        </nav>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          {activeTab === "proximas" ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{appointment.psychologist}</h4>
                      <p className="text-sm text-gray-600">{appointment.specialty}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time} - {appointment.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'Confirmado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      Ver Detalhes
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{appointment.psychologist}</h4>
                      <p className="text-sm text-gray-600">{appointment.specialty}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time} - {appointment.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      {appointment.status}
                    </span>
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      Ver Relatório
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPerfil = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Meu Perfil</h2>
      
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              {profileForm.photoUrl ? (
                <img
                  src={profileForm.photoUrl}
                  alt={user?.name || "Foto de perfil"}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{user?.name}</h3>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500">Paciente desde Outubro 2024</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input
                type="text"
                value={user?.name || "-"}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user?.email || "-"}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                type="tel"
                value={profileData?.telefone || user?.telefone || "-"}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
              <input
                type="date"
                value={normalizeDateInput(profileData?.dataNascimento || user?.dataNascimento)}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
              <input
                type="text"
                value={profileData?.genero || user?.genero || "-"}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
              <input
                type="text"
                value={profileForm.cep}
                onChange={(e) => handleProfileChange("cep", e.target.value)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <input
                type="text"
                value={profileForm.endereco}
                onChange={(e) => handleProfileChange("endereco", e.target.value)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input
                type="text"
                value={profileForm.cidade}
                onChange={(e) => handleProfileChange("cidade", e.target.value)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <input
                type="text"
                value={profileForm.estado}
                onChange={(e) => handleProfileChange("estado", e.target.value)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
              />
            </div>
          </div>
          {profileMessage && (
            <p className={`mt-4 text-sm ${profileMessage.includes("sucesso") ? "text-green-700" : "text-red-600"}`}>
              {profileMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute allowedUserTypes={['paciente']}>
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("inicio")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "inicio"
                    ? "bg-[#fff4c1] text-[#b8860b]"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                Início
              </button>
              <button
                onClick={() => setActiveTab("perfil")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "perfil"
                    ? "bg-[#fff4c1] text-[#b8860b]"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Perfil
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "inicio" && renderInicio()}
            {activeTab === "consultas" && renderConsultas()}
            {activeTab === "perfil" && renderPerfil()}
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
