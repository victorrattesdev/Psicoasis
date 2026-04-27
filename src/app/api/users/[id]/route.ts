import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, profile: true, role: true }
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (user.role === "ADMIN") {
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
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const incomingProfile = body?.profile ?? {};

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, profile: true }
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (user.role === "ADMIN") {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
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
