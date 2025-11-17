import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.therapist.update({
      where: { id: params.id },
      data: { canPostBlog: true }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to authorize therapist' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.therapist.update({
      where: { id: params.id },
      data: { canPostBlog: false }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to revoke authorization' }, { status: 500 });
  }
}

