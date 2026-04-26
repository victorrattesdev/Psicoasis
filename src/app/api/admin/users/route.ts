import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fromJsonString, toJsonString } from '@/lib/json-utils';
import { validateEmail, validateName, sanitizeEmail, sanitizeString } from '@/lib/validations';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const unauthorized = await requireAdmin(req);
    if (unauthorized) return unauthorized;

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
          approved: t.approved,
          photoUrl: t.photoUrl ?? null
        };
      })
    ];

    return NextResponse.json({ users: normalized });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const unauthorized = await requireAdmin(req);
    if (unauthorized) return unauthorized;

    const body = await req.json();
    const { email, name, type, profile } = body as {
      email: string;
      name?: string;
      type: 'profissional';
      profile?: any;
    };

    if (!email || !name || !type) {
      return NextResponse.json({ error: 'Nome, email e tipo são obrigatórios' }, { status: 400 });
    }

    if (type !== 'profissional') {
      return NextResponse.json({ error: 'Tipo inválido para criação administrativa' }, { status: 400 });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 });
    }

    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return NextResponse.json({ error: nameValidation.error }, { status: 400 });
    }

    const sanitizedEmail = sanitizeEmail(email);

    const [existingUser, existingTherapist] = await Promise.all([
      prisma.user.findFirst({ where: { email: sanitizedEmail } }),
      prisma.therapist.findFirst({ where: { email: sanitizedEmail } })
    ]);

    if (existingUser || existingTherapist) {
      return NextResponse.json({ error: 'Este email já está cadastrado no sistema' }, { status: 409 });
    }

    const created = await prisma.therapist.create({
      data: {
        email: sanitizedEmail,
        name: sanitizeString(name) || sanitizedEmail.split('@')[0],
        specialties: toJsonString(Array.isArray(profile?.especialidades) ? profile.especialidades : []),
        profile: toJsonString(profile),
        photoUrl: profile?.photoUrl ? sanitizeString(profile.photoUrl) : null,
        license: profile?.crp ? sanitizeString(profile.crp) : null,
        bio: profile?.bio ? sanitizeString(profile.bio) : null,
        approved: false,
        canPostBlog: false
      }
    });

    const normalized = {
      id: created.id,
      name: created.name,
      email: created.email,
      type: 'profissional',
      role: 'USER',
      createdAt: created.createdAt.toISOString().slice(0, 10),
      lastLogin: '',
      profile: fromJsonString(created.profile as string) ?? {},
      crp: profile?.crp || created.license,
      especialidades: Array.isArray(profile?.especialidades) ? profile.especialidades : [],
      canPostBlog: created.canPostBlog,
      approved: created.approved,
      photoUrl: created.photoUrl ?? null
    };

    return NextResponse.json({ user: normalized }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create professional' }, { status: 500 });
  }
}


