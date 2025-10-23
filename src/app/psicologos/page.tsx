"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

// Sample psychologist data - in a real app, this would come from the database
const psychologists = [
  {
    id: 1,
    name: "Dr. Ana Silva",
    title: "Psicóloga Clínica",
    license: "CRP 06/123456",
    specialties: ["Ansiedade", "Depressão", "Terapia Cognitivo-Comportamental"],
    experience: "8 anos",
    rating: 4.9,
    reviews: 127,
    price: "R$ 150",
    location: "São Paulo, SP",
    online: true,
    bio: "Especialista em terapia cognitivo-comportamental com foco em transtornos de ansiedade e depressão. Atendimento presencial e online.",
    languages: ["Português", "Inglês"],
    availability: "Segunda a Sexta, 8h às 18h"
  },
  {
    id: 2,
    name: "Dr. Carlos Mendes",
    title: "Psicólogo Clínico",
    license: "CRP 05/789012",
    specialties: ["Terapia de Casal", "Família", "Psicologia Positiva"],
    experience: "12 anos",
    rating: 4.8,
    reviews: 89,
    price: "R$ 180",
    location: "Rio de Janeiro, RJ",
    online: true,
    bio: "Especialista em terapia familiar e de casal, com vasta experiência em resolução de conflitos e fortalecimento de relacionamentos.",
    languages: ["Português"],
    availability: "Terça a Quinta, 14h às 20h"
  },
  {
    id: 3,
    name: "Dra. Maria Santos",
    title: "Psicóloga Clínica",
    license: "CRP 11/345678",
    specialties: ["Trauma", "EMDR", "Psicologia Hospitalar"],
    experience: "15 anos",
    rating: 4.9,
    reviews: 156,
    price: "R$ 200",
    location: "Belo Horizonte, MG",
    online: false,
    bio: "Especialista em trauma e EMDR, com experiência em psicologia hospitalar e atendimento a pacientes oncológicos.",
    languages: ["Português", "Espanhol"],
    availability: "Segunda a Sexta, 9h às 17h"
  },
  {
    id: 4,
    name: "Dr. João Oliveira",
    title: "Psicólogo Clínico",
    license: "CRP 13/901234",
    specialties: ["Adolescentes", "TDAH", "Terapia Comportamental"],
    experience: "6 anos",
    rating: 4.7,
    reviews: 73,
    price: "R$ 120",
    location: "Salvador, BA",
    online: true,
    bio: "Especialista em atendimento de adolescentes e jovens adultos, com foco em TDAH e terapia comportamental.",
    languages: ["Português"],
    availability: "Segunda a Quinta, 16h às 20h"
  },
  {
    id: 5,
    name: "Dra. Fernanda Costa",
    title: "Psicóloga Clínica",
    license: "CRP 07/567890",
    specialties: ["Gestão de Estresse", "Mindfulness", "Terapia Breve"],
    experience: "10 anos",
    rating: 4.8,
    reviews: 94,
    price: "R$ 160",
    location: "Brasília, DF",
    online: true,
    bio: "Especialista em gestão de estresse e mindfulness, com abordagem de terapia breve focada em resultados.",
    languages: ["Português", "Inglês"],
    availability: "Segunda a Sexta, 8h às 16h"
  },
  {
    id: 6,
    name: "Dr. Roberto Lima",
    title: "Psicólogo Clínico",
    license: "CRP 08/123789",
    specialties: ["Dependência Química", "Grupos Terapêuticos", "Terapia Motivacional"],
    experience: "18 anos",
    rating: 4.9,
    reviews: 201,
    price: "R$ 170",
    location: "Recife, PE",
    online: false,
    bio: "Especialista em dependência química e terapia motivacional, com vasta experiência em grupos terapêuticos.",
    languages: ["Português"],
    availability: "Segunda a Sexta, 7h às 19h"
  }
];

export default function PsicologosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState("");

  // Filter psychologists based on search and filters
  const filteredPsychologists = useMemo(() => {
    return psychologists.filter((psychologist) => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        psychologist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        psychologist.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        psychologist.location.toLowerCase().includes(searchTerm.toLowerCase());

      // Specialty filter
      const matchesSpecialty = selectedSpecialty === "" || 
        psychologist.specialties.some(specialty => 
          specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())
        );

      // Service type filter
      const matchesServiceType = selectedServiceType === "" || 
        (selectedServiceType === "online" && psychologist.online) ||
        (selectedServiceType === "presencial" && !psychologist.online);

      return matchesSearch && matchesSpecialty && matchesServiceType;
    });
  }, [searchTerm, selectedSpecialty, selectedServiceType]);

  // Get unique specialties for filter dropdown
  const allSpecialties = useMemo(() => {
    const specialties = new Set<string>();
    psychologists.forEach(psychologist => {
      psychologist.specialties.forEach(specialty => {
        specialties.add(specialty);
      });
    });
    return Array.from(specialties).sort();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                Psicoasis
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Início
                </Link>
                <Link href="/psicologos" className="text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Psicólogos
                </Link>
                <Link href="/blog" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Blog
                </Link>
                <Link href="#" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Sobre
                </Link>
                <Link href="#" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Contato
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Entrar
              </Link>
              <Link 
                href="/registro" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Psicólogos Disponíveis</h1>
          <p className="text-gray-600 mb-6">
            Encontre o psicólogo ideal para suas necessidades. Todos os profissionais são licenciados e verificados.
          </p>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nome, especialidade ou localização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <select 
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Tipo de atendimento</option>
              <option value="presencial">Presencial</option>
              <option value="online">Online</option>
            </select>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            {filteredPsychologists.length} psicólogo{filteredPsychologists.length !== 1 ? 's' : ''} encontrado{filteredPsychologists.length !== 1 ? 's' : ''}
            {(searchTerm || selectedSpecialty || selectedServiceType) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSpecialty("");
                  setSelectedServiceType("");
                }}
                className="ml-2 text-indigo-600 hover:text-indigo-800 underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Psychologists List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredPsychologists.length === 0 ? (
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredPsychologists.map((psychologist) => (
            <div key={psychologist.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>

                {/* Main Info */}
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{psychologist.name}</h3>
                      <p className="text-indigo-600 font-medium">{psychologist.title}</p>
                      <p className="text-sm text-gray-500">{psychologist.license}</p>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(psychologist.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {psychologist.rating} ({psychologist.reviews} avaliações)
                        </span>
                      </div>

                      {/* Specialties */}
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-2">
                          {psychologist.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                        {psychologist.bio}
                      </p>

                      {/* Additional Info */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Experiência:</span> {psychologist.experience}
                        </div>
                        <div>
                          <span className="font-medium">Idiomas:</span> {psychologist.languages.join(", ")}
                        </div>
                        <div>
                          <span className="font-medium">Localização:</span> {psychologist.location}
                        </div>
                        <div>
                          <span className="font-medium">Disponibilidade:</span> {psychologist.availability}
                        </div>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex flex-col items-end gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-600">{psychologist.price}</div>
                        <div className="text-sm text-gray-500">por sessão</div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {psychologist.online && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Online
                          </span>
                        )}
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Presencial
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                          Agendar Consulta
                        </button>
                        <button className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                          Ver Perfil
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}

        {/* Load More - only show if there are results */}
        {filteredPsychologists.length > 0 && (
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
              <h3 className="text-2xl font-bold text-indigo-400 mb-4">Psicoasis</h3>
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
            <p>&copy; 2024 Psicoasis. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
