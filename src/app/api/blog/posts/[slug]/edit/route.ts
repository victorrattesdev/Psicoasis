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
import type { VerifiedPayload } from '@/lib/jwt';

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

// Verifica se o usuário do token pode acessar/editar o post.
async function canEditPost(
  auth: VerifiedPayload,
  post: { authorUserId: string | null; authorTherapistId: string | null }
): Promise<boolean> {
  if (auth.role === 'ADMIN') return true;
  if (auth.type === 'profissional') {
    if (post.authorTherapistId !== auth.sub) return false;
    const therapist = await prisma.therapist.findUnique({
      where: { id: auth.sub },
      select: { canPostBlog: true },
    });
    return !!therapist?.canPostBlog;
  }
  // Paciente autor do post (caso exista).
  return post.authorUserId === auth.sub;
}

// GET - Buscar post para edição
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { slug } = await params;
    const post = await prisma.post.findUnique({
      where: { slug },
      select: {
        id: true, title: true, slug: true, content: true, excerpt: true,
        coverImage: true, category: true, published: true, publishedAt: true,
        metaTitle: true, metaDescription: true, keywords: true,
        authorUserId: true, authorTherapistId: true,
        authorUser: { select: { name: true, email: true } },
        authorTherapist: { select: { name: true, email: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (!(await canEditPost(auth, post))) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json({
      ...post,
      status: post.published ? 'published' : 'draft',
      featuredImage: post.coverImage,
    });
  } catch (error) {
    console.error('Error loading post for edit:', error);
    return NextResponse.json({ error: 'Failed to load post' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { slug } = await params;
    const body = await req.json();
    const { title, content, excerpt, coverImage, category, metaTitle, metaDescription, keywords, published } = body;

    const existing = await prisma.post.findUnique({
      where: { slug },
      select: { id: true, authorUserId: true, authorTherapistId: true, published: true, publishedAt: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
    }

    if (!(await canEditPost(auth, existing))) {
      return NextResponse.json({ error: 'Não autorizado: Você não tem permissão para editar este post' }, { status: 403 });
    }

    if (!content || !title) {
      return NextResponse.json({ error: 'Título e conteúdo são obrigatórios' }, { status: 400 });
    }

    // Limites de tamanho + validação de imagem.
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

    const updateData: Record<string, any> = {
      content: sanitizeHtml(content.trim()),
      excerpt: excerpt?.trim() || null,
      coverImage: coverImage?.trim() || null,
      category: category?.trim() || null,
      metaTitle: metaTitle?.trim() || null,
      metaDescription: metaDescription?.trim() || null,
      keywords: keywords?.trim() || null,
      published: published === true,
    };

    if (published === true) {
      if (!existing.published || !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    } else {
      updateData.publishedAt = null;
    }

    const newSlug = slugify(title);
    const slugOwner = await prisma.post.findUnique({ where: { slug: newSlug }, select: { id: true } });
    if (!slugOwner || slugOwner.id === existing.id) {
      updateData.title = title.trim();
      updateData.slug = newSlug;
    }

    const updated = await prisma.post.update({ where: { slug }, data: updateData });

    return NextResponse.json({ id: updated.id, slug: updated.slug, message: 'Post atualizado com sucesso' });
  } catch (error: any) {
    console.error('Error updating post:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Slug já existe. Por favor, use um título diferente.' }, { status: 409 });
    }
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
    }
    return NextResponse.json(
      { error: isProd ? 'Erro ao atualizar post.' : (error?.message || 'Erro ao atualizar post.') },
      { status: 500 }
    );
  }
}
