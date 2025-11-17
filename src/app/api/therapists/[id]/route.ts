import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const therapist = await prisma.therapist.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        specialties: true,
        photoUrl: true,
        approved: true,
        canPostBlog: true,
      }
    });
    if (!therapist) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(therapist);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch therapist' }, { status: 500 });
  }
}
