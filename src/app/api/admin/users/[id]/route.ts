import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Helper to locate record and infer type
async function findUserOrTherapistById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (user) return { type: 'paciente' as const, record: user };
  const therapist = await prisma.therapist.findUnique({ where: { id } });
  if (therapist) return { type: 'profissional' as const, record: therapist };
  return null;
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const found = await findUserOrTherapistById(id);
    if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (found.type === 'paciente') {
      const u = found.record as any;
      return NextResponse.json({ id: u.id, name: u.name ?? '', email: u.email, type: 'paciente', role: u.role, createdAt: u.createdAt, updatedAt: u.updatedAt, profile: u.profile ?? {} });
    }
    const t = found.record as any;
    return NextResponse.json({ id: t.id, name: t.name, email: t.email, type: 'profissional', role: 'USER', createdAt: t.createdAt, updatedAt: t.updatedAt, profile: t.profile ?? {} });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, role, profile } = body as { name?: string; email?: string; role?: 'USER' | 'ADMIN'; profile?: any };
    const { id } = await ctx.params;
    const found = await findUserOrTherapistById(id);
    if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (found.type === 'paciente') {
      // Update user; allow role toggle
      const updated = await prisma.user.update({
        where: { id },
        data: {
          name: name ?? undefined,
          email: email ?? undefined,
          role: role ?? undefined,
          profile: profile ?? undefined,
        },
      });
      return NextResponse.json({ id: updated.id, name: updated.name ?? '', email: updated.email, type: 'paciente', role: updated.role, profile: updated.profile ?? {} });
    }

    // Therapist: update name/email only (no role)
    const updatedT = await prisma.therapist.update({
      where: { id },
      data: {
        name: name ?? undefined,
        email: email ?? undefined,
        profile: profile ?? undefined,
      },
    });
    return NextResponse.json({ id: updatedT.id, name: updatedT.name, email: updatedT.email, type: 'profissional', role: 'USER', profile: updatedT.profile ?? {} });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const found = await findUserOrTherapistById(id);
    if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (found.type === 'paciente') {
      // Never delete admin
      const user = found.record as any;
      if (user.role === 'ADMIN') return NextResponse.json({ error: 'Cannot delete admin' }, { status: 400 });
      await prisma.user.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }
    await prisma.therapist.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}


