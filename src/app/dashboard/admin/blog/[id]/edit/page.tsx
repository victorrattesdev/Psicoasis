"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Sample blog post data - in a real app, this would come from the database
const samplePost = {
  id: 1,
  title: "Entendendo a Ansiedade: Guia Completo para Pacientes",
  excerpt: "A ansiedade é uma resposta natural do nosso corpo, mas quando se torna excessiva, pode impactar significativamente nossa qualidade de vida.",
  content: `<p>A ansiedade é uma resposta natural do nosso corpo a situações de perigo ou estresse. No entanto, quando se torna excessiva ou desproporcional à situação, pode impactar significativamente nossa qualidade de vida.</p>

<h2>O que é a Ansiedade?</h2>
<p>A ansiedade é uma emoção normal que todos experimentamos em diferentes momentos da vida. Ela nos ajuda a nos preparar para situações desafiadoras e pode até melhorar nosso desempenho.</p>

<h2>Sintomas Comuns</h2>
<p>Os sintomas de ansiedade podem variar de pessoa para pessoa, mas alguns dos mais comuns incluem:</p>
<ul>
<li>Sensação de nervosismo ou inquietação</li>
<li>Preocupação excessiva</li>
<li>Dificuldade de concentração</li>
<li>Irritabilidade</li>
</ul>`,
  category: "Saúde Mental",
  status: "published",
  featuredImage: "/api/placeholder/800/400",
  publishedAt: "2024-01-15",
  author: "Dr. Ana Silva"
};

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    status: "draft",
    featuredImage: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    "Ansiedade",
    "Depressão",
    "Terapia",
    "Mindfulness"
  ];

  // Load post data
  useEffect(() => {
    // In a real app, you would fetch the post data based on params.id
    const loadPost = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setFormData({
          title: samplePost.title,
          excerpt: samplePost.excerpt,
          content: samplePost.content,
          category: samplePost.category,
          status: samplePost.status,
          featuredImage: samplePost.featuredImage
        });
      } catch (error) {
        console.error("Error loading post:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [params.id]);

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

    try {
      // In a real app, you would make an API call here
      console.log("Updating blog post:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to blog management page
      window.location.href = "/dashboard/admin/blog";
    } catch (error) {
      console.error("Error updating blog post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando post...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-indigo-600">
                  OASIS da Superdotação
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/dashboard/admin/blog" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  ← Voltar
                </Link>
                <Link href={`/blog/${params.id}`} className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Ver Post
                </Link>
                <span className="text-sm text-gray-500">Admin: {user?.name}</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Editar Post</h1>
            <p className="mt-2 text-gray-600">Edite as informações do post</p>
          </div>

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
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Featured Image */}
                <div>
                  <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 mb-2">
                    Imagem Destacada
                  </label>
                  <input
                    type="url"
                    name="featuredImage"
                    id="featuredImage"
                    value={formData.featuredImage}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="URL da imagem (opcional)"
                  />
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
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                  </select>
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                  {formData.featuredImage && (
                    <img 
                      src={formData.featuredImage} 
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
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}





