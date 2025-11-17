"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string | null;
  publishedAt: Date;
  authorUser: { name: string | null; email: string } | null;
  authorTherapist: { name: string; email: string } | null;
}

export default function BlogPostClient({ post }: { post: Post }) {
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);

  useEffect(() => {
    // Load related posts
    const load = async () => {
      try {
        const res = await fetch('/api/blog/posts?category=' + encodeURIComponent(post.category || ''));
        if (res.ok) {
          const data = await res.json();
          const related = data.posts
            .filter((p: any) => p.id !== post.id && p.slug !== post.slug)
            .slice(0, 3);
          setRelatedPosts(related);
        }
      } catch {}
    };
    load();
  }, [post.category, post.id, post.slug]);

  const author = post.authorUser?.name || post.authorTherapist?.name || 'Autor';
  const calculateReadTime = (content: string): string => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min`;
  };

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
            {post.category && (
              <div className="flex items-center justify-center mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {post.category}
                </span>
              </div>
            )}
            
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
              {post.title}
            </h1>
            
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                {post.excerpt}
              </p>
            )}
            
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-green-600">
                    {author.split(' ').map(n => n[0]).slice(0,2).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{author}</p>
                  <p>{new Date(post.publishedAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {calculateReadTime(post.content)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Image */}
      {post.coverImage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="aspect-w-16 aspect-h-9 mb-12">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}

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
      {relatedPosts.length > 0 && (
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Artigos Relacionados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((related) => (
                <article key={related.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {related.coverImage && (
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={related.coverImage}
                        alt={related.title}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {related.category && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                        {related.category}
                      </span>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {related.title}
                    </h3>
                    {related.excerpt && (
                      <p className="text-gray-600 text-sm mb-4">
                        {related.excerpt.substring(0, 100)}...
                      </p>
                    )}
                    <Link
                      href={`/blog/${related.slug}`}
                      className="inline-flex items-center text-green-600 hover:text-green-500 text-sm font-medium"
                    >
                      Ler mais
                      <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

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

