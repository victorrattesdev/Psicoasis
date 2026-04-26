"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import SiteFooter from "@/components/SiteFooter";

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
    const textOnly = (() => {
      if (typeof window === "undefined") {
        return content
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;|&#160;/gi, " ")
          .replace(/\s+/g, " ")
          .trim();
      }
      const container = document.createElement("div");
      container.innerHTML = content;
      return (container.textContent || container.innerText || "").replace(/\s+/g, " ").trim();
    })();
    const words = textOnly.match(/\b[\p{L}\p{N}]+\b/gu)?.length ?? 0;
    const minutes = words > 0 ? Math.max(1, Math.ceil(words / 200)) : 0;
    return `${minutes} min`;
  };
  const formattedContent = post.content.includes("<")
    ? post.content
    : post.content.replace(/\n/g, "<br />");

  return (
    <div className="min-h-screen bg-gray-50">
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
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#fff4c1] text-[#7a5a00]">
                  {post.category}
                </span>
              </div>
            )}
            
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
              {post.title}
            </h1>
            
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto break-words text-balance">
                {post.excerpt}
              </p>
            )}
            
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-[#fff4c1] flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-[#7a5a00]">
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
        <div className="bg-white rounded-lg shadow-sm p-8 overflow-hidden">
          <div 
            className="prose prose-lg max-w-none text-gray-900 prose-p:text-gray-800 prose-li:text-gray-800 prose-headings:text-gray-900 prose-strong:font-bold prose-b:font-bold prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-700 [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-700 break-words prose-img:max-w-full prose-img:h-auto"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fff4c1] text-[#7a5a00] mb-2">
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
                      className="inline-flex items-center text-[#d4af37] hover:text-[#c9a227] text-sm font-medium"
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

      <SiteFooter />
    </div>
  );
}

