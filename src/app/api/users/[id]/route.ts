import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fromJsonString, toJsonString } from "@/lib/json-utils";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
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
      profile: fromJsonString(user.profile as string) ?? {}
    });
  } catch {
    return NextResponse.json({ error: "Failed to load user" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const incomingProfile = body?.profile ?? {};

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, role: true, profile: true }
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (user.role === "ADMIN") {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    const existingProfile = fromJsonString(user.profile as string) ?? {};
    const allowed = {
      cep: incomingProfile?.cep,
      endereco: incomingProfile?.endereco,
      cidade: incomingProfile?.cidade,
      estado: incomingProfile?.estado,
      photoUrl: incomingProfile?.photoUrl
    };
    const nextProfile = { ...existingProfile, ...allowed };

    await prisma.user.update({
      where: { id: params.id },
      data: { profile: toJsonString(nextProfile) }
    });

    return NextResponse.json({ profile: nextProfile });
  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
