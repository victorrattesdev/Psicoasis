import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { isSafeImageValue } from "@/lib/security";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    // Autorização: o próprio usuário, um admin, ou um terapeuta vinculado a este paciente.
    let allowed = auth.role === "ADMIN" || auth.sub === id;
    if (!allowed && auth.type === "profissional") {
      const therapist = await prisma.therapist.findUnique({
        where: { id: auth.sub },
        select: { profile: true }
      });
      const patientIds = ((therapist?.profile as any)?.patientIds as string[]) ?? [];
      allowed = Array.isArray(patientIds) && patientIds.includes(id);
    }
    if (!allowed) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, profile: true, role: true }
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (user.role === "ADMIN" && auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }
    return NextResponse.json({
      id: user.id,
      name: user.name ?? "",
      email: user.email,
      profile: (user.profile as any) ?? {}
    });
  } catch {
    return NextResponse.json({ error: "Failed to load user" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    // Só o próprio usuário ou um admin pode editar o perfil.
    if (auth.role !== "ADMIN" && auth.sub !== id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const incomingProfile = body?.profile ?? {};

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, profile: true }
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (user.role === "ADMIN" && auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    if (incomingProfile?.photoUrl && !isSafeImageValue(incomingProfile.photoUrl)) {
      return NextResponse.json({ error: "URL de imagem inválida (use https)" }, { status: 400 });
    }

    const existingProfile = (user.profile as any) ?? {};
    const allowed = {
      cep: incomingProfile?.cep,
      endereco: incomingProfile?.endereco,
      cidade: incomingProfile?.cidade,
      estado: incomingProfile?.estado,
      photoUrl: incomingProfile?.photoUrl
    };
    const nextProfile = { ...existingProfile, ...allowed };

    await prisma.user.update({
      where: { id },
      data: { profile: nextProfile }
    });

    return NextResponse.json({ profile: nextProfile });
  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
