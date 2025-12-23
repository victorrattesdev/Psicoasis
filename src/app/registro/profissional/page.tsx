"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function ProfissionalRegistroPage() {
  const { register, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    crp: "",
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
    horariosDisponibilidade: "",
    senha: "",
    confirmarSenha: "",
    aceitaTermos: false,
    aceitaPrivacidade: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.type === 'paciente') {
        router.push('/dashboard/paciente');
      } else {
        router.push('/dashboard/profissional');
      }
    }
  }, [isAuthenticated, user, router]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleEspecialidadeChange = (especialidade: string) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.includes(especialidade)
        ? prev.especialidades.filter(e => e !== especialidade)
        : [...prev.especialidades, especialidade]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!formData.email.trim()) newErrors.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email inválido";
    if (!formData.telefone.trim()) newErrors.telefone = "Telefone é obrigatório";
    if (!formData.crp.trim()) newErrors.crp = "CRP é obrigatório";
    if (formData.especialidades.length === 0) newErrors.especialidades = "Selecione pelo menos uma especialidade";
    if (!formData.formacao.trim()) newErrors.formacao = "Formação é obrigatória";
    if (!formData.experiencia.trim()) newErrors.experiencia = "Experiência é obrigatória";
    if (!formData.bio.trim()) newErrors.bio = "Biografia é obrigatória";
    if (!formData.valorConsulta.trim()) newErrors.valorConsulta = "Valor da consulta é obrigatório";
    if (!formData.aceitaOnline && !formData.aceitaPresencial) newErrors.tipoAtendimento = "Selecione pelo menos um tipo de atendimento";
    if (!formData.senha) newErrors.senha = "Senha é obrigatória";
    else if (formData.senha.length < 6) newErrors.senha = "Senha deve ter pelo menos 6 caracteres";
    if (formData.senha !== formData.confirmarSenha) newErrors.confirmarSenha = "Senhas não coincidem";
    if (!formData.aceitaTermos) newErrors.aceitaTermos = "Você deve aceitar os termos de uso";
    if (!formData.aceitaPrivacidade) newErrors.aceitaPrivacidade = "Você deve aceitar a política de privacidade";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const userData = {
        name: formData.nome,
        email: formData.email,
        type: 'profissional' as const,
        telefone: formData.telefone,
        crp: formData.crp,
        especialidades: formData.especialidades,
        formacao: formData.formacao,
        experiencia: formData.experiencia,
        bio: formData.bio,
        valorConsulta: formData.valorConsulta,
        aceitaOnline: formData.aceitaOnline,
        aceitaPresencial: formData.aceitaPresencial,
        horariosDisponibilidade: formData.horariosDisponibilidade,
        endereco: formData.endereco,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep
      };

      const success = await register(userData);
      
      if (success) {
        // Redirect will happen automatically via useEffect
        router.push('/dashboard/profissional');
      } else {
        setErrors({ 
          email: "Este email já está sendo usado. Tente outro email." 
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error?.message || "Erro ao criar conta. Tente novamente.";
      setErrors({ 
        email: errorMessage,
        form: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                OASIS da Superdotação
              </Link>
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Registro de Profissional</h1>
            <p className="text-gray-600">
              Preencha os dados abaixo para se cadastrar como psicólogo na nossa plataforma
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.nome ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Seu nome completo"
                  />
                  {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="seu@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.telefone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>}
                </div>

                <div>
                  <label htmlFor="crp" className="block text-sm font-medium text-gray-700 mb-1">
                    CRP (Conselho Regional de Psicologia) *
                  </label>
                  <input
                    type="text"
                    id="crp"
                    name="crp"
                    value={formData.crp}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.crp ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="CRP 06/123456"
                  />
                  {errors.crp && <p className="text-red-500 text-sm mt-1">{errors.crp}</p>}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Profissionais</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Especialidades *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {especialidadesOptions.map((especialidade) => (
                      <label key={especialidade} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.especialidades.includes(especialidade)}
                          onChange={() => handleEspecialidadeChange(especialidade)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{especialidade}</span>
                      </label>
                    ))}
                  </div>
                  {errors.especialidades && <p className="text-red-500 text-sm mt-1">{errors.especialidades}</p>}
                </div>

                <div>
                  <label htmlFor="formacao" className="block text-sm font-medium text-gray-700 mb-1">
                    Formação Acadêmica *
                  </label>
                  <input
                    type="text"
                    id="formacao"
                    name="formacao"
                    value={formData.formacao}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.formacao ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Psicologia - Universidade de São Paulo"
                  />
                  {errors.formacao && <p className="text-red-500 text-sm mt-1">{errors.formacao}</p>}
                </div>

                <div>
                  <label htmlFor="experiencia" className="block text-sm font-medium text-gray-700 mb-1">
                    Anos de Experiência *
                  </label>
                  <input
                    type="text"
                    id="experiencia"
                    name="experiencia"
                    value={formData.experiencia}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.experiencia ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: 5 anos"
                  />
                  {errors.experiencia && <p className="text-red-500 text-sm mt-1">{errors.experiencia}</p>}
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Biografia Profissional *
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.bio ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Conte um pouco sobre sua experiência, abordagem terapêutica e como você pode ajudar seus pacientes..."
                  />
                  {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações de Atendimento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="valorConsulta" className="block text-sm font-medium text-gray-700 mb-1">
                    Valor da Consulta (R$) *
                  </label>
                  <input
                    type="number"
                    id="valorConsulta"
                    name="valorConsulta"
                    value={formData.valorConsulta}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.valorConsulta ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="150"
                    min="0"
                    step="0.01"
                  />
                  {errors.valorConsulta && <p className="text-red-500 text-sm mt-1">{errors.valorConsulta}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipos de Atendimento *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="aceitaOnline"
                        checked={formData.aceitaOnline}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Atendimento Online</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="aceitaPresencial"
                        checked={formData.aceitaPresencial}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Atendimento Presencial</span>
                    </label>
                  </div>
                  {errors.tipoAtendimento && <p className="text-red-500 text-sm mt-1">{errors.tipoAtendimento}</p>}
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="horariosDisponibilidade" className="block text-sm font-medium text-gray-700 mb-1">
                  Horários de Disponibilidade
                </label>
                <input
                  type="text"
                  id="horariosDisponibilidade"
                  name="horariosDisponibilidade"
                  value={formData.horariosDisponibilidade}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Segunda a Sexta, 8h às 18h"
                />
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Endereço do Consultório</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    id="endereco"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Rua, número, complemento"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      id="cidade"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Sua cidade"
                    />
                  </div>

                  <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="UF"
                    />
                  </div>

                  <div>
                    <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      id="cep"
                      name="cep"
                      value={formData.cep}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="00000-000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Segurança</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                    Senha *
                  </label>
                  <input
                    type="password"
                    id="senha"
                    name="senha"
                    value={formData.senha}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.senha ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Mínimo 6 caracteres"
                  />
                  {errors.senha && <p className="text-red-500 text-sm mt-1">{errors.senha}</p>}
                </div>

                <div>
                  <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    id="confirmarSenha"
                    name="confirmarSenha"
                    value={formData.confirmarSenha}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.confirmarSenha ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Digite a senha novamente"
                  />
                  {errors.confirmarSenha && <p className="text-red-500 text-sm mt-1">{errors.confirmarSenha}</p>}
                </div>
              </div>
            </div>

            {/* Terms and Privacy */}
            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="aceitaTermos"
                  name="aceitaTermos"
                  checked={formData.aceitaTermos}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="aceitaTermos" className="ml-2 text-sm text-gray-700">
                  Eu aceito os{" "}
                  <Link href="#" className="text-indigo-600 hover:text-indigo-800 underline">
                    Termos de Uso
                  </Link>{" "}
                  da plataforma *
                </label>
              </div>
              {errors.aceitaTermos && <p className="text-red-500 text-sm">{errors.aceitaTermos}</p>}

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="aceitaPrivacidade"
                  name="aceitaPrivacidade"
                  checked={formData.aceitaPrivacidade}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="aceitaPrivacidade" className="ml-2 text-sm text-gray-700">
                  Eu aceito a{" "}
                  <Link href="#" className="text-indigo-600 hover:text-indigo-800 underline">
                    Política de Privacidade
                  </Link>{" "}
                  e autorizo o tratamento dos meus dados *
                </label>
              </div>
              {errors.aceitaPrivacidade && <p className="text-red-500 text-sm">{errors.aceitaPrivacidade}</p>}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? "Criando conta..." : "Criar Conta de Profissional"}
              </button>
            </div>

            {/* Back to Registration Options */}
            <div className="text-center">
              <Link 
                href="/registro"
                className="text-green-600 hover:text-green-800 text-sm underline"
              >
                ← Voltar para opções de registro
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
