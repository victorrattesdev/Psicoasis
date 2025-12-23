"use client";

import Link from "next/link";
import { useMemo, useEffect, useState } from "react";

interface PublicTherapist {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  specialties: any; // stored as Json in Prisma; expect string[]
  photoUrl: string | null;
}

export default function PsicologosPage() {
  const [therapists, setTherapists] = useState<PublicTherapist[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, []);

  const normalized = useMemo(() => therapists.map(t => ({
    ...t,
    specialties: Array.isArray(t.specialties) ? t.specialties as string[] : [],
  })), [therapists]);

  // Filter therapists based on search and filters
  const filteredTherapists = useMemo(() => {
    return normalized.filter((t) => {
      const nameMatch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
      const specMatch = t.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSearch = searchTerm === "" || nameMatch || specMatch;

      const matchesSpecialty = selectedSpecialty === "" || t.specialties.some(s => s.toLowerCase().includes(selectedSpecialty.toLowerCase()));

      // Service type filter currently not implemented in schema; keep placeholder behavior as no-op unless extended
      const matchesServiceType = selectedServiceType === "";

      return matchesSearch && matchesSpecialty && matchesServiceType;
    });
  }, [normalized, searchTerm, selectedSpecialty, selectedServiceType]);

  // Get unique specialties for filter dropdown
  const allSpecialties = useMemo(() => {
    const specialties = new Set<string>();
    normalized.forEach(t => {
      t.specialties.forEach(s => specialties.add(s));
    });
    return Array.from(specialties).sort();
  }, [normalized]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-green-600">
                OASIS da Superdotação
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Início
                </Link>
                <Link href="/psicologos" className="text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                  OASIS da Psicologia
                </Link>
                <Link href="/blog" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Estudos do OASIS
                </Link>
                <Link href="#" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Avaliação Neuropsicológica
                </Link>
                <Link href="#" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Contato
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Entrar
              </Link>
              <Link 
                href="/registro" 
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Registrar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">OASIS da Psicologia</h1>
          <p className="text-gray-600 mb-6">
            Profissionais aprovados pelo OASIS da Superdotação. Encontre especialidades alinhadas às altas habilidades/superdotação.
          </p>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nome ou especialidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
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
            <select 
              value={selectedServiceType}
              onChange={(e) => setSelectedServiceType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Tipo de atendimento (em breve)</option>
              <option value="presencial" disabled>Presencial</option>
              <option value="online" disabled>Online</option>
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
                {(searchTerm || selectedSpecialty || selectedServiceType) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedSpecialty("");
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
                  <div className="flex-1">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{t.name}</h3>
                        {/* Specialties */}
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-2">
                            {t.specialties.map((s: string, index: number) => (
                              <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Bio */}
                        {t.bio && (
                          <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                            {t.bio}
                          </p>
                        )}
                      </div>

                      {/* Actions (placeholder) */}
                      <div className="flex flex-col items-end gap-2">
                        <button className="border border-green-600 text-green-600 hover:bg-green-50 px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                          Ver Perfil
                        </button>
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-green-400 mb-4">OASIS da Superdotação</h3>
              <p className="text-gray-400">
                Seu santuário digital para bem-estar mental e apoio psicológico.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Blog</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/blog" className="hover:text-white transition-colors">Todos os Artigos</Link></li>
                <li><Link href="/blog?category=saude-mental" className="hover:text-white transition-colors">Saúde Mental</Link></li>
                <li><Link href="/blog?category=bem-estar" className="hover:text-white transition-colors">Bem-estar</Link></li>
                <li><Link href="/blog?category=familia" className="hover:text-white transition-colors">Família</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Central de Ajuda</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Política de Privacidade</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Termos de Serviço</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contato</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Emergência</h4>
              <p className="text-gray-400 mb-2">
                Se você está em crise, ligue:
              </p>
              <p className="text-red-400 font-semibold">
                CVV: 188
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 OASIS da Superdotação. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
