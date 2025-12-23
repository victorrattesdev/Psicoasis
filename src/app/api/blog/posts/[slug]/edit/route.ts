import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// GET - Buscar post para edição
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    console.log('🔍 GET edit endpoint - Loading post with slug:', slug);
    
    const post = await prisma.post.findUnique({
      where: { slug },
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

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...post,
      status: post.published ? 'published' : 'draft',
      featuredImage: post.coverImage
    });
  } catch (error) {
    console.error('Error loading post for edit:', error);
    return NextResponse.json({ error: 'Failed to load post' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { userId, therapistId, title, content, excerpt, coverImage, category, metaTitle, metaDescription, keywords, published } = body;

    console.log('✏️ PUT edit endpoint - Updating post with slug:', slug, { userId, therapistId, title });

    const existing = await prisma.post.findUnique({
      where: { slug },
      select: { id: true, authorUserId: true, authorTherapistId: true, published: true, publishedAt: true }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
    }

    // Check permissions - allow ADMIN users to edit any post
    let hasPermission = false;
    
    // Check if user is admin (admin is always a User in the database)
    if (userId) {
      const user = await prisma.user.findFirst({ where: { id: userId }, select: { role: true, email: true } });
      console.log('User found:', { id: userId, role: user?.role, email: user?.email });
      if (user?.role === 'ADMIN') {
        // Admin can edit any post
        hasPermission = true;
        console.log('Permission granted: Admin user');
      } else if (existing.authorUserId === userId) {
        // User can edit their own posts
        hasPermission = true;
        console.log('Permission granted: Post author');
      }
    }
    
    // Check if therapist has permission
    if (!hasPermission && therapistId) {
      const therapist = await prisma.therapist.findFirst({ where: { id: therapistId } });
      console.log('Therapist found:', { id: therapistId, email: therapist?.email, canPostBlog: (therapist as any)?.canPostBlog });
      if (therapist) {
        // Therapist can edit their own posts if they have canPostBlog permission
        if ((therapist as any)?.canPostBlog === true && existing.authorTherapistId === therapistId) {
          hasPermission = true;
          console.log('Permission granted: Therapist author');
        }
      }
    }
    
    // If no userId or therapistId provided, try to find admin user
    if (!hasPermission && !userId && !therapistId) {
      console.log('No userId or therapistId provided, checking for admin user');
      const adminUser = await prisma.user.findFirst({ 
        where: { email: 'admin@admin.com', role: 'ADMIN' } 
      });
      if (adminUser) {
        hasPermission = true;
        console.log('Permission granted: Default admin');
      }
    }

    if (!hasPermission) {
      console.error('Permission denied:', { userId, therapistId, existing, slug: params.slug });
      return NextResponse.json({ error: 'Não autorizado: Você não tem permissão para editar este post' }, { status: 403 });
    }

    // Validate required fields
    if (!content || !title) {
      return NextResponse.json({ error: 'Título e conteúdo são obrigatórios' }, { status: 400 });
    }

    const updateData: any = {
      content: content.trim(),
      excerpt: excerpt?.trim() || null,
      coverImage: coverImage?.trim() || null,
      category: category?.trim() || null,
      metaTitle: metaTitle?.trim() || null,
      metaDescription: metaDescription?.trim() || null,
      keywords: keywords?.trim() || null,
      published: published === true,
    };

    // Handle publishedAt based on published status
    if (published === true) {
      // If publishing (or already published), set publishedAt
      // Only set to now if it's being published for the first time
      if (!existing.published || !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
      // If already published, keep the existing publishedAt (don't update it)
    } else {
      // When unpublishing, clear publishedAt so it doesn't appear in public blog
      updateData.publishedAt = null;
    }

    if (title) {
      let newSlug = slugify(title);
      try {
        const slugExists = await (prisma.post as any).findMany({ 
          where: { slug: newSlug },
          select: { id: true }
        });
        if (!slugExists || slugExists.length === 0 || (slugExists.length === 1 && slugExists[0]?.id === existing.id)) {
          updateData.title = title;
          updateData.slug = newSlug;
        }
      } catch (error: any) {
        // If slug field doesn't exist, just update title
        updateData.title = title;
        console.warn('Could not check slug uniqueness:', error?.message);
      }
    }

    console.log('✏️ Updating post with data:', { slug, updateData });

    const updated = await prisma.post.update({
      where: { slug },
      data: updateData
    });

    console.log('Post updated successfully:', { id: updated.id, slug: updated.slug });
    return NextResponse.json({ id: updated.id, slug: updated.slug, message: 'Post atualizado com sucesso' });
  } catch (error: any) {
    console.error('Error updating post:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Slug já existe. Por favor, use um título diferente.' }, { status: 409 });
    }
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ 
      error: error?.message || 'Erro ao atualizar post. Tente novamente.' 
    }, { status: 500 });
  }
}
