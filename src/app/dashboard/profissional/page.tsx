"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { authHeaders } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TipTapLink from "@tiptap/extension-link";

export default function ProfissionalDashboard() {
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
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("inicio");
  const [counts, setCounts] = useState<{ todayCount: number; patientsCount: number; monthlyRevenue: number } | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    dataNascimento: "",
    genero: "",
    crp: "",
    abordagens: [] as string[],
    especialidades: [] as string[],
    formacao: "",
    experiencia: "",
    bio: "",
    valorConsulta: "",
    aceitaOnline: false,
    aceitaPresencial: false,
    endereco: "",
    cidade: "",
    estado: "",
    cep: ""
  });
  const [initialProfileForm, setInitialProfileForm] = useState<typeof profileForm | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [patients, setPatients] = useState<{ id: string; name: string; email: string }[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [patientEmail, setPatientEmail] = useState("");
  const [patientError, setPatientError] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string; email: string } | null>(null);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState<{
    id: string;
    name: string;
    email: string;
    profile: any;
  } | null>(null);
  const [isLoadingPatientDetails, setIsLoadingPatientDetails] = useState(false);
  const [canPostBlog, setCanPostBlog] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [blogForm, setBlogForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    coverImage: "",
    category: "",
    status: ""
  });
  const [customCategory, setCustomCategory] = useState("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showLinkWarningModal, setShowLinkWarningModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState("");
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TipTapLink.configure({
        openOnClick: true,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer"
        }
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          style: "max-width: 320px; height: auto; display: block; margin: 12px 0;"
        }
      })
    ],
    content: "",
    onCreate: ({ editor }) => {
      editor.commands.unsetBold();
    },
    onFocus: ({ editor }) => {
      if (editor.state.selection.empty && editor.isActive("bold")) {
        editor.commands.unsetBold();
      }
    },
    onUpdate: ({ editor }) => {
      setBlogForm(prev => ({ ...prev, content: editor.getHTML() }));
    }
  });
  const [isSubmittingBlog, setIsSubmittingBlog] = useState(false);
  const [consultasTab, setConsultasTab] = useState<"hoje" | "proximas" | "historico">("hoje");

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (user?.role === "ADMIN") {
      router.push("/dashboard/admin");
    }
  }, [user, router]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/stats/profissional?therapistId=${user.id}`, { cache: 'no-store', headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        setCounts(data);
      } catch {}
    };
    load();
  }, [user?.id]);

  // Load current therapist photo and blog permission
  useEffect(() => {
    const loadTherapist = async () => {
      if (!user?.id || user.type !== 'profissional') return;
      try {
        const res = await fetch(`/api/therapists/${user.id}`, { cache: 'no-store', headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.photoUrl) setPhotoUrl(data.photoUrl);
        setIsApproved(Boolean(data?.approved));
        if (data?.canPostBlog) setCanPostBlog(data.canPostBlog);
        const profile = data?.profile || {};
        const nextProfile = {
          nome: data?.name || "",
          email: data?.email || "",
          telefone: profile?.telefone || "",
          dataNascimento: profile?.dataNascimento || "",
          genero: profile?.genero || "",
          crp: profile?.crp || data?.license || "",
          abordagens: Array.isArray(profile?.abordagens) ? profile.abordagens : [],
          especialidades: Array.isArray(data?.specialties) ? data.specialties : [],
          formacao: profile?.formacao || "",
          experiencia: profile?.experiencia || "",
          bio: profile?.bio || data?.bio || "",
          valorConsulta: profile?.valorConsulta || "",
          aceitaOnline: !!profile?.aceitaOnline,
          aceitaPresencial: !!profile?.aceitaPresencial,
          endereco: profile?.endereco || "",
          cidade: profile?.cidade || "",
          estado: profile?.estado || "",
          cep: profile?.cep || ""
        };
        setProfileForm(nextProfile);
        setInitialProfileForm(nextProfile);
      } catch {}
    };
    loadTherapist();
  }, [user?.id, user?.type]);

  useEffect(() => {
    const loadPatients = async () => {
      if (!user?.id || user.type !== 'profissional') return;
      setIsLoadingPatients(true);
      try {
        const res = await fetch(`/api/therapists/${user.id}/patients`, { cache: "no-store", headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        setPatients(Array.isArray(data?.patients) ? data.patients : []);
      } finally {
        setIsLoadingPatients(false);
      }
    };
    loadPatients();
  }, [user?.id, user?.type]);

  useEffect(() => {
    const loadPatientDetails = async () => {
      if (!selectedPatient?.id) {
        setSelectedPatientDetails(null);
        return;
      }
      setIsLoadingPatientDetails(true);
      try {
        const res = await fetch(`/api/users/${selectedPatient.id}`, { cache: "no-store", headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        setSelectedPatientDetails(data);
      } finally {
        setIsLoadingPatientDetails(false);
      }
    };
    loadPatientDetails();
  }, [selectedPatient?.id]);

  const handlePhotoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setPhotoUrl(typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
  };

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

  const formatGenderLabel = (value?: string) => {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      if (name === "email") nextValue = value.slice(0, 254);
    }
    setProfileForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : nextValue
    }));
  };

  const handleProfileEspecialidadeChange = (especialidade: string) => {
    setProfileForm(prev => ({
      ...prev,
      especialidades: prev.especialidades.includes(especialidade)
        ? prev.especialidades.filter(e => e !== especialidade)
        : [...prev.especialidades, especialidade]
    }));
  };
  const handleProfileAbordagemChange = (abordagem: string) => {
    setProfileForm(prev => ({
      ...prev,
      abordagens: prev.abordagens.includes(abordagem)
        ? prev.abordagens.filter(a => a !== abordagem)
        : [...prev.abordagens, abordagem]
    }));
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setIsSavingProfile(true);
    try {
      const profilePayload = {
        telefone: profileForm.telefone,
        dataNascimento: profileForm.dataNascimento,
        genero: profileForm.genero,
        crp: profileForm.crp,
        abordagens: profileForm.abordagens,
        especialidades: profileForm.especialidades,
        formacao: profileForm.formacao,
        experiencia: profileForm.experiencia,
        bio: profileForm.bio,
        valorConsulta: profileForm.valorConsulta,
        aceitaOnline: profileForm.aceitaOnline,
        aceitaPresencial: profileForm.aceitaPresencial,
        endereco: profileForm.endereco,
        cidade: profileForm.cidade,
        estado: profileForm.estado,
        cep: profileForm.cep
      };
      const res = await fetch(`/api/therapists/${user.id}`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileForm.nome,
          email: profileForm.email,
          photoUrl: photoUrl || null,
          bio: profileForm.bio,
          crp: profileForm.crp,
          specialties: profileForm.especialidades,
          profile: profilePayload
        })
      });
      if (!res.ok) throw new Error("save_failed");
      setInitialProfileForm(profileForm);
      setFeedbackModal({ type: "success", message: "Perfil atualizado com sucesso!" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setFeedbackModal({ type: "error", message: "Falha ao salvar alterações." });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleResetProfile = () => {
    if (initialProfileForm) setProfileForm(initialProfileForm);
  };

  const handleAddPatient = async () => {
    if (!user?.id) return;
    setPatientError("");
    if (!patientEmail.trim()) {
      setPatientError("Informe o email do paciente.");
      return;
    }
    const normalizedEmail = patientEmail.trim().toLowerCase();
    if (patients.some((p) => p.email.toLowerCase() === normalizedEmail)) {
      setPatientError("O paciente já está na lista.");
      return;
    }
    try {
      const res = await fetch(`/api/therapists/${user.id}/patients`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ email: patientEmail.trim() })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPatientError(data?.error || "Não foi possível adicionar o paciente.");
        return;
      }
      const data = await res.json();
      setPatients(Array.isArray(data?.patients) ? data.patients : patients);
      setPatientEmail("");
      setShowAddPatientModal(false);
    } catch {
      setPatientError("Não foi possível adicionar o paciente.");
    }
  };

  const handleRemovePatient = async (patientId: string) => {
    if (!user?.id) return;
    if (!confirm("Remover este paciente da sua lista?")) return;
    try {
      const res = await fetch(`/api/therapists/${user.id}/patients`, {
        method: "DELETE",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ patientId })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPatientError(data?.error || "Não foi possível remover o paciente.");
        return;
      }
      const data = await res.json();
      setPatients(Array.isArray(data?.patients) ? data.patients : patients);
    } catch {
      setPatientError("Não foi possível remover o paciente.");
    }
  };
  const handleSavePhoto = async () => {
    if (!user?.id || !photoUrl) return;
    setIsSavingPhoto(true);
    try {
      const res = await fetch('/api/therapists/photo', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, photoUrl })
      });
      if (!res.ok) throw new Error("photo_failed");
      setFeedbackModal({ type: "success", message: "Foto atualizada com sucesso!" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setFeedbackModal({ type: "error", message: "Falha ao salvar foto." });
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const todayAppointments: {
    id: number;
    patient: string;
    time: string;
    type: string;
    status: string;
    specialty: string;
  }[] = [];

  const upcomingAppointments: {
    id: number;
    patient: string;
    date: string;
    time: string;
    type: string;
    status: string;
    specialty: string;
  }[] = [];

  const renderInicio = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Bem vindo, {user?.name}!</h2>
        <p className="text-purple-100">
          Obrigado por fazer parte do nosso time, continue fazendo a diferença na vida dos seus pacientes.
        </p>
        <p className="mt-3 text-purple-100">
          {isApproved
            ? "Você está classificado como um psicólogo ativo no nosso portal e o seu perfil será exibido na aba de Terapia Online como um psicólogo disponível para os pacientes."
            : "Você ainda não foi aprovado para fazer parte do nosso quadro de psicólogos ativos, entre em contato com um administrador ou aguarde aprovação para que seu perfil seja exibido para os pacientes."}
        </p>
      </div>
    </div>
  );

  const renderConsultas = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Minhas Consultas</h2>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Nova Consulta
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setConsultasTab("hoje")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              consultasTab === "hoje"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setConsultasTab("proximas")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              consultasTab === "proximas"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Próximas
          </button>
          <button
            onClick={() => setConsultasTab("historico")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              consultasTab === "historico"
                ? "border-purple-500 text-purple-600"
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
          {consultasTab === "hoje" && (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{appointment.patient}</h4>
                      <p className="text-sm text-gray-600">{appointment.specialty}</p>
                      <p className="text-sm text-gray-500">
                        {appointment.time} - {appointment.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'Confirmado' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                    <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                      Iniciar
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                      Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {consultasTab === "proximas" && (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{appointment.patient}</h4>
                      <p className="text-sm text-gray-600">{appointment.specialty}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time} - {appointment.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'Confirmado' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                    <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                      Ver Detalhes
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {consultasTab === "historico" && (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500">Histórico de consultas aparecerá aqui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPacientes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Meus Pacientes</h2>
        <button
          onClick={() => setShowAddPatientModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Adicionar Paciente
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          {isLoadingPatients ? (
            <div className="text-center py-10">
              <p className="text-sm text-gray-500">Carregando pacientes...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Nenhum paciente cadastrado</h3>
              <p className="text-sm text-gray-500 mt-1">Cadastre um paciente para começar a acompanhar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {patients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{patient.name}</h4>
                      <p className="text-sm text-gray-600">{patient.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedPatient(patient)}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      Ver Perfil
                    </button>
                    <button
                      onClick={() => handleRemovePatient(patient.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-100">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Perfil do Paciente</h3>
                  <p className="text-sm text-gray-500">Dados completos do paciente</p>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="rounded-full p-2 text-gray-400 hover:bg-purple-50 hover:text-purple-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-6 space-y-5">
                {isLoadingPatientDetails ? (
                  <p className="text-sm text-gray-500">Carregando dados do paciente...</p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedPatientDetails?.name ?? selectedPatient.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedPatientDetails?.email ?? selectedPatient.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Telefone</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedPatientDetails?.profile?.telefone || "-"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedPatientDetails?.profile?.dataNascimento || "-"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Gênero</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatGenderLabel(selectedPatientDetails?.profile?.genero) || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Cidade</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedPatientDetails?.profile?.cidade || "-"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Estado</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedPatientDetails?.profile?.estado || "-"}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    setSelectedPatientDetails(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Adicionar Paciente</h3>
                  <p className="text-sm text-gray-500">Informe o email do paciente já cadastrado.</p>
                </div>
                <button
                  onClick={() => setShowAddPatientModal(false)}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-purple-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email do paciente</label>
                <input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="paciente@email.com"
                />
                {patientError && <p className="text-sm text-red-600 mt-2">{patientError}</p>}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddPatient}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPerfil = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Meu Perfil Profissional</h2>

      {feedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-gray-100">
            <div className="p-6 text-center">
              <div
                className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
                  feedbackModal.type === "success" ? "bg-purple-100" : "bg-red-100"
                }`}
              >
                {feedbackModal.type === "success" ? (
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <p className="text-sm text-gray-700">{feedbackModal.message}</p>
              <button
                onClick={() => setFeedbackModal(null)}
                className="mt-5 w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="flex items-center space-x-6 mb-6">
            {photoUrl ? (
              <img src={photoUrl} alt={user?.name || 'Foto de perfil'} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{profileForm.nome}</h3>
              <p className="text-gray-600">{profileForm.email}</p>
              <p className="text-sm text-gray-500">{profileForm.crp} - Psicóloga Clínica</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input
                type="text"
                name="nome"
                value={profileForm.nome}
                onChange={handleProfileChange}
                maxLength={50}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500 bg-gray-100 placeholder-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CRP</label>
              <input
                type="text"
                name="crp"
                value={profileForm.crp}
                onChange={handleProfileChange}
                inputMode="numeric"
                maxLength={8}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500 bg-gray-100 placeholder-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                maxLength={254}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500 bg-gray-100 placeholder-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                type="tel"
                name="telefone"
                value={profileForm.telefone}
                onChange={handleProfileChange}
                inputMode="numeric"
                maxLength={15}
                placeholder="(00) 00000-0000"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 placeholder-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
              <input
                type="text"
                name="dataNascimento"
                value={profileForm.dataNascimento}
                onChange={handleProfileChange}
                inputMode="numeric"
                maxLength={10}
                placeholder="dd/mm/aaaa"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500 bg-gray-100 placeholder-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
              <select
                name="genero"
                value={profileForm.genero}
                onChange={handleProfileChange}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500 bg-gray-100 cursor-not-allowed"
              >
                <option value="">Selecione</option>
                <option value="masculino">{formatGenderLabel("masculino")}</option>
                <option value="feminino">{formatGenderLabel("feminino")}</option>
                <option value="nao-binario">{formatGenderLabel("nao-binario")}</option>
                <option value="prefiro-nao-informar">{formatGenderLabel("prefiro-nao-informar")}</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Abordagem</label>
              <div className="flex flex-wrap gap-2 opacity-70">
                {abordagensOptions.map((abordagem) => (
                  <label key={abordagem} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profileForm.abordagens.includes(abordagem)}
                      onChange={() => handleProfileAbordagemChange(abordagem)}
                      disabled
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded cursor-not-allowed"
                    />
                    <span className="ml-2 text-sm text-gray-700">{abordagem}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Especialidades</label>
              <div className="flex flex-wrap gap-2 opacity-70">
                {especialidadesOptions.map((especialidade) => (
                  <label key={especialidade} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profileForm.especialidades.includes(especialidade)}
                      onChange={() => handleProfileEspecialidadeChange(especialidade)}
                      disabled
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded cursor-not-allowed"
                    />
                    <span className="ml-2 text-sm text-gray-700">{especialidade}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Formação Acadêmica</label>
              <input
                type="text"
                name="formacao"
                value={profileForm.formacao}
                onChange={handleProfileChange}
                maxLength={50}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500 bg-gray-100 placeholder-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anos de Experiência</label>
              <input
                type="text"
                name="experiencia"
                value={profileForm.experiencia}
                onChange={handleProfileChange}
                inputMode="numeric"
                maxLength={7}
                placeholder="00 anos"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500 bg-gray-100 placeholder-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Consulta</label>
              <input
                type="text"
                name="valorConsulta"
                value={profileForm.valorConsulta}
                onChange={handleProfileChange}
                inputMode="numeric"
                maxLength={16}
                placeholder="000,00"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 placeholder-gray-400 cursor-not-allowed"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <input
                type="text"
                name="endereco"
                value={profileForm.endereco}
                onChange={handleProfileChange}
                maxLength={60}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 placeholder-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input
                type="text"
                name="cidade"
                value={profileForm.cidade}
                onChange={handleProfileChange}
                maxLength={30}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 placeholder-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <input
                type="text"
                name="estado"
                value={profileForm.estado}
                onChange={handleProfileChange}
                maxLength={2}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 placeholder-gray-400 uppercase cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
              <input
                type="text"
                name="cep"
                value={profileForm.cep}
                onChange={handleProfileChange}
                inputMode="numeric"
                maxLength={9}
                placeholder="00000-000"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 placeholder-gray-400 cursor-not-allowed"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Biografia</label>
              <textarea
                rows={4}
                name="bio"
                value={profileForm.bio}
                onChange={handleProfileChange}
                maxLength={250}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 placeholder-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">{profileForm.bio.length}/250</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Atendimento Online</label>
              <input
                type="checkbox"
                name="aceitaOnline"
                checked={profileForm.aceitaOnline}
                onChange={handleProfileChange}
                disabled
                className="h-4 w-4 text-purple-600 border-gray-300 rounded cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Atendimento Presencial</label>
              <input
                type="checkbox"
                name="aceitaPresencial"
                checked={profileForm.aceitaPresencial}
                onChange={handleProfileChange}
                disabled
                className="h-4 w-4 text-purple-600 border-gray-300 rounded cursor-not-allowed"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  const handleCoverImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setBlogForm(prev => ({ ...prev, coverImage: typeof reader.result === "string" ? reader.result : "" }));
    };
    reader.readAsDataURL(file);
  };

  const handleContentImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = typeof reader.result === "string" ? reader.result : "";
      if (!src) return;
      editor?.chain().focus().setImage({ src, alt: file.name || "Imagem do post" }).run();
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleBoldClick = () => {
    if (!editor) return;
    if (editor.state.selection.empty) {
      alert("Selecione um texto para aplicar negrito.");
      return;
    }
    editor.chain().focus().toggleBold().run();
  };

  const handleItalicClick = () => {
    if (!editor) return;
    if (editor.state.selection.empty) {
      alert("Selecione um texto para aplicar itálico.");
      return;
    }
    editor.chain().focus().toggleItalic().run();
  };

  const handleLinkClick = () => {
    if (!editor) return;
    if (editor.state.selection.empty) {
      setShowLinkWarningModal(true);
      return;
    }
    setLinkUrl("");
    setLinkError("");
    setShowLinkModal(true);
  };

  const handleConfirmLink = () => {
    if (!editor) return;
    const trimmed = linkUrl.trim();
    if (!trimmed) {
      setLinkError("Informe um link válido.");
      return;
    }
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: normalized }).run();
    setShowLinkModal(false);
    setLinkUrl("");
    setLinkError("");
  };

  const handleSubmitBlog = async () => {
    if (!user?.id) return;
    const contentText = editor?.getText().trim() ?? "";
    if (!blogForm.title.trim() || contentText.length === 0) {
      alert('Título e conteúdo são obrigatórios');
      return;
    }
    if (!blogForm.status) {
      alert('Selecione um status');
      return;
    }
    if (!blogForm.category) {
      alert('Selecione uma categoria');
      return;
    }
    if (blogForm.category === "other") {
      if (!customCategory.trim()) {
        alert('Informe a categoria');
        return;
      }
      if (!/^[A-Za-z\s]+$/.test(customCategory.trim())) {
        alert('A categoria deve conter apenas letras.');
        return;
      }
    }
    setIsSubmittingBlog(true);
    try {
      const res = await fetch('/api/blog/create', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: blogForm.title.trim(),
          content: editor?.getHTML().trim() || "",
          excerpt: blogForm.excerpt.trim() || null,
          coverImage: blogForm.coverImage || null,
          category: blogForm.category === "other" ? customCategory.trim() : (blogForm.category || null),
          published: blogForm.status === "published"
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao criar post');
      }
      const data = await res.json();
      alert('Post criado com sucesso!');
      setBlogForm({
        title: "",
        content: "",
        excerpt: "",
        coverImage: "",
        category: "",
        status: ""
      });
      setCustomCategory("");
      editor?.commands.setContent("");
      if (data.slug) {
        window.open(`/blog/${data.slug}`, '_blank');
      }
    } catch (e: any) {
      alert(e.message || 'Erro ao criar post');
    } finally {
      setIsSubmittingBlog(false);
    }
  };

  const renderBlog = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Criar Novo Post</h2>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input
              type="text"
              value={blogForm.title}
              maxLength={60}
              onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Título do artigo"
            />
            <p className="mt-1 text-xs text-gray-500">{blogForm.title.length}/60</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resumo</label>
            <textarea
              rows={3}
              maxLength={150}
              value={blogForm.excerpt}
              onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Breve descrição do artigo"
            />
            <p className="mt-1 text-xs text-gray-500">{blogForm.excerpt.length}/150</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo *</label>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button
                type="button"
                onClick={handleBoldClick}
                className="px-2 py-1 border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50"
                title="Negrito"
              >
                B
              </button>
              <button
                type="button"
                onClick={handleItalicClick}
                className="px-2 py-1 border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50"
                title="Itálico"
              >
                I
              </button>
              <button
                type="button"
                onClick={handleLinkClick}
                className="px-2 py-1 border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50"
                title="Link em nova guia"
              >
                Link
              </button>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="px-2 py-1 border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Imagem
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleContentImageUpload}
                className="hidden"
              />
              <span className="text-xs text-gray-500">Selecione um texto e clique para formatar.</span>
            </div>
            <div className="border border-gray-200 rounded-md bg-white px-3 py-2 [&_.ProseMirror]:outline-none [&_.ProseMirror-focused]:outline-none">
              {editor ? (
                <EditorContent editor={editor} className="prose max-w-none min-h-[220px] text-gray-800 prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-700 [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-700" />
              ) : (
                <div className="text-sm text-gray-500">Carregando editor...</div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Você pode usar HTML básico para formatação.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
              <select
                value={blogForm.category}
                onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                <option value="Saúde Mental">Saúde Mental</option>
                <option value="Adolescentes">Adolescentes</option>
                <option value="Bem-estar">Bem-estar</option>
                <option value="Família">Família</option>
                <option value="Superdotação">Superdotação</option>
                <option value="Altas Habilidades">Altas Habilidades</option>
                <option value="other">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagem de Capa (upload)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageUpload}
                className="w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-purple-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-purple-700 hover:file:bg-purple-100"
              />
              <p className="mt-1 text-xs text-gray-500">Selecione uma imagem para a capa (opcional).</p>
            </div>
          </div>
          {blogForm.category === "other" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qual categoria? *</label>
              <input
                type="text"
                value={customCategory}
                maxLength={20}
                onChange={(e) => setCustomCategory(e.target.value.replace(/[^A-Za-z\s]/g, ""))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Digite a categoria"
              />
              <p className="mt-1 text-xs text-gray-500">{customCategory.length}/20</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              value={blogForm.status}
              onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Selecione o status</option>
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setBlogForm({
                  title: "",
                  content: "",
                  excerpt: "",
                  coverImage: "",
                  category: "",
                  status: ""
                });
                setCustomCategory("");
                editor?.commands.setContent("");
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Limpar
            </button>
            <button
              onClick={handleSubmitBlog}
              disabled={isSubmittingBlog || !blogForm.title}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isSubmittingBlog ? 'Salvando...' : 'Criar Post'}
            </button>
          </div>
        </div>
      </div>
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Adicionar link</h2>
            <p className="mt-2 text-sm text-gray-600">
              Cole o link que deseja abrir em nova guia.
            </p>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => {
                setLinkUrl(e.target.value);
                if (linkError) setLinkError("");
              }}
              placeholder="https://exemplo.com"
              className="mt-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-purple-500"
            />
            {linkError && (
              <p className="mt-2 text-sm text-red-600">{linkError}</p>
            )}
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkUrl("");
                  setLinkError("");
                }}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmLink}
                className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
              >
                Inserir link
              </button>
            </div>
          </div>
        </div>
      )}
      {showLinkWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl text-center">
            <h2 className="text-lg font-semibold text-gray-900">Selecione um texto</h2>
            <p className="mt-2 text-sm text-gray-600">
              Selecione o trecho que receberá o link antes de continuar.
            </p>
            <button
              type="button"
              onClick={() => setShowLinkWarningModal(false)}
              className="mt-6 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ProtectedRoute allowedUserTypes={['profissional']}>
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
                    ? "bg-purple-100 text-purple-700"
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
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Perfil
              </button>
              {canPostBlog && (
                <button
                  onClick={() => setActiveTab("blog")}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === "blog"
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Criar Post
                </button>
              )}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "inicio" && renderInicio()}
            {activeTab === "perfil" && renderPerfil()}
            {activeTab === "blog" && canPostBlog && renderBlog()}
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
