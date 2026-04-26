import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fromJsonString, toJsonString } from '@/lib/json-utils';

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
        profile: true,
        approved: true,
        canPostBlog: true,
      }
    });
    if (!therapist) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    return NextResponse.json({
      ...therapist,
      specialties: fromJsonString(therapist.specialties as string) ?? [],
      profile: fromJsonString(therapist.profile as string) ?? {}
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch therapist' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, photoUrl, bio, crp, specialties, profile } = body as {
      name?: string;
      email?: string;
      photoUrl?: string | null;
      bio?: string | null;
      crp?: string | null;
      specialties?: string[];
      profile?: any;
    };

    const data: Record<string, any> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (photoUrl !== undefined) data.photoUrl = photoUrl || null;
    if (bio !== undefined) data.bio = bio || null;
    if (crp !== undefined) data.license = crp || null;
    if (Array.isArray(specialties)) data.specialties = toJsonString(specialties);
    if (profile !== undefined) data.profile = toJsonString(profile);

    const updated = await prisma.therapist.update({
      where: { id: params.id },
      data
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      bio: updated.bio,
      photoUrl: updated.photoUrl,
      specialties: fromJsonString(updated.specialties as string) ?? [],
      profile: fromJsonString(updated.profile as string) ?? {}
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update therapist' }, { status: 500 });
  }
}
