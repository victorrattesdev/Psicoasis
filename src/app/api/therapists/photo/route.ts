import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, photoUrl } = body as { id?: string; photoUrl?: string };
    if (!id || !photoUrl) {
      return NextResponse.json({ error: 'Missing id or photoUrl' }, { status: 400 });
    }

    await prisma.therapist.update({ where: { id }, data: { photoUrl } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 });
  }
}
