"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";

export default function NewBlogPostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    status: "draft",
    coverImage: "",
    metaTitle: "",
    metaDescription: "",
    keywords: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const categories = [
    "Saúde Mental",
    "Adolescentes", 
    "Bem-estar",
    "Família",
    "Superdotação",
    "Altas Habilidades",
    "Ansiedade",
    "Depressão",
    "Terapia",
    "Mindfulness"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch('/api/blog/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.type === 'paciente' ? user.id : null,
          therapistId: user?.type === 'profissional' ? user.id : null,
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt || null,
          coverImage: formData.coverImage || null,
          category: formData.category || null,
          metaTitle: formData.metaTitle || null,
          metaDescription: formData.metaDescription || null,
          keywords: formData.keywords || null,
          published: formData.status === "published"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Erro ao criar post';
        console.error('API Error:', errorMsg, data);
        throw new Error(errorMsg);
      }

      // Redirect to blog management page
      router.push("/dashboard/admin/blog");
    } catch (error: any) {
      console.error("Error creating blog post:", error);
      const errorMessage = error.message || "Erro ao criar post. Verifique se todos os campos obrigatórios estão preenchidos e tente novamente.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-green-600">
                  OASIS da Superdotação
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/dashboard/admin/blog" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                  ← Voltar
                </Link>
                <span className="text-sm text-gray-500">Admin: {user?.name}</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Novo Post</h1>
            <p className="mt-2 text-gray-600">Crie um novo artigo para o blog</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Título do Post *
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Digite o título do post"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                    Resumo *
                  </label>
                  <textarea
                    name="excerpt"
                    id="excerpt"
                    rows={3}
                    required
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Breve descrição do post que aparecerá na listagem"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    name="category"
                    id="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Cover Image */}
                <div>
                  <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">
                    Imagem de Capa (URL)
                  </label>
                  <input
                    type="url"
                    name="coverImage"
                    id="coverImage"
                    value={formData.coverImage}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    URL da imagem que será exibida como capa do post
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    id="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                  </select>
                </div>

                {/* SEO Fields */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">SEO (Opcional)</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Título
                      </label>
                      <input
                        type="text"
                        name="metaTitle"
                        id="metaTitle"
                        value={formData.metaTitle}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="Título para SEO (se vazio, usa o título do post)"
                      />
                    </div>

                    <div>
                      <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Descrição
                      </label>
                      <textarea
                        name="metaDescription"
                        id="metaDescription"
                        rows={2}
                        value={formData.metaDescription}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="Descrição para SEO (se vazio, usa o resumo do post)"
                      />
                    </div>

                    <div>
                      <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
                        Palavras-chave
                      </label>
                      <input
                        type="text"
                        name="keywords"
                        id="keywords"
                        value={formData.keywords}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="palavra1, palavra2, palavra3"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Separe as palavras-chave por vírgula
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow p-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Conteúdo do Post *
              </label>
              <textarea
                name="content"
                id="content"
                rows={20}
                required
                value={formData.content}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                placeholder="Escreva o conteúdo do seu post aqui. Você pode usar HTML básico para formatação."
              />
              <p className="mt-2 text-sm text-gray-500">
                Dica: Use HTML básico para formatação (ex: &lt;h2&gt; para subtítulos, &lt;p&gt; para parágrafos, &lt;ul&gt; para listas)
              </p>
            </div>

            {/* Preview */}
            {formData.title && formData.excerpt && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{formData.title}</h2>
                  <p className="text-gray-600 mb-4">{formData.excerpt}</p>
                  {formData.coverImage && (
                    <img 
                      src={formData.coverImage} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="text-sm text-gray-500">
                    Categoria: {formData.category || "Não selecionada"} | 
                    Status: {formData.status === "published" ? "Publicado" : "Rascunho"}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/dashboard/admin/blog"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Criando..." : "Criar Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}

