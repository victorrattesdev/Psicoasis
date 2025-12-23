"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// Sample blog post data - in a real app, this would come from the database
const samplePost = {
  id: 1,
  title: "Entendendo a Ansiedade: Guia Completo para Pacientes",
  content: `
    <p>A ansiedade é uma resposta natural do nosso corpo a situações de perigo ou estresse. No entanto, quando se torna excessiva ou desproporcional à situação, pode impactar significativamente nossa qualidade de vida.</p>
    
    <h2>O que é a Ansiedade?</h2>
    <p>A ansiedade é uma emoção normal que todos experimentamos em diferentes momentos da vida. Ela nos ajuda a nos preparar para situações desafiadoras e pode até melhorar nosso desempenho. No entanto, quando a ansiedade se torna crônica, intensa ou interfere em nossas atividades diárias, ela pode se tornar um transtorno.</p>
    
    <h2>Sintomas Comuns</h2>
    <p>Os sintomas de ansiedade podem variar de pessoa para pessoa, mas alguns dos mais comuns incluem:</p>
    <ul>
      <li>Sensação de nervosismo ou inquietação</li>
      <li>Preocupação excessiva</li>
      <li>Dificuldade de concentração</li>
      <li>Irritabilidade</li>
      <li>Tensão muscular</li>
      <li>Problemas de sono</li>
      <li>Fadiga</li>
      <li>Sudorese excessiva</li>
      <li>Tremores</li>
      <li>Palpitações</li>
    </ul>
    
    <h2>Estratégias de Enfrentamento</h2>
    <p>Existem várias técnicas que podem ajudar a gerenciar a ansiedade:</p>
    
    <h3>1. Técnicas de Respiração</h3>
    <p>A respiração profunda e controlada pode ajudar a ativar o sistema nervoso parassimpático, promovendo relaxamento.</p>
    
    <h3>2. Mindfulness e Meditação</h3>
    <p>Práticas de atenção plena podem ajudar a focar no presente e reduzir preocupações sobre o futuro.</p>
    
    <h3>3. Exercício Físico</h3>
    <p>A atividade física regular libera endorfinas e pode ajudar a reduzir os níveis de ansiedade.</p>
    
    <h3>4. Alimentação Balanceada</h3>
    <p>Uma dieta equilibrada pode ter impacto positivo na saúde mental.</p>
    
    <h2>Quando Buscar Ajuda Profissional</h2>
    <p>É importante buscar ajuda profissional quando:</p>
    <ul>
      <li>A ansiedade interfere significativamente na vida diária</li>
      <li>Os sintomas persistem por mais de 6 meses</li>
      <li>Você evita situações que antes eram normais</li>
      <li>Os sintomas causam sofrimento intenso</li>
    </ul>
    
    <p>Lembre-se de que buscar ajuda é um sinal de força, não de fraqueza. Profissionais de psicologia estão preparados para oferecer o suporte necessário para superar os desafios da ansiedade.</p>
  `,
  author: "Dr. Ana Silva",
  publishedAt: "2024-01-15",
  readTime: "8 min",
  category: "Saúde Mental",
  image: "/api/placeholder/800/400",
  excerpt: "A ansiedade é uma resposta natural do nosso corpo, mas quando se torna excessiva, pode impactar significativamente nossa qualidade de vida. Neste artigo, exploramos as causas, sintomas e estratégias de enfrentamento."
};

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState(samplePost);
  const [relatedPosts, setRelatedPosts] = useState([]);

  // In a real app, you would fetch the post data based on params.id
  useEffect(() => {
    // Simulate fetching post data
    setPost(samplePost);
  }, [params.id]);

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
                <Link href="/psicologos" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  OASIS da Psicologia
                </Link>
                <Link href="/blog" className="text-green-600 px-3 py-2 rounded-md text-sm font-medium">
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
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Entrar
              </Link>
              <Link 
                href="/registro"
                className="text-green-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-green-50 transition-colors"
              >
                Cadastrar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/" className="text-gray-400 hover:text-gray-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <Link href="/blog" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                    Estudos do OASIS
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-500 truncate">
                    {post.title}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Article Header */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {post.category}
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
              {post.title}
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {post.excerpt}
            </p>
            
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-green-600">
                    {post.author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{post.author}</p>
                  <p>{post.publishedAt}</p>
                </div>
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {post.readTime}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Image */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="aspect-w-16 aspect-h-9 mb-12">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg shadow-lg"
          />
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </div>

      {/* Related Articles */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Artigos Relacionados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sample related posts */}
            <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src="/api/placeholder/400/250"
                  alt="Como Identificar Sinais de Depressão em Adolescentes"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                  Adolescentes
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Como Identificar Sinais de Depressão em Adolescentes
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  A adolescência é um período de grandes mudanças e desafios...
                </p>
                <Link
                  href="/blog/2"
                  className="inline-flex items-center text-green-600 hover:text-green-500 text-sm font-medium"
                >
                  Ler mais
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>

            <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src="/api/placeholder/400/250"
                  alt="Técnicas de Mindfulness para Reduzir o Estresse"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                  Bem-estar
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Técnicas de Mindfulness para Reduzir o Estresse
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  O mindfulness é uma prática que pode ajudar significativamente...
                </p>
                <Link
                  href="/blog/3"
                  className="inline-flex items-center text-green-600 hover:text-green-500 text-sm font-medium"
                >
                  Ler mais
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>

            <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src="/api/placeholder/400/250"
                  alt="A Importância da Terapia Familiar"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                  Família
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  A Importância da Terapia Familiar
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  A terapia familiar pode ser uma ferramenta poderosa...
                </p>
                <Link
                  href="/blog/4"
                  className="inline-flex items-center text-green-600 hover:text-green-500 text-sm font-medium"
                >
                  Ler mais
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="text-2xl font-bold text-green-600">
                OASIS da Superdotação
              </Link>
              <p className="mt-4 text-gray-600">
                Conectando pessoas com profissionais de psicologia para uma vida mais saudável e equilibrada.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Blog</h4>
              <ul className="space-y-2">
                <li><Link href="/blog" className="text-gray-600 hover:text-green-600">Todos os artigos</Link></li>
                <li><Link href="/blog?category=saude-mental" className="text-gray-600 hover:text-green-600">Saúde Mental</Link></li>
                <li><Link href="/blog?category=bem-estar" className="text-gray-600 hover:text-green-600">Bem-estar</Link></li>
                <li><Link href="/blog?category=familia" className="text-gray-600 hover:text-green-600">Família</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 hover:text-green-600">Sobre</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-green-600">Contato</Link></li>
                <li><Link href="/psicologos" className="text-gray-600 hover:text-green-600">OASIS da Psicologia</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-500">
              © 2024 OASIS da Superdotação. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

