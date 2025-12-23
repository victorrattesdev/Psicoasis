import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fromJsonString } from '@/lib/json-utils';

export async function GET() {
  try {
    const [users, therapists] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.therapist.findMany({ orderBy: { createdAt: 'desc' } })
    ]);

    const normalized = [
      ...users.map(u => {
        const profile = fromJsonString(u.profile as string) ?? {};
        return {
          id: u.id,
          name: u.name ?? '',
          email: u.email,
          type: 'paciente',
          role: u.role,
          createdAt: u.createdAt.toISOString().slice(0,10),
          lastLogin: '',
          profile
        };
      }),
      ...therapists.map(t => {
        const profile = fromJsonString(t.profile as string) ?? {};
        const specialties = fromJsonString(t.specialties as string) ?? [];
        return {
          id: t.id,
          name: t.name,
          email: t.email,
          type: 'profissional',
          role: 'USER',
          createdAt: t.createdAt.toISOString().slice(0,10),
          lastLogin: '',
          profile,
          crp: profile?.crp || t.license,
          especialidades: Array.isArray(specialties) ? specialties : [],
          canPostBlog: t.canPostBlog,
          approved: t.approved
        };
      })
    ];

    return NextResponse.json({ users: normalized });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}


