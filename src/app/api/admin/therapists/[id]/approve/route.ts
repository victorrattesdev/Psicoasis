import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const unauthorized = await requireAdmin(_req);
    if (unauthorized) return unauthorized;

    const { id } = await params;
    await prisma.therapist.update({ where: { id }, data: { approved: true } });
    console.log(`✅ Therapist ${id} approved`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error approving therapist:', error);
    return NextResponse.json({ error: 'Failed to approve therapist' }, { status: 500 });
  }
}
