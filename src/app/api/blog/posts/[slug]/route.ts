import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Buscar post por ID ou slug
// Aceita tanto ID (CUID) quanto slug
// Se o post estiver publicado, retorna formato público
// Se não estiver publicado, retorna formato para edição
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const identifier = slug; // O parâmetro pode ser ID ou slug
    
    console.log('🔍 Fetching post with identifier:', identifier);

    // Try to find by ID first
    let post = null;
    
    if (identifier && identifier.trim().length > 0) {
      const trimmedId = identifier.trim();
      
      // Try by ID first
      try {
        post = await prisma.post.findUnique({
          where: { id: trimmedId },
          select: {
            id: true,
            title: true,
            slug: true,
            content: true,
            excerpt: true,
            coverImage: true,
            category: true,
            published: true,
            publishedAt: true,
            metaTitle: true,
            metaDescription: true,
            keywords: true,
            authorUserId: true,
            authorTherapistId: true,
            authorUser: {
              select: { name: true, email: true }
            },
            authorTherapist: {
              select: { name: true, email: true }
            }
          }
        });
      } catch (error: any) {
        console.error('❌ Error finding by ID:', error?.message);
      }
    }
    
    // If not found by ID, try by slug
    if (!post && identifier && identifier.trim().length > 0) {
      const trimmedSlug = identifier.trim();
      
      try {
        post = await prisma.post.findUnique({
          where: { slug: trimmedSlug },
          select: {
            id: true,
            title: true,
            slug: true,
            content: true,
            excerpt: true,
            coverImage: true,
            category: true,
            published: true,
            publishedAt: true,
            metaTitle: true,
            metaDescription: true,
            keywords: true,
            authorUserId: true,
            authorTherapistId: true,
            authorUser: {
              select: { name: true, email: true }
            },
            authorTherapist: {
              select: { name: true, email: true }
            }
          }
        });
      } catch (error: any) {
        console.error('❌ Error finding by slug:', error?.message);
      }
    }

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // If post is published, return public format
    if (post.published && post.publishedAt) {
      const formatted = {
        ...post,
        author: post.authorUser?.name || post.authorTherapist?.name || 'Autor',
        authorEmail: post.authorUser?.email || post.authorTherapist?.email
      };
      return NextResponse.json(formatted);
    }

    // If not published, return edit format (for admin/author editing)
    return NextResponse.json({
      ...post,
      status: post.published ? 'published' : 'draft',
      featuredImage: post.coverImage
    });
  } catch (error: any) {
    console.error('❌ Error loading post:', error);
    return NextResponse.json({ 
      error: error?.message || 'Failed to load post' 
    }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const identifier = slug; // Pode ser ID ou slug
    
    // Try to find by ID first
    let post = await prisma.post.findUnique({
      where: { id: identifier },
      select: { id: true }
    });

    // If not found by ID, try by slug
    if (!post) {
      post = await prisma.post.findUnique({
        where: { slug: identifier },
        select: { id: true }
      });
    }

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await prisma.post.delete({
      where: { id: post.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}

