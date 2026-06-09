import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { isSafeImageValue, isValidEmailFormat } from '@/lib/security';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    // Só o próprio terapeuta ou um admin pode ver o perfil completo (inclui email).
    if (auth.role !== 'ADMIN' && auth.sub !== id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const therapist = await prisma.therapist.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        specialties: true,
        photoUrl: true,
        profile: true,
        approved: true,
        canPostBlog: true,
      }
    });
    if (!therapist) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      ...therapist,
      specialties: (therapist.specialties as any) ?? [],
      profile: (therapist.profile as any) ?? {}
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch therapist' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    // Só o próprio terapeuta ou um admin pode editar o perfil.
    if (auth.role !== 'ADMIN' && auth.sub !== id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { name, email, photoUrl, bio, crp, specialties, profile } = body as {
      name?: string;
      email?: string;
      photoUrl?: string | null;
      bio?: string | null;
      crp?: string | null;
      specialties?: string[];
      profile?: any;
    };

    if (photoUrl && !isSafeImageValue(photoUrl)) {
      return NextResponse.json({ error: 'URL de imagem inválida (use https)' }, { status: 400 });
    }
    if (email !== undefined && !isValidEmailFormat(email)) {
      return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 });
    }

    const data: Record<string, any> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (photoUrl !== undefined) data.photoUrl = photoUrl || null;
    if (bio !== undefined) data.bio = bio || null;
    if (crp !== undefined) data.license = crp || null;
    if (Array.isArray(specialties)) data.specialties = specialties;
    if (profile !== undefined) data.profile = profile;

    const updated = await prisma.therapist.update({
      where: { id },
      data
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      bio: updated.bio,
      photoUrl: updated.photoUrl,
      specialties: (updated.specialties as any) ?? [],
      profile: (updated.profile as any) ?? {}
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update therapist' }, { status: 500 });
  }
}
