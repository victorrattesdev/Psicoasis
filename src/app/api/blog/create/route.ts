import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import {
  sanitizeHtml,
  isSafeImageValue,
  exceedsLength,
  MAX_TITLE_LENGTH,
  MAX_EXCERPT_LENGTH,
  MAX_SHORT_FIELD_LENGTH,
  MAX_META_FIELD_LENGTH,
  MAX_CONTENT_LENGTH,
} from '@/lib/security';

const isProd = process.env.NODE_ENV === 'production';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export async function POST(req: NextRequest) {
  // 1) Autenticação: identidade vem do token, nunca do body.
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { title, content, excerpt, coverImage, category, metaTitle, metaDescription, keywords, published } = body;

    if (!title || !content || title.trim().length === 0 || content.trim().length === 0) {
      return NextResponse.json({ error: 'Título e conteúdo são obrigatórios' }, { status: 400 });
    }

    // 2) Limites de tamanho (anti-abuso de armazenamento).
    if (exceedsLength(title, MAX_TITLE_LENGTH)) {
      return NextResponse.json({ error: 'Título muito longo' }, { status: 413 });
    }
    if (exceedsLength(content, MAX_CONTENT_LENGTH)) {
      return NextResponse.json({ error: 'Conteúdo excede o tamanho máximo permitido' }, { status: 413 });
    }
    if (exceedsLength(excerpt, MAX_EXCERPT_LENGTH) || exceedsLength(category, MAX_SHORT_FIELD_LENGTH)) {
      return NextResponse.json({ error: 'Campo excede o tamanho máximo permitido' }, { status: 413 });
    }
    if (
      exceedsLength(metaTitle, MAX_META_FIELD_LENGTH) ||
      exceedsLength(metaDescription, MAX_META_FIELD_LENGTH) ||
      exceedsLength(keywords, MAX_META_FIELD_LENGTH)
    ) {
      return NextResponse.json({ error: 'Metadados excedem o tamanho máximo permitido' }, { status: 413 });
    }
    if (!isSafeImageValue(coverImage)) {
      return NextResponse.json({ error: 'Imagem de capa inválida (use uma URL https)' }, { status: 400 });
    }

    // 3) Autorização: admin (User) ou terapeuta autorizado a postar.
    let finalUserId: string | null = null;
    let finalTherapistId: string | null = null;

    if (auth.role === 'ADMIN') {
      finalUserId = auth.sub;
    } else if (auth.type === 'profissional') {
      const therapist = await prisma.therapist.findUnique({
        where: { id: auth.sub },
        select: { id: true, canPostBlog: true },
      });
      if (!therapist || !therapist.canPostBlog) {
        return NextResponse.json({ error: 'Você não tem permissão para criar posts' }, { status: 403 });
      }
      finalTherapistId = therapist.id;
    } else {
      return NextResponse.json({ error: 'Você não tem permissão para criar posts' }, { status: 403 });
    }

    // 4) Sanitiza o HTML do conteúdo (anti-XSS armazenado).
    const safeContent = sanitizeHtml(content.trim());

    // Blog padrão.
    let blog = await prisma.blog.findFirst();
    if (!blog) {
      blog = await prisma.blog.create({
        data: { title: 'Estudos do OASIS', description: 'Blog do OASIS da Superdotação' },
      });
    }

    // Slug único.
    let slug = slugify(title);
    let counter = 1;
    while (await prisma.post.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${slugify(title)}-${counter}`;
      counter += 1;
      if (counter > 100) break;
    }

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        slug,
        content: safeContent,
        excerpt: excerpt?.trim() || null,
        coverImage: coverImage?.trim() || null,
        category: category?.trim() || null,
        metaTitle: metaTitle?.trim() || null,
        metaDescription: metaDescription?.trim() || null,
        keywords: keywords?.trim() || null,
        published: published === true,
        publishedAt: published === true ? new Date() : null,
        authorUserId: finalUserId,
        authorTherapistId: finalTherapistId,
        blogId: blog.id,
      },
    });

    return NextResponse.json({ id: post.id, slug: post.slug });
  } catch (error: any) {
    console.error('Error creating post:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Slug já existe. Tente com um título diferente.' }, { status: 409 });
    }
    return NextResponse.json(
      { error: isProd ? 'Erro ao criar post.' : (error?.message || 'Erro ao criar post.') },
      { status: 500 }
    );
  }
}
