import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Fetch minimal fields, filter approved
    const therapists = await prisma.therapist.findMany({
      where: { approved: true },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        specialties: true,
        photoUrl: true,
      }
    });

    // Shuffle in-memory to ensure random order on each request
    for (let i = therapists.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [therapists[i], therapists[j]] = [therapists[j], therapists[i]];
    }

    return NextResponse.json({ therapists });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load therapists' }, { status: 500 });
  }
}
