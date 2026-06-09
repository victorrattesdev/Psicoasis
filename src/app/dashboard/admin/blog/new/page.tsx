"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TipTapLink from "@tiptap/extension-link";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { authHeaders } from "@/lib/api-client";
import { useRouter } from "next/navigation";

export default function NewBlogPostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    status: "",
    coverImage: ""
  });
  const [customCategory, setCustomCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
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
    content: formData.content || "",
    onCreate: ({ editor }) => {
      editor.commands.unsetBold();
    },
    onFocus: ({ editor }) => {
      if (editor.state.selection.empty && editor.isActive("bold")) {
        editor.commands.unsetBold();
      }
    },
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, content: editor.getHTML() }));
    }
  });

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

  const handleCoverImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, coverImage: typeof reader.result === "string" ? reader.result : "" }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (formData.title.trim().length === 0) {
        throw new Error("O título é obrigatório.");
      }
      const contentText = editor?.getText().trim() ?? "";
      if (contentText.length === 0) {
        throw new Error("O conteúdo é obrigatório.");
      }
      if (!formData.status) {
        throw new Error("Selecione um status.");
      }
      if (formData.category === "other") {
        if (!customCategory.trim()) {
          throw new Error("Informe a categoria.");
        }
        if (!/^[A-Za-z\s]+$/.test(customCategory.trim())) {
          throw new Error("A categoria deve conter apenas letras.");
        }
      }
      if (!formData.category) {
        throw new Error("Selecione uma categoria.");
      }

      const response = await fetch('/api/blog/create', {
        method: 'POST',
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: editor?.getHTML().trim() || "",
          excerpt: formData.excerpt.trim() || null,
          coverImage: formData.coverImage || null,
          category: formData.category === "other" ? customCategory.trim() : (formData.category || null),
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
                    maxLength={60}
                    value={formData.title}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-800 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Digite o título do post"
                  />
                  <p className="mt-1 text-xs text-gray-500">{formData.title.length}/60</p>
                </div>

                {/* Excerpt */}
                <div>
                  <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                    Resumo
                  </label>
                  <textarea
                    name="excerpt"
                    id="excerpt"
                    rows={3}
                    maxLength={150}
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-800 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Breve descrição do post que aparecerá na listagem"
                  />
                  <p className="mt-1 text-xs text-gray-500">{formData.excerpt.length}/150</p>
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
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-800 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value="other">Outro</option>
                  </select>
                </div>
                {formData.category === "other" && (
                  <div>
                    <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700 mb-2">
                      Qual categoria? *
                    </label>
                    <input
                      type="text"
                      name="customCategory"
                      id="customCategory"
                      required
                      maxLength={20}
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value.replace(/[^A-Za-z\s]/g, ""))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-800 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="Digite a categoria"
                    />
                    <p className="mt-1 text-xs text-gray-500">{customCategory.length}/20</p>
                  </div>
                )}

                {/* Cover Image */}
                <div>
                  <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">
                    Imagem de Capa (upload)
                  </label>
                  <input
                    type="file"
                    name="coverImage"
                    id="coverImage"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-green-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-100"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Selecione uma imagem para a capa do post (opcional)
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
                    required
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-800 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Selecione o status</option>
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
                      className="w-full h-48 object-contain rounded-lg mb-4 bg-gray-50"
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
                  className="mt-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-green-500"
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
                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
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
                  className="mt-6 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Entendi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

