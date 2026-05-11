"use client";

import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import { useState, useEffect, useMemo } from "react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string | null;
  publishedAt: Date | null;
  author: string;
}

const BASE_CATEGORIES = ["Todos", "Autismo", "Neuropsicologia", "Superdotação", "Saúde Mental", "Adolescentes", "Bem-estar", "Família", "Altas Habilidades"];
const PINNED_CATEGORIES = ["Todos", "Autismo", "Neuropsicologia", "Superdotação"];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(BASE_CATEGORIES);

  useEffect(() => {
    const load = async () => {
      try {
        const url = selectedCategory === "Todos" 
          ? '/api/blog/posts'
          : `/api/blog/posts?category=${encodeURIComponent(selectedCategory)}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const nextPosts = Array.isArray(data?.posts) ? data.posts : [];
        setPosts(nextPosts);
        const dynamicCategories = nextPosts
          .map((post: BlogPost) => (post.category || "").trim())
          .filter(Boolean);
        if (dynamicCategories.length) {
          setCategoryOptions((prev) => {
            const merged = new Set(prev);
            dynamicCategories.forEach((category: string) => merged.add(category));
            return Array.from(merged);
          });
        }
      } catch {}
      finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedCategory]);

  const overflowCategories = categoryOptions.filter((c) => !PINNED_CATEGORIES.includes(c));

  const filteredPosts = useMemo(
    () =>
      posts.filter((post) => {
        if (searchTerm === "") return true;
        const term = searchTerm.toLowerCase();
        return (
          post.title.toLowerCase().includes(term) ||
          (post.excerpt?.toLowerCase().includes(term) ?? false)
        );
      }),
    [posts, searchTerm]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Artigos
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Artigos sobre os mais diversos tópicos relacionados a saúde mental e a neuropsicologia com objetivo de informar, esclarecer e até mesmo ajudar você.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="w-full md:w-auto md:flex-1 md:max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar artigos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37]"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full md:flex-1 flex items-center gap-3 md:justify-end overflow-hidden">
              <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                {PINNED_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-[#d4af37] text-black"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
              </div>
              {overflowCategories.length > 0 && (
                <select
                  value={overflowCategories.includes(selectedCategory) ? selectedCategory : ""}
                  onChange={(e) => {
                    if (e.target.value) setSelectedCategory(e.target.value);
                  }}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37]"
                >
                  <option value="">Mais temas</option>
                  {overflowCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37] mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando artigos...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum artigo encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Tente ajustar seus filtros de busca.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {post.coverImage && (
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    {post.category && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fff4c1] text-[#7a5a00]">
                        {post.category}
                      </span>
                    )}
                    {post.publishedAt && (
                      <span className="text-sm text-gray-500">
                        {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h2>
                  
                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="shrink-0">
                        <div className="h-8 w-8 rounded-full bg-[#fff4c1] flex items-center justify-center">
                          <span className="text-sm font-medium text-[#7a5a00]">
                            {post.author.split(' ').map(n => n[0]).slice(0,2).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{post.author}</p>
                      </div>
                    </div>
                    
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[#d4af37] hover:text-[#c9a227] text-sm font-medium"
                    >
                      Ler mais
                      <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}

