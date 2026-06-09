import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminPayload } from "@/lib/auth";

const DEFAULT_KEY = "default";

export async function GET() {
  try {
    const existing = await prisma.courseContent.findUnique({
      where: { key: DEFAULT_KEY },
      select: { content: true }
    });
    if (!existing) {
      return NextResponse.json({ sections: null });
    }
    return NextResponse.json({ sections: existing.content ?? null });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return NextResponse.json(
        { error: "Tabela de cursos não existe. Rode prisma db push." },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Failed to load courses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminPayload(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json().catch(() => ({}));
    const { sections } = body as { sections?: unknown };

    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
    }

    const saved = await prisma.courseContent.upsert({
      where: { key: DEFAULT_KEY },
      update: { content: sections },
      create: { key: DEFAULT_KEY, content: sections }
    });

    return NextResponse.json({ sections: saved.content ?? [] });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return NextResponse.json(
        { error: "Tabela de cursos não existe. Rode prisma db push." },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Failed to save courses" }, { status: 500 });
  }
}
