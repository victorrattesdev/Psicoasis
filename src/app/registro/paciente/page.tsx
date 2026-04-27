"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";

export default function PacienteRegistroPage() {
  const { register, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    dataNascimento: "",
    genero: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
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

  const formatCep = (value: string) => {
    const digits = formatOnlyNumbers(value, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    let nextValue = value;
    if (type !== "checkbox") {
      if (name === "nome") nextValue = formatOnlyLetters(value, 50);
      if (name === "telefone") nextValue = formatPhone(value);
      if (name === "dataNascimento") nextValue = formatDate(value);
      if (name === "cidade") nextValue = formatOnlyLetters(value, 30);
      if (name === "estado") nextValue = formatOnlyLetters(value, 2).toUpperCase();
      if (name === "cep") nextValue = formatCep(value);
      if (name === "endereco") nextValue = value.slice(0, 60);
      if (name === "senha") nextValue = value.slice(0, 20);
      if (name === "confirmarSenha") nextValue = value.slice(0, 20);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : nextValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(formData.nome)) newErrors.nome = "Nome deve conter apenas letras";
    else if (formData.nome.trim().length > 50) newErrors.nome = "Nome deve ter no máximo 50 caracteres";
    if (!formData.email.trim()) newErrors.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email inválido";
    if (!formData.telefone.trim()) newErrors.telefone = "Telefone é obrigatório";
    else if (formatOnlyNumbers(formData.telefone, 11).length !== 11) newErrors.telefone = "Telefone deve ter 11 números";
    if (!formData.dataNascimento) newErrors.dataNascimento = "Data de nascimento é obrigatória";
    else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.dataNascimento)) newErrors.dataNascimento = "Data deve estar no formato dd/mm/aaaa";
    if (!formData.genero) newErrors.genero = "Gênero é obrigatório";
    if (!formData.endereco.trim()) newErrors.endereco = "Endereço é obrigatório";
    else if (formData.endereco.trim().length > 60) newErrors.endereco = "Endereço deve ter no máximo 60 caracteres";
    if (!formData.cidade.trim()) newErrors.cidade = "Cidade é obrigatória";
    else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(formData.cidade)) newErrors.cidade = "Cidade deve conter apenas letras";
    else if (formData.cidade.trim().length > 30) newErrors.cidade = "Cidade deve ter no máximo 30 caracteres";
    if (!formData.estado.trim()) newErrors.estado = "Estado é obrigatório";
    else if (!/^[A-Za-z]{2}$/.test(formData.estado)) newErrors.estado = "Estado deve ter 2 letras";
    if (!formData.cep.trim()) newErrors.cep = "CEP é obrigatório";
    else if (formatOnlyNumbers(formData.cep, 8).length !== 8) newErrors.cep = "CEP deve ter 8 números";
    if (!formData.senha) newErrors.senha = "Senha é obrigatória";
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,20}$/.test(formData.senha)) {
      newErrors.senha = "Senha deve ter 6-20 caracteres, maiúscula, minúscula, número e caractere";
    }
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
        type: 'paciente' as const,
        telefone: formData.telefone,
        dataNascimento: formData.dataNascimento,
        genero: formData.genero,
        endereco: formData.endereco,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep
      };

      const success = await register(userData, formData.senha);
      
      if (success) {
        // Redirect will happen automatically via useEffect
        router.push('/dashboard/paciente');
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
      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#fff4c1] rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Registro de Paciente</h1>
            <p className="text-gray-600">
              Preencha os dados abaixo para criar sua conta e começar sua jornada de bem-estar mental
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-900 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    maxLength={50}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent ${
                      errors.nome ? 'border-red-500' : 'border-gray-400'
                    }`}
                    placeholder="Seu nome completo"
                  />
                  {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    maxLength={254}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-400'
                    }`}
                    placeholder="seu@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium text-gray-900 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    inputMode="numeric"
                    maxLength={15}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent ${
                      errors.telefone ? 'border-red-500' : 'border-gray-400'
                    }`}
                    placeholder="(00) 00000-0000"
                  />
                  {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>}
                </div>

                <div>
                  <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-900 mb-1">
                    Data de Nascimento *
                  </label>
                  <input
                    type="text"
                    id="dataNascimento"
                    name="dataNascimento"
                    value={formData.dataNascimento}
                    onChange={handleInputChange}
                    inputMode="numeric"
                    maxLength={10}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent ${
                      errors.dataNascimento ? 'border-red-500' : 'border-gray-400'
                    }`}
                    placeholder="dd/mm/aaaa"
                  />
                  {errors.dataNascimento && <p className="text-red-500 text-sm mt-1">{errors.dataNascimento}</p>}
                </div>

                <div>
                  <label htmlFor="genero" className="block text-sm font-medium text-gray-900 mb-1">
                    Gênero *
                  </label>
                  <select
                    id="genero"
                    name="genero"
                    value={formData.genero}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent ${
                      errors.genero ? 'border-red-500' : 'border-gray-400'
                    }`}
                  >
                    <option value="">Selecione</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="nao-binario">Não-binário</option>
                    <option value="prefiro-nao-informar">Prefiro não informar</option>
                  </select>
                  {errors.genero && <p className="text-red-500 text-sm mt-1">{errors.genero}</p>}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Endereço</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="endereco" className="block text-sm font-medium text-gray-900 mb-1">
                    Endereço *
                  </label>
                  <input
                    type="text"
                    id="endereco"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleInputChange}
                    maxLength={60}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent ${
                      errors.endereco ? 'border-red-500' : 'border-gray-400'
                    }`}
                    placeholder="Rua, número, complemento"
                  />
                  {errors.endereco && <p className="text-red-500 text-sm mt-1">{errors.endereco}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="cidade" className="block text-sm font-medium text-gray-900 mb-1">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      id="cidade"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleInputChange}
                      maxLength={30}
                      className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent ${
                        errors.cidade ? 'border-red-500' : 'border-gray-400'
                      }`}
                      placeholder="Sua cidade"
                    />
                    {errors.cidade && <p className="text-red-500 text-sm mt-1">{errors.cidade}</p>}
                  </div>

                  <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-900 mb-1">
                      Estado *
                    </label>
                    <input
                      type="text"
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      maxLength={2}
                      className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 uppercase focus:ring-2 focus:ring-[#d4af37] focus:border-transparent ${
                        errors.estado ? 'border-red-500' : 'border-gray-400'
                      }`}
                      placeholder="UF"
                    />
                    {errors.estado && <p className="text-red-500 text-sm mt-1">{errors.estado}</p>}
                  </div>

                  <div>
                    <label htmlFor="cep" className="block text-sm font-medium text-gray-900 mb-1">
                      CEP *
                    </label>
                    <input
                      type="text"
                      id="cep"
                      name="cep"
                      value={formData.cep}
                      onChange={handleInputChange}
                      inputMode="numeric"
                      maxLength={9}
                      className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent ${
                        errors.cep ? 'border-red-500' : 'border-gray-400'
                      }`}
                      placeholder="00000-000"
                    />
                    {errors.cep && <p className="text-red-500 text-sm mt-1">{errors.cep}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Security */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Segurança</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="senha" className="block text-sm font-medium text-gray-900 mb-1">
                    Senha *
                  </label>
                  <input
                    type="password"
                    id="senha"
                    name="senha"
                    value={formData.senha}
                    onChange={handleInputChange}
                    maxLength={20}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent ${
                      errors.senha ? 'border-red-500' : 'border-gray-400'
                    }`}
                    placeholder="Até 20 caracteres"
                  />
                  {errors.senha && <p className="text-red-500 text-sm mt-1">{errors.senha}</p>}
                </div>

                <div>
                  <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-900 mb-1">
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    id="confirmarSenha"
                    name="confirmarSenha"
                    value={formData.confirmarSenha}
                    onChange={handleInputChange}
                    maxLength={20}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent ${
                      errors.confirmarSenha ? 'border-red-500' : 'border-gray-400'
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
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-400 rounded"
                />
                <label htmlFor="aceitaTermos" className="ml-2 text-sm text-gray-900">
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
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-400 rounded"
                />
                <label htmlFor="aceitaPrivacidade" className="ml-2 text-sm text-gray-900">
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
                className="w-full bg-[#d4af37] hover:bg-[#c9a227] disabled:bg-[#e7d48a] text-black font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? "Criando conta..." : "Criar Conta de Paciente"}
              </button>
            </div>

            {/* Back to Registration Options */}
            <div className="text-center">
              <Link 
                href="/registro"
                className="text-[#d4af37] hover:text-[#c9a227] text-sm underline"
              >
                ← Voltar para opções de registro
              </Link>
            </div>
          </form>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
