import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fromJsonString } from '@/lib/json-utils';

export async function GET() {
  try {
    // Fetch all approved therapists
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
        name: 'asc' // Order alphabetically by name
      }
    });

    console.log(`📊 Found ${therapists.length} approved therapist(s)`);

    // Parse JSON fields and format response
    const formatted = therapists.map(t => {
      const parsedProfile = fromJsonString(t.profile as string);
      return {
        ...t,
        specialties: fromJsonString(t.specialties as string) ?? [],
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
