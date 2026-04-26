import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const therapists = await prisma.therapist.findMany({
      where: { approved: true },
      select: {
        id: true,
        name: true,
        email: true,
        license: true,
        bio: true,
        specialties: true,
        photoUrl: true,
        approved: true,
        canPostBlog: true,
        profile: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`📊 Found ${therapists.length} approved therapist(s)`);

    const formatted = therapists.map(t => {
      const parsedProfile = t.profile as any;
      return {
        ...t,
        specialties: (t.specialties as any) ?? [],
        profile: parsedProfile,
        license: t.license ?? parsedProfile?.crp ?? null
      };
    });

    return NextResponse.json({ therapists: formatted });
  } catch (error) {
    console.error('Error loading approved therapists:', error);
    return NextResponse.json({ error: 'Failed to load therapists' }, { status: 500 });
  }
}
