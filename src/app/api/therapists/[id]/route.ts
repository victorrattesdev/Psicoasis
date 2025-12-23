import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fromJsonString } from '@/lib/json-utils';

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
    
    return NextResponse.json({
      ...therapist,
      specialties: fromJsonString(therapist.specialties as string) ?? []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch therapist' }, { status: 500 });
  }
}
