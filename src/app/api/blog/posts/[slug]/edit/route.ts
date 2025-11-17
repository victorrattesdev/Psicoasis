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

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json();
    const { userId, therapistId, title, content, excerpt, coverImage, category, metaTitle, metaDescription, keywords, published } = body;

    const existing = await prisma.post.findUnique({
      where: { slug: params.slug },
      select: { authorUserId: true, authorTherapistId: true, published: true }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check permissions
    let hasPermission = false;
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      hasPermission = user?.role === 'ADMIN' || existing.authorUserId === userId;
    } else if (therapistId) {
      const therapist = await prisma.therapist.findUnique({ where: { id: therapistId }, select: { canPostBlog: true } });
      hasPermission = (therapist?.canPostBlog === true) && (existing.authorTherapistId === therapistId);
    }

    if (!hasPermission) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updateData: any = {
      content,
      excerpt: excerpt || null,
      coverImage: coverImage || null,
      category: category || null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      keywords: keywords || null,
      published: published === true,
    };

    if (published === true && !existing.published) {
      updateData.publishedAt = new Date();
    }

    if (title) {
      let newSlug = slugify(title);
      const slugExists = await prisma.post.findUnique({ where: { slug: newSlug } });
      if (!slugExists || slugExists.id === existing.id) {
        updateData.title = title;
        updateData.slug = newSlug;
      }
    }

    const updated = await prisma.post.update({
      where: { slug: params.slug },
      data: updateData
    });

    return NextResponse.json({ id: updated.id, slug: updated.slug });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

