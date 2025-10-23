import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, type, profile } = body as { email: string; name?: string; type: 'paciente' | 'profissional'; profile?: any };
    if (!email || !type) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    // Check duplicates across both tables to avoid conflicts and false-positives
    const [existingUser, existingTherapist] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.therapist.findUnique({ where: { email } })
    ]);

    if (existingUser || existingTherapist) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    if (type === 'paciente') {
      const created = await prisma.user.create({ data: { email, name: name ?? null, profile: profile ?? null } });
      return NextResponse.json({ id: created.id, email: created.email, name: created.name ?? '', type: 'paciente', role: created.role, profile: created.profile ?? {} });
    }

    const created = await prisma.therapist.create({ data: { email, name: name ?? email.split('@')[0], specialties: [], profile: profile ?? null } });
    return NextResponse.json({ id: created.id, email: created.email, name: created.name, type: 'profissional', role: 'USER', profile: created.profile ?? {} });
  } catch (error: any) {
    // Handle unique constraint errors nicely
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}


