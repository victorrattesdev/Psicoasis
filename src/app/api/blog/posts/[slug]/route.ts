import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const post = await prisma.post.findUnique({
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
        metaTitle: true,
        metaDescription: true,
        keywords: true,
        authorUser: {
          select: { name: true, email: true }
        },
        authorTherapist: {
          select: { name: true, email: true }
        }
      }
    });

    if (!post || !post.publishedAt) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const formatted = {
      ...post,
      author: post.authorUser?.name || post.authorTherapist?.name || 'Autor',
      authorEmail: post.authorUser?.email || post.authorTherapist?.email
    };

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load post' }, { status: 500 });
  }
}

