import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { isSafeImageValue } from '@/lib/security';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { id, photoUrl } = body as { id?: string; photoUrl?: string };
    if (!id || !photoUrl) {
      return NextResponse.json({ error: 'Missing id or photoUrl' }, { status: 400 });
    }

    // Só o próprio terapeuta ou um admin pode alterar a foto.
    if (auth.role !== 'ADMIN' && auth.sub !== id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    if (!isSafeImageValue(photoUrl)) {
      return NextResponse.json({ error: 'URL de imagem inválida (use https)' }, { status: 400 });
    }

    await prisma.therapist.update({ where: { id }, data: { photoUrl } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 });
  }
}
