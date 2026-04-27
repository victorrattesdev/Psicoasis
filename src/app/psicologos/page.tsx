"use client";

import SiteFooter from "@/components/SiteFooter";
import { useMemo, useEffect, useState } from "react";

interface PublicTherapist {
  id: string;
  name: string;
  email: string;
  license: string | null;
  bio: string | null;
  specialties: any; // stored as Json in Prisma; expect string[]
  photoUrl: string | null;
  approved: boolean;
  canPostBlog: boolean;
  profile: any;
  createdAt: string;
  updatedAt: string;
  approaches?: string[];
}

export default function PsicologosPage() {
  const [therapists, setTherapists] = useState<PublicTherapist[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedApproach, setSelectedApproach] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<PublicTherapist | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/therapists/public', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Erro ao carregar psicólogos');
        }
        const data = await res.json();
        const therapistsList = Array.isArray(data?.therapists) ? data.therapists : [];
        setTherapists(therapistsList);
        console.log(`✅ Carregados ${therapistsList.length} psicólogo(s) aprovado(s)`);
      } catch (err) {
        console.error('Erro ao carregar psicólogos:', err);
        setError('Erro ao carregar psicólogos. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    load();

    return () => {
      setSearchTerm("");
      setSelectedSpecialty("");
      setSelectedApproach("");
    };
  }, []);

  const normalizeListValue = (value: any): string[] => {
    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return [];

      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => (typeof item === "string" ? item.trim() : ""))
            .filter(Boolean);
        }
      } catch {
        // fall back to splitting below
      }

      return trimmed
        .split(/[,;|]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  const getDisplaySpecialties = (therapist: PublicTherapist) => {
    const primary = normalizeListValue(therapist.specialties);
    if (primary.length) return primary;
    return normalizeListValue(therapist.profile?.especialidades);
  };

  const getDisplayApproaches = (therapist: PublicTherapist) => {
    return normalizeListValue(therapist.profile?.abordagens ?? therapist.profile?.abordagem);
  };

  const getServiceTypes = (therapist: PublicTherapist) => {
    const online = Boolean(therapist.profile?.aceitaOnline);
    const presencial = Boolean(therapist.profile?.aceitaPresencial);
    const types: string[] = [];
    if (online) types.push("Online");
    if (presencial) types.push("Presencial");
    return types.length ? types : ["Nao informado"];
  };

  const getWhatsappLink = (therapistName: string) => {
    const digits = "5521995782684";
    const message = `Olá, gostaria de agendar uma consulta com o ${therapistName}.`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  };


  const formatDate = (value?: string) => {
    if (!value) return "Nao informado";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderProfileValue = (value: any) => {
    if (value === null || value === undefined || value === "") {
      return "Nao informado";
    }
    if (Array.isArray(value)) {
      return value.length ? value.join(", ") : "Nao informado";
    }
    if (typeof value === "object") {
      const entries = Object.entries(value).filter(
        ([key]) => !["especialidades", "abordagens", "abordagem", "crp"].includes(key.toLowerCase())
      );
      if (!entries.length) return "Nao informado";
      return (
        <div className="space-y-2">
          {entries.map(([key, entryValue]) => (
            <div key={key} className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">{key}:</span>{" "}
              {Array.isArray(entryValue)
                ? entryValue.join(", ")
                : String(entryValue ?? "Nao informado")}
            </div>
          ))}
        </div>
      );
    }
    return String(value);
  };

  useEffect(() => {
    if (!isModalOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
        setSelectedTherapist(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isModalOpen]);

  const normalized = useMemo(
    () =>
      therapists.map((t) => ({
        ...t,
        specialties: getDisplaySpecialties(t),
        approaches: getDisplayApproaches(t),
      })),
    [therapists]
  );

  // Filter therapists based on search and filters
  const filteredTherapists = useMemo(() => {
    const filtered = normalized.filter((t) => {
      const nameMatch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
      const specMatch = t.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const approachMatch = (t.approaches || []).some(a => a.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSearch = searchTerm === "" || nameMatch || specMatch || approachMatch;

      const matchesSpecialty = selectedSpecialty === "" || t.specialties.some(s => s.toLowerCase().includes(selectedSpecialty.toLowerCase()));
      const matchesApproach = selectedApproach === "" || (t.approaches || []).some(a => a.toLowerCase().includes(selectedApproach.toLowerCase()));

      return matchesSearch && matchesSpecialty && matchesApproach;
    });

    return filtered.sort(() => Math.random() - 0.5);
  }, [normalized, searchTerm, selectedApproach, selectedSpecialty]);

  // Get unique specialties for filter dropdown
  const allSpecialties = useMemo(() => {
    const specialties = new Set<string>();
    normalized.forEach(t => {
      t.specialties.forEach(s => specialties.add(s));
    });
    return Array.from(specialties).sort();
  }, [normalized]);
  const allApproaches = useMemo(() => {
    const approaches = new Set<string>();
    normalized.forEach(t => {
      (t.approaches || []).forEach(a => approaches.add(a));
    });
    return Array.from(approaches).sort();
  }, [normalized]);

  const modalSpecialties = selectedTherapist
    ? getDisplaySpecialties(selectedTherapist)
    : [];
  const modalApproaches = selectedTherapist
    ? getDisplayApproaches(selectedTherapist)
    : [];
  const modalServiceTypes = selectedTherapist
    ? getServiceTypes(selectedTherapist)
    : ["Nao informado"];


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Faça terapia da sua casa</h1>
          <p className="text-lg text-gray-700 font-medium leading-relaxed mb-8">
            Atendimento online com conforto e segurança para pacientes a partir de 16 anos, com qualidade profissional e todo o suporte necessário para uma terapia completa.
          </p>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nome, abordagem ou especialidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select 
              value={selectedApproach}
              onChange={(e) => setSelectedApproach(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todas as abordagens</option>
              {allApproaches.map((approach) => (
                <option key={approach} value={approach.toLowerCase()}>
                  {approach}
                </option>
              ))}
            </select>
            <select 
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todas as especialidades</option>
              {allSpecialties.map((specialty) => (
                <option key={specialty} value={specialty.toLowerCase()}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            {isLoading ? (
              <span>Carregando psicólogos...</span>
            ) : error ? (
              <span className="text-red-600">{error}</span>
            ) : (
              <>
                {filteredTherapists.length} psicólogo{filteredTherapists.length !== 1 ? 's' : ''} aprovado{filteredTherapists.length !== 1 ? 's' : ''}
                {(searchTerm || selectedSpecialty) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedSpecialty("");
                      setSelectedApproach("");
                      setSelectedServiceType("");
                    }}
                    className="ml-2 text-green-600 hover:text-green-800 underline"
                  >
                    Limpar filtros
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Therapists List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando psicólogos aprovados...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar psicólogos</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Tentar Novamente
            </button>
          </div>
        ) : filteredTherapists.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum psicólogo encontrado</h3>
            <p className="text-gray-600 mb-4">
              Tente ajustar seus filtros de busca para encontrar mais resultados.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedSpecialty("");
                setSelectedApproach("");
                setSelectedServiceType("");
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredTherapists.map((t) => (
              <div key={t.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    {t.photoUrl ? (
                      <img src={t.photoUrl} alt={t.name} className="w-24 h-24 rounded-full object-cover" />
                    ) : (
                      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-700 font-semibold text-xl">
                          {t.name.split(' ').map(n => n[0]).slice(0,2).join('')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-4 h-full">
                      <div className="min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900">{t.name}</h3>
                        {/* Abordagens */}
                        {t.approaches && t.approaches.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-2">
                              {t.approaches.map((a: string, index: number) => (
                                <span key={index} className="px-3 py-1 bg-[#e7f6ee] text-[#1c6f3b] text-sm rounded-full border border-[#b7e4c7]">
                                  {a}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Especialidades */}
                        {t.specialties.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-2">
                              {t.specialties.map((s: string, index: number) => (
                                <span key={index} className="px-3 py-1 bg-[#fff4c1] text-[#7a5a00] text-sm rounded-full border border-[#f2c94c]">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Bio */}
                        {t.bio && (
                          <p className="text-gray-600 mt-3 text-sm leading-relaxed break-words">
                            {t.bio}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedTherapist(t);
                            setIsModalOpen(true);
                          }}
                          className="border border-black text-black hover:bg-gray-100 px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                        >
                          Ver mais
                        </button>
                        <a
                          href={getWhatsappLink(t.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-[#0b5d2a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#094b22] transition-colors"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                            <path d="M19.11 17.4c-.27-.14-1.6-.79-1.85-.88-.25-.09-.44-.14-.62.14-.18.27-.71.88-.87 1.06-.16.18-.32.2-.59.07-.27-.14-1.15-.42-2.19-1.35-.81-.72-1.36-1.61-1.52-1.88-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.46.09-.18.05-.34-.02-.48-.07-.14-.62-1.5-.85-2.06-.22-.53-.44-.46-.62-.47-.16-.01-.34-.01-.52-.01s-.48.07-.73.34c-.25.27-.96.94-.96 2.3 0 1.35.98 2.66 1.12 2.84.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.58.65.21 1.25.18 1.72.11.52-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z" />
                            <path d="M16.03 5C9.95 5 5 9.93 5 16c0 1.96.52 3.87 1.5 5.56L5 27l5.63-1.46A11 11 0 0 0 16.03 27C22.11 27 27.05 22.07 27.05 16S22.11 5 16.03 5zm0 19.5a8.48 8.48 0 0 1-4.31-1.17l-.31-.18-3.34.87.89-3.26-.2-.34A8.48 8.48 0 1 1 16.03 24.5z" />
                          </svg>
                          Entre em contato
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More - placeholder */}
        {filteredTherapists.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors duration-200">
              Carregar Mais Psicólogos
            </button>
          </div>
        )}
      </div>

      <SiteFooter />

      {isModalOpen && selectedTherapist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="absolute inset-0"
            onClick={() => {
              setIsModalOpen(false);
              setSelectedTherapist(null);
            }}
          />
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-200 p-6">
              <div className="flex items-center gap-4">
                {selectedTherapist.photoUrl ? (
                  <img
                    src={selectedTherapist.photoUrl}
                    alt={selectedTherapist.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <span className="text-green-700 font-semibold text-xl">
                      {selectedTherapist.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold text-gray-900">{selectedTherapist.name}</h2>
                  <a
                    href={getWhatsappLink(selectedTherapist.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0b5d2a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#094b22] transition-colors"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                      <path d="M19.11 17.4c-.27-.14-1.6-.79-1.85-.88-.25-.09-.44-.14-.62.14-.18.27-.71.88-.87 1.06-.16.18-.32.2-.59.07-.27-.14-1.15-.42-2.19-1.35-.81-.72-1.36-1.61-1.52-1.88-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.46.09-.18.05-.34-.02-.48-.07-.14-.62-1.5-.85-2.06-.22-.53-.44-.46-.62-.47-.16-.01-.34-.01-.52-.01s-.48.07-.73.34c-.25.27-.96.94-.96 2.3 0 1.35.98 2.66 1.12 2.84.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.58.65.21 1.25.18 1.72.11.52-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z" />
                      <path d="M16.03 5C9.95 5 5 9.93 5 16c0 1.96.52 3.87 1.5 5.56L5 27l5.63-1.46A11 11 0 0 0 16.03 27C22.11 27 27.05 22.07 27.05 16S22.11 5 16.03 5zm0 19.5a8.48 8.48 0 0 1-4.31-1.17l-.31-.18-3.34.87.89-3.26-.2-.34A8.48 8.48 0 1 1 16.03 24.5z" />
                    </svg>
                    Entre em contato
                  </a>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedTherapist(null);
                }}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Fechar modal"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="rounded-xl border border-gray-200 bg-white p-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bio</h3>
                <p className="mt-3 text-sm text-gray-700 leading-relaxed break-words">
                  {selectedTherapist.bio ||
                    selectedTherapist.profile?.bio ||
                    "Bio não informada."}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Abordagem</h3>
                  {modalApproaches.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {modalApproaches.map((a: string, index: number) => (
                        <span
                          key={index}
                          className="rounded-full border border-[#b7e4c7] bg-[#e7f6ee] px-2.5 py-1 text-xs font-medium text-[#1c6f3b]"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">Abordagem não informada.</p>
                  )}
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Especialidades</h3>
                  {modalSpecialties.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {modalSpecialties.map((s: string, index: number) => (
                        <span
                          key={index}
                          className="rounded-full border border-[#f2c94c] bg-[#fff4c1] px-2.5 py-1 text-xs font-medium text-[#7a5a00]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">Especialidades não informadas.</p>
                  )}
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Detalhes</h3>
                  <div className="mt-3 grid gap-3 text-sm text-gray-600">
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5">
                      <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        Valor da consulta
                      </span>
                      <p className="mt-1 text-sm font-medium text-emerald-900">
                        {selectedTherapist.profile?.valorConsulta
                          ? `R$ ${selectedTherapist.profile.valorConsulta}`
                          : "Nao informado"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-2.5">
                      <span className="text-xs font-semibold uppercase tracking-wide text-indigo-700">CRP</span>
                      <p className="mt-1 text-sm font-medium text-indigo-900">
                        {selectedTherapist.license || "Nao informado"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-[#f2c94c] bg-[#fff4c1] p-2.5">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[#8a6a00]">
                        Tempo de experiência
                      </span>
                      <p className="mt-1 text-sm font-medium text-[#7a5a00]">
                        {selectedTherapist.profile?.experiencia || "Nao informado"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedTherapist(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
