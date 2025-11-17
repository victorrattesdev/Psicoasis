import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    await prisma.therapist.update({ where: { id }, data: { approved: true } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to approve therapist' }, { status: 500 });
  }
}
