import { Metadata } from "next";
import { prisma } from "@/lib/db";
import BlogPostClient from "./BlogPostClient";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
      select: {
        title: true,
        metaTitle: true,
        metaDescription: true,
        excerpt: true,
        coverImage: true,
        keywords: true,
        authorUser: { select: { name: true } },
        authorTherapist: { select: { name: true } }
      }
    });

    if (!post) {
      return {
        title: "Post não encontrado - OASIS da Superdotação",
      };
    }

    const title = post.metaTitle || post.title;
    const description = post.metaDescription || post.excerpt || "Artigo do OASIS da Superdotação";
    const author = post.authorUser?.name || post.authorTherapist?.name || "OASIS da Superdotação";

    return {
      title: `${title} - OASIS da Superdotação`,
      description,
      keywords: post.keywords ? post.keywords.split(',').map(k => k.trim()) : undefined,
      authors: [{ name: author }],
      openGraph: {
        title,
        description,
        images: post.coverImage ? [post.coverImage] : undefined,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: post.coverImage ? [post.coverImage] : undefined,
      },
    };
  } catch {
    return {
      title: "Post - OASIS da Superdotação",
    };
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  let post;
  try {
    post = await prisma.post.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        coverImage: true,
        category: true,
        publishedAt: true,
        authorUser: { select: { name: true, email: true } },
        authorTherapist: { select: { name: true, email: true } }
      }
    });
  } catch {
    notFound();
  }

  if (!post || !post.publishedAt) {
    notFound();
  }

  return <BlogPostClient post={post} />;
}

