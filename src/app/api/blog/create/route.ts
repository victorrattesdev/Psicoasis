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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, therapistId, title, content, excerpt, coverImage, category, metaTitle, metaDescription, keywords, published } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Check permissions
    let hasPermission = false;
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      hasPermission = user?.role === 'ADMIN';
    } else if (therapistId) {
      const therapist = await prisma.therapist.findUnique({ where: { id: therapistId }, select: { canPostBlog: true } });
      hasPermission = therapist?.canPostBlog === true;
    }

    if (!hasPermission) {
      return NextResponse.json({ error: 'Unauthorized: You do not have permission to create posts' }, { status: 403 });
    }

    // Get or create default blog
    let blog = await prisma.blog.findFirst();
    if (!blog) {
      blog = await prisma.blog.create({
        data: { title: 'Estudos do OASIS', description: 'Blog do OASIS da Superdotação' }
      });
    }

    // Generate unique slug
    let slug = slugify(title);
    let slugExists = await prisma.post.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${slugify(title)}-${counter}`;
      slugExists = await prisma.post.findUnique({ where: { slug } });
      counter++;
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        category: category || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        keywords: keywords || null,
        published: published === true,
        publishedAt: published === true ? new Date() : null,
        authorUserId: userId || null,
        authorTherapistId: therapistId || null,
        blogId: blog.id
      }
    });

    return NextResponse.json({ id: post.id, slug: post.slug });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

