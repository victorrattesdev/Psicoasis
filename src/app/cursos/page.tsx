"use client";

import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

type CourseVideo = {
  title: string;
  duration: string;
  description?: string;
  youtubeUrl?: string;
};

type CourseSection = {
  id: string;
  label: string;
  videos: CourseVideo[];
};

export default function CursosPage() {
  const whatsappNumber = "5522998687622";
  const buildWhatsappPurchaseLink = (topicLabel: string) =>
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      `Olá, eu desejo adquirir o curso *${topicLabel}*.`
    )}`;
  const { user } = useAuth();
  const [courseAccess, setCourseAccess] = useState<{ monthly: boolean; topics: string[] }>({
    monthly: false,
    topics: []
  });
  const [isAccessLoading, setIsAccessLoading] = useState(false);
  const isPatient = user?.type === "paciente";
  const isAdmin = user?.role === "ADMIN";
  const isProfessional = user?.type === "profissional";
  const isCheckingAccess = isPatient && isAccessLoading;
  const defaultSections: CourseSection[] = [
    {
      id: "introducao",
      label: "Introdução",
      videos: [
        {
          title: "Boas-vindas ao curso",
          duration: "05:12",
          description: "Visão geral da jornada e objetivos do curso.",
        },
        {
          title: "Como aproveitar a plataforma",
          duration: "06:48",
          description: "Dicas práticas para organizar seus estudos.",
        },
      ],
    },
    {
      id: "fundamentos",
      label: "Fundamentos",
      videos: [
        {
          title: "Conceitos essenciais",
          duration: "12:24",
          description: "Base teórica para acompanhar os próximos módulos.",
        },
        {
          title: "Metodologia aplicada",
          duration: "14:10",
          description: "Como a metodologia é usada na prática clínica.",
        },
        {
          title: "Casos guiados",
          duration: "09:37",
          description: "Exemplos reais para fixar os conceitos.",
        },
      ],
    },
    {
      id: "pratica",
      label: "Prática",
      videos: [
        {
          title: "Exercícios orientados",
          duration: "18:05",
          description: "Atividades passo a passo para consolidar o conteúdo.",
        },
        {
          title: "Avaliações rápidas",
          duration: "11:22",
          description: "Checkpoints para medir seu progresso.",
        },
      ],
    },
    {
      id: "materiais",
      label: "Materiais",
      videos: [
        {
          title: "Documentos de apoio",
          duration: "07:41",
          description: "Arquivos e leituras complementares.",
        },
        {
          title: "Checklist e modelos",
          duration: "08:15",
          description: "Materiais prontos para agilizar sua rotina.",
        },
      ],
    },
  ];
  const [sections, setSections] = useState<CourseSection[]>(defaultSections);
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id ?? "");
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [newSectionLabel, setNewSectionLabel] = useState("");
  const [modalNewVideoInputs, setModalNewVideoInputs] = useState<
    Record<string, { title: string; duration: string; description: string }>
  >({});
  const [confirmDelete, setConfirmDelete] = useState<
    | { type: "section"; sectionId: string }
    | { type: "video"; sectionId: string; index: number }
    | null
  >(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!user || !isPatient) {
      setCourseAccess({ monthly: false, topics: [] });
      setIsAccessLoading(false);
      return;
    }

    let cancelled = false;
    setIsAccessLoading(true);
    const loadAccess = async () => {
      try {
        const res = await fetch(`/api/users/${user.id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        const profile = data?.profile ?? {};
        const tags = Array.isArray(profile?.tags) ? profile.tags : [];
        const topics = Array.isArray(profile?.cursosLiberados) ? profile.cursosLiberados : [];
        const monthly =
          Boolean(profile?.cursosMensal) ||
          profile?.cursosPlano === "mensal" ||
          Boolean(profile?.cursosLiberado) ||
          tags.includes("cursos");
        if (!cancelled) {
          setCourseAccess({ monthly, topics });
          setIsAccessLoading(false);
        }
      } catch {
        if (!cancelled) {
          setCourseAccess({ monthly: false, topics: [] });
          setIsAccessLoading(false);
        }
      }
    };

    loadAccess();
    return () => {
      cancelled = true;
    };
  }, [isPatient, user?.id, user]);

  useEffect(() => {
    let cancelled = false;
    const loadCourses = async () => {
      try {
        const response = await fetch("/api/courses");
        if (!response.ok) return;
        const data = await response.json();
        if (!Array.isArray(data.sections) || data.sections.length === 0) return;
        if (!cancelled) {
          setSections(data.sections);
          setActiveSectionId(data.sections[0]?.id ?? "");
          setActiveVideoIndex(0);
        }
      } catch {
        // Keep default content if loading fails.
      }
    };
    loadCourses();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sections.length) return;
    const hasActive = sections.some((section) => section.id === activeSectionId);
    if (!hasActive) {
      setActiveSectionId(sections[0]?.id ?? "");
      setActiveVideoIndex(0);
    }
  }, [sections, activeSectionId]);

  const activeSection = sections.find((section) => section.id === activeSectionId) ?? sections[0];
  const activeVideo = activeSection?.videos[activeVideoIndex];
  const isActiveSectionUnlocked =
    isAdmin ||
    isProfessional ||
    courseAccess.monthly ||
    (activeSection?.id ? courseAccess.topics.includes(activeSection.id) : false);

  const toSlug = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const extractYoutubeId = (url?: string) => {
    if (!url) return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    const match = trimmed.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/i
    );
    return match?.[1] ?? null;
  };


  const handleAddSection = () => {
    const label = newSectionLabel.trim();
    if (!label) return;
    const id = toSlug(label);
    if (!id) return;
    if (sections.some((section) => section.id === id)) return;
    const nextSections = [...sections, { id, label, videos: [] }];
    setSections(nextSections);
    setActiveSectionId(id);
    setActiveVideoIndex(0);
    setNewSectionLabel("");
  };

  const formatDurationInput = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
    if (digitsOnly.length <= 2) {
      return digitsOnly;
    }
    if (digitsOnly.length <= 4) {
      return `${digitsOnly.slice(0, 2)}:${digitsOnly.slice(2)}`;
    }
    return `${digitsOnly.slice(0, 2)}:${digitsOnly.slice(2, 4)}:${digitsOnly.slice(4)}`;
  };

  const handleDeleteSection = (sectionId: string) => {
    const nextSections = sections.filter((section) => section.id !== sectionId);
    setSections(nextSections);
    if (activeSectionId === sectionId) {
      setActiveSectionId(nextSections[0]?.id ?? "");
      setActiveVideoIndex(0);
    }
  };

  const handleAddVideoToSection = (
    sectionId: string,
    title: string,
    duration: string,
    description: string
  ) => {
    const nextSections = sections.map((section) =>
      section.id === sectionId
        ? { ...section, videos: [...section.videos, { title, duration, description }] }
        : section
    );
    setSections(nextSections);
  };

  const handleModalVideoInputChange = (
    sectionId: string,
    field: "title" | "duration" | "description",
    value: string
  ) => {
    const nextValue = field === "duration" ? formatDurationInput(value) : value;
    setModalNewVideoInputs((prev) => ({
      ...prev,
      [sectionId]: {
        title: prev[sectionId]?.title ?? "",
        duration: prev[sectionId]?.duration ?? "",
        description: prev[sectionId]?.description ?? "",
        [field]: nextValue,
      },
    }));
  };

  const handleModalAddVideo = (sectionId: string) => {
    const input = modalNewVideoInputs[sectionId];
    const title = input?.title?.trim() ?? "";
    const duration = input?.duration?.trim() ?? "";
    const description = input?.description?.trim() ?? "";
    if (!title || !duration) return;
    handleAddVideoToSection(sectionId, title, duration, description);
    setModalNewVideoInputs((prev) => ({
      ...prev,
      [sectionId]: { title: "", duration: "", description: "" },
    }));
  };

  const handleDeleteVideo = (sectionId: string, index: number) => {
    const nextSections = sections.map((section) => {
      if (section.id !== sectionId) return section;
      const videos = section.videos.filter((_, videoIndex) => videoIndex !== index);
      return { ...section, videos };
    });
    setSections(nextSections);
    if (activeSectionId === sectionId && activeVideoIndex === index) {
      setActiveVideoIndex(0);
    }
  };

  const requestDeleteSection = (sectionId: string) => {
    setConfirmDelete({ type: "section", sectionId });
  };

  const requestDeleteVideo = (sectionId: string, index: number) => {
    setConfirmDelete({ type: "video", sectionId, index });
  };

  const confirmDeleteAction = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === "section") {
      handleDeleteSection(confirmDelete.sectionId);
    } else {
      handleDeleteVideo(confirmDelete.sectionId, confirmDelete.index);
    }
    setConfirmDelete(null);
  };

  const handleUpdateVideoUrl = (sectionId: string, videoIndex: number, url: string) => {
    const nextSections = sections.map((section) => {
      if (section.id !== sectionId) return section;
      const videos = section.videos.map((video, index) =>
        index === videoIndex ? { ...video, youtubeUrl: url } : video
      );
      return { ...section, videos };
    });
    setSections(nextSections);
  };

  const handleUpdateSectionLabel = (sectionId: string, label: string) => {
    const nextSections = sections.map((section) =>
      section.id === sectionId ? { ...section, label } : section
    );
    setSections(nextSections);
  };

  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleUpdateVideoField = (
    sectionId: string,
    index: number,
    field: "title" | "duration" | "description",
    value: string
  ) => {
    const nextValue = field === "duration" ? formatDurationInput(value) : value;
    const nextSections = sections.map((section) => {
      if (section.id !== sectionId) return section;
      const videos = section.videos.map((video, videoIndex) =>
        videoIndex === index ? { ...video, [field]: nextValue } : video
      );
      return { ...section, videos };
    });
    setSections(nextSections);
  };

  const handleSaveCourses = async () => {
    if (!isAdmin || isSaving) return;
    setIsSaving(true);
    setSaveError("");
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          adminEmail: user?.email,
          sections,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao salvar");
      }
      setShowSaveModal(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isCheckingAccess) {
    return (
      <div className="min-h-screen bg-[#faf7ef]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="rounded-lg border border-yellow-200/70 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-600">Verificando acesso aos cursos...</p>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7ef]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Cursos</h1>
                <p className="text-sm text-gray-600 mt-2">
                  Escolha uma categoria e continue assistindo os vídeos disponíveis.
                </p>
              </div>
              {isAdmin && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowManageModal(true)}
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                  >
                    Editar tópicos
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCourses}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center rounded-md bg-black px-5 py-2 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {isSaving ? "Salvando..." : "Salvar alterações"}
                  </button>
                </div>
              )}
            </div>
            {saveError && (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {saveError}
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <div className="flex flex-wrap gap-2 p-4">
                {sections.map((section) => (
                  <div key={section.id} className="group flex items-center gap-2 rounded-full">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSectionId(section.id);
                        setActiveVideoIndex(0);
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border border-transparent ${
                        activeSectionId === section.id
                          ? "bg-gray-900 text-white border-[#d4af37]"
                          : "bg-gray-800 text-white hover:bg-gray-800 border-black"
                      }`}
                    >
                      {section.label}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 p-6">
              <div className="space-y-4">
                <div className="rounded-lg h-64 flex items-center justify-center text-sm overflow-hidden border border-gray-200 bg-black/90">
                  {isActiveSectionUnlocked ? (
                    activeVideo ? (
                      (() => {
                        const videoId = extractYoutubeId(activeVideo.youtubeUrl);
                        if (!videoId) {
                          return `Reproduzindo: ${activeVideo.title}`;
                        }
                        return (
                          <iframe
                            className="w-full h-full rounded-lg"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={activeVideo.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        );
                      })()
                    ) : (
                      "Selecione um vídeo"
                    )
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gray-200 text-gray-700">
                      <div className="flex flex-col items-center gap-2">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-300">
                          <svg
                            className="h-6 w-6 text-gray-700"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                          </svg>
                        </span>
                        <p className="text-sm font-semibold text-gray-800">Conteúdo bloqueado</p>
                      </div>
                      <a
                        href={buildWhatsappPurchaseLink(activeSection?.label ?? "tópico")}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-md bg-gray-800 px-5 py-2 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        Comprar tópico
                      </a>
                    </div>
                  )}
                </div>
                {activeVideo && isActiveSectionUnlocked && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{activeVideo.title}</h2>
                    <p className="text-sm text-gray-700">Duração: {activeVideo.duration}</p>
                    {activeVideo.description && (
                      <p className="mt-2 text-sm text-gray-600">{activeVideo.description}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-black uppercase tracking-wide">
                  Vídeos ({activeSection?.videos.length ?? 0})
                </h3>
                <div className="space-y-2">
                  {activeSection?.videos.map((video, index) => (
                    <div
                      key={`${activeSection.id}-${video.title}-${index}`}
                      className={`group flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors ${
                        index === activeVideoIndex
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveVideoIndex(index)}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium text-gray-900">
                            {String(index + 1).padStart(2, "0")}. {video.title}
                          </span>
                          <span className="text-xs text-gray-500">{video.duration}</span>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900">Alterações salvas com sucesso!</h2>
            <p className="mt-2 text-sm text-gray-600">
              O conteúdo foi atualizado e já está disponível para quem tem acesso.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900">
              {confirmDelete.type === "section" ? "Excluir tópico?" : "Excluir aula?"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {confirmDelete.type === "section"
                ? "Esse tópico e todas as aulas dele serão removidos."
                : "Essa aula será removida do curso."}
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteAction}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-3xl rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Editar nomes</h2>
              <p className="mt-1 text-sm text-gray-600">
                Atualize os nomes, duração e gerencie os tópicos.
              </p>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-6">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <label className="block text-xs font-medium text-gray-500 mb-1">Novo tópico</label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={newSectionLabel}
                    onChange={(e) => setNewSectionLabel(e.target.value)}
                    className="flex-1 min-w-[220px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-gray-900"
                    placeholder="Nome do tópico"
                  />
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                  >
                    Adicionar tópico
                  </button>
                </div>
              </div>
              {sections.map((section) => (
                <div key={section.id} className="rounded-lg border border-gray-400 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Tópico
                      </label>
                      <input
                        type="text"
                        value={section.label}
                        onChange={(e) => handleUpdateSectionLabel(section.id, e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSectionCollapse(section.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                      aria-label={collapsedSections[section.id] ? "Expandir tópico" : "Minimizar tópico"}
                      title={collapsedSections[section.id] ? "Expandir tópico" : "Minimizar tópico"}
                    >
                      <svg
                        className={`h-4 w-4 transition-transform ${
                          collapsedSections[section.id] ? "rotate-180" : ""
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDeleteSection(section.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-md border border-red-100 bg-red-50 text-red-700 hover:border-red-200"
                      aria-label="Excluir tópico"
                      title="Excluir tópico"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.22 4.22a.75.75 0 011.06 0L10 8.94l4.72-4.72a.75.75 0 111.06 1.06L11.06 10l4.72 4.72a.75.75 0 01-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 01-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 010-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  {!collapsedSections[section.id] && (
                    <div className="mt-4 space-y-3">
                    {section.videos.map((video, index) => (
                      <div
                        key={`${section.id}-${index}`}
                      className="grid grid-cols-1 gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 md:grid-cols-[1.6fr_0.6fr_auto]"
                      >
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Aula
                          </label>
                          <input
                            type="text"
                            value={video.title}
                            onChange={(e) =>
                              handleUpdateVideoField(section.id, index, "title", e.target.value)
                            }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Duração
                          </label>
                          <input
                            type="text"
                            value={video.duration}
                            onChange={(e) =>
                              handleUpdateVideoField(section.id, index, "duration", e.target.value)
                            }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-gray-900"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Descrição
                          </label>
                          <textarea
                            rows={2}
                            value={video.description ?? ""}
                            onChange={(e) =>
                              handleUpdateVideoField(section.id, index, "description", e.target.value)
                            }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-gray-900"
                            placeholder="Resumo da aula"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Link do YouTube
                          </label>
                          <input
                            type="text"
                            value={video.youtubeUrl ?? ""}
                            onChange={(e) =>
                              handleUpdateVideoUrl(section.id, index, e.target.value)
                            }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-gray-900"
                            placeholder="https://www.youtube.com/watch?v=..."
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            O vídeo será reproduzido no site após salvar o link.
                          </p>
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => requestDeleteVideo(section.id, index)}
                            className="w-full rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:border-red-200"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  <div className="rounded-md border border-dashed border-gray-200 bg-white p-3">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.6fr_0.6fr_auto]">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Nova aula
                          </label>
                          <input
                            type="text"
                            value={modalNewVideoInputs[section.id]?.title ?? ""}
                            onChange={(e) =>
                              handleModalVideoInputChange(section.id, "title", e.target.value)
                            }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-gray-900"
                            placeholder="Título da aula"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Duração
                          </label>
                          <input
                            type="text"
                            value={modalNewVideoInputs[section.id]?.duration ?? ""}
                            onChange={(e) =>
                              handleModalVideoInputChange(section.id, "duration", e.target.value)
                            }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-gray-900"
                            placeholder="Ex: 08:45"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Descrição
                          </label>
                          <textarea
                            rows={2}
                            value={modalNewVideoInputs[section.id]?.description ?? ""}
                            onChange={(e) =>
                              handleModalVideoInputChange(section.id, "description", e.target.value)
                            }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-gray-900"
                            placeholder="Resumo da aula"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => handleModalAddVideo(section.id)}
                          className="w-full rounded-md bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                          >
                            Adicionar
                          </button>
                        </div>
                      </div>
                    </div>
                    {section.videos.length === 0 && (
                      <p className="text-sm text-gray-500">Nenhuma aula neste tópico.</p>
                    )}
                    </div>
                  )}
                </div>
              ))}
              {sections.length === 0 && (
                <p className="text-sm text-gray-500">Nenhum tópico cadastrado.</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      <SiteFooter />
    </div>
  );
}
