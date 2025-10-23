"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// Sample blog posts - in a real app, this would come from the database
const samplePosts = [
  {
    id: 1,
    title: "Entendendo a Ansiedade: Guia Completo para Pacientes",
    excerpt: "A ansiedade é uma resposta natural do nosso corpo, mas quando se torna excessiva, pode impactar significativamente nossa qualidade de vida. Neste artigo, exploramos as causas, sintomas e estratégias de enfrentamento.",
    content: "A ansiedade é uma resposta natural do nosso corpo a situações de perigo ou estresse. No entanto, quando se torna excessiva ou desproporcional à situação, pode impactar significativamente nossa qualidade de vida...",
    author: "Dr. Ana Silva",
    publishedAt: "2024-01-15",
    readTime: "8 min",
    category: "Saúde Mental",
    image: "/api/placeholder/400/250"
  },
  {
    id: 2,
    title: "Como Identificar Sinais de Depressão em Adolescentes",
    excerpt: "A adolescência é um período de grandes mudanças e desafios. Reconhecer os sinais de depressão nesta fase é crucial para oferecer o apoio necessário.",
    content: "A adolescência é um período marcado por transformações físicas, emocionais e sociais significativas. Durante esta fase, é comum experimentar altos e baixos emocionais...",
    author: "Dr. Carlos Mendes",
    publishedAt: "2024-01-10",
    readTime: "6 min",
    category: "Adolescentes",
    image: "/api/placeholder/400/250"
  },
  {
    id: 3,
    title: "Técnicas de Mindfulness para Reduzir o Estresse",
    excerpt: "O mindfulness é uma prática que pode ajudar significativamente na redução do estresse e na melhoria do bem-estar mental. Aprenda técnicas simples que você pode praticar no dia a dia.",
    content: "O mindfulness, ou atenção plena, é uma prática milenar que tem ganhado cada vez mais reconhecimento na psicologia moderna...",
    author: "Dra. Maria Santos",
    publishedAt: "2024-01-05",
    readTime: "10 min",
    category: "Bem-estar",
    image: "/api/placeholder/400/250"
  },
  {
    id: 4,
    title: "A Importância da Terapia Familiar",
    excerpt: "A terapia familiar pode ser uma ferramenta poderosa para resolver conflitos e fortalecer os laços familiares. Descubra como ela pode beneficiar sua família.",
    content: "A família é o primeiro ambiente social onde aprendemos a nos relacionar com outras pessoas. É natural que surjam conflitos e desafios...",
    author: "Dr. João Oliveira",
    publishedAt: "2024-01-01",
    readTime: "7 min",
    category: "Família",
    image: "/api/placeholder/400/250"
  }
];

export default function BlogPage() {
  const [posts, setPosts] = useState(samplePosts);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = ["Todos", "Saúde Mental", "Adolescentes", "Bem-estar", "Família"];

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === "Todos" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
                <Link href="/psicologos" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Psicólogos
                </Link>
                <Link href="/blog" className="text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
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
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Entrar
              </Link>
              <Link 
                href="/registro"
                className="text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 transition-colors"
              >
                Cadastrar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Blog Psicoasis
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Artigos e insights sobre saúde mental, bem-estar e psicologia para ajudar você em sua jornada de autoconhecimento.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredPosts.length === 0 ? (
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
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {post.category}
                    </span>
                    <span className="text-sm text-gray-500">{post.readTime}</span>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600">
                            {post.author.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{post.author}</p>
                        <p className="text-sm text-gray-500">{post.publishedAt}</p>
                      </div>
                    </div>
                    
                    <Link
                      href={`/blog/${post.id}`}
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-500 text-sm font-medium"
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

      {/* Newsletter Section */}
      <div className="bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              Fique por dentro das novidades
            </h2>
            <p className="mt-4 text-xl text-indigo-100">
              Receba nossos artigos mais recentes diretamente no seu e-mail.
            </p>
            <div className="mt-8 max-w-md mx-auto">
              <div className="flex gap-4">
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  className="flex-1 px-4 py-3 rounded-md border-0 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-300"
                />
                <button className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-md hover:bg-gray-50 transition-colors">
                  Inscrever-se
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                Psicoasis
              </Link>
              <p className="mt-4 text-gray-600">
                Conectando pessoas com profissionais de psicologia para uma vida mais saudável e equilibrada.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Blog</h4>
              <ul className="space-y-2">
                <li><Link href="/blog" className="text-gray-600 hover:text-indigo-600">Todos os artigos</Link></li>
                <li><Link href="/blog?category=saude-mental" className="text-gray-600 hover:text-indigo-600">Saúde Mental</Link></li>
                <li><Link href="/blog?category=bem-estar" className="text-gray-600 hover:text-indigo-600">Bem-estar</Link></li>
                <li><Link href="/blog?category=familia" className="text-gray-600 hover:text-indigo-600">Família</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 hover:text-indigo-600">Sobre</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-indigo-600">Contato</Link></li>
                <li><Link href="/psicologos" className="text-gray-600 hover:text-indigo-600">Psicólogos</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-500">
              © 2024 Psicoasis. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

