import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Buscar post por ID ou slug
// Aceita tanto ID (CUID) quanto slug
// Se o post estiver publicado, retorna formato público
// Se não estiver publicado, retorna formato para edição
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const therapistId = searchParams.get("therapistId");
    const adminEmail = searchParams.get("adminEmail");
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

    // If not published, allow only admin or post author
    let canAccess = false;
    if (userId) {
      const user = await prisma.user.findFirst({ where: { id: userId }, select: { role: true } });
      if (user?.role === "ADMIN" || post.authorUserId === userId) {
        canAccess = true;
      }
    }
    if (!canAccess && adminEmail) {
      const adminUser = await prisma.user.findFirst({ where: { email: adminEmail }, select: { role: true } });
      if (adminUser?.role === "ADMIN" || adminEmail === "admin@admin.com") {
        canAccess = true;
      }
    }
    if (!canAccess && therapistId) {
      const therapist = await prisma.therapist.findFirst({ where: { id: therapistId }, select: { canPostBlog: true } });
      if (therapist?.canPostBlog && post.authorTherapistId === therapistId) {
        canAccess = true;
      }
    }

    if (!canAccess) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const therapistId = searchParams.get("therapistId");
    const adminEmail = searchParams.get("adminEmail");
    const { slug } = await params;
    const identifier = slug; // Pode ser ID ou slug
    
    // Try to find by ID first
    let post = await prisma.post.findUnique({
      where: { id: identifier },
      select: { id: true, authorUserId: true, authorTherapistId: true }
    });

    // If not found by ID, try by slug
    if (!post) {
      post = await prisma.post.findUnique({
        where: { slug: identifier },
        select: { id: true, authorUserId: true, authorTherapistId: true }
      });
    }

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    let canDelete = false;
    if (userId) {
      const user = await prisma.user.findFirst({ where: { id: userId }, select: { role: true } });
      if (user?.role === "ADMIN" || post.authorUserId === userId) {
        canDelete = true;
      }
    }
    if (!canDelete && adminEmail) {
      const adminUser = await prisma.user.findFirst({ where: { email: adminEmail }, select: { role: true } });
      if (adminUser?.role === "ADMIN" || adminEmail === "admin@admin.com") {
        canDelete = true;
      }
    }
    if (!canDelete && therapistId) {
      const therapist = await prisma.therapist.findFirst({ where: { id: therapistId }, select: { canPostBlog: true } });
      if (therapist?.canPostBlog && post.authorTherapistId === therapistId) {
        canDelete = true;
      }
    }

    if (!canDelete) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
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

