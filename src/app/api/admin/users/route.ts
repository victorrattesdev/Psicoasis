import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const [users, therapists] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.therapist.findMany({ orderBy: { createdAt: 'desc' } })
    ]);

    const normalized = [
      ...users.map(u => ({
        id: u.id,
        name: u.name ?? '',
        email: u.email,
        type: 'paciente',
        role: u.role,
        createdAt: u.createdAt.toISOString().slice(0,10),
        lastLogin: '',
        profile: u.profile ?? {}
      })),
      ...therapists.map(t => ({
        id: t.id,
        name: t.name,
        email: t.email,
        type: 'profissional',
        role: 'USER',
        createdAt: t.createdAt.toISOString().slice(0,10),
        lastLogin: '',
        profile: t.profile ?? {},
        crp: (t.profile as any)?.crp,
        especialidades: Array.isArray((t.profile as any)?.especialidades) ? (t.profile as any).especialidades : []
      }))
    ];

    return NextResponse.json({ users: normalized });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}


