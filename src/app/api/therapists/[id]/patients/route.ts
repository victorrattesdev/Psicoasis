import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fromJsonString, toJsonString } from "@/lib/json-utils";
import { sanitizeEmail, validateEmail } from "@/lib/validations";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const therapist = await prisma.therapist.findUnique({
      where: { id: params.id },
      select: { profile: true }
    });
    if (!therapist) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const profile = fromJsonString(therapist.profile as string) ?? {};
    const patientIds = Array.isArray(profile?.patientIds) ? profile.patientIds : [];
    if (patientIds.length === 0) return NextResponse.json({ patients: [] });

    const users = await prisma.user.findMany({
      where: { id: { in: patientIds } },
      select: { id: true, name: true, email: true, role: true }
    });

    const patients = users
      .filter((u) => u.role !== "ADMIN")
      .map((u) => ({
        id: u.id,
        name: u.name ?? u.email.split("@")[0],
        email: u.email
      }));

    return NextResponse.json({ patients });
  } catch {
    return NextResponse.json({ error: "Failed to load patients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body as { email?: string };
    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 });
    }

    const sanitizedEmail = sanitizeEmail(email);
    const user = await prisma.user.findFirst({ where: { email: sanitizedEmail } });
    if (!user) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
    }
    if (user.role === "ADMIN") {
      return NextResponse.json({ error: "Usuário inválido para vínculo" }, { status: 400 });
    }

    const therapist = await prisma.therapist.findUnique({
      where: { id: params.id },
      select: { profile: true }
    });
    if (!therapist) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const profile = fromJsonString(therapist.profile as string) ?? {};
    const patientIds = Array.isArray(profile?.patientIds) ? profile.patientIds : [];
    if (patientIds.includes(user.id)) {
      return NextResponse.json({ error: "Paciente já está na lista" }, { status: 409 });
    }
    patientIds.push(user.id);

    await prisma.therapist.update({
      where: { id: params.id },
      data: { profile: toJsonString({ ...profile, patientIds }) }
    });

    const patients = await prisma.user.findMany({
      where: { id: { in: patientIds } },
      select: { id: true, name: true, email: true, role: true }
    });

    return NextResponse.json({
      patients: patients
        .filter((u) => u.role !== "ADMIN")
        .map((u) => ({ id: u.id, name: u.name ?? u.email.split("@")[0], email: u.email }))
    });
  } catch {
    return NextResponse.json({ error: "Falha ao adicionar paciente" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const { patientId } = body as { patientId?: string };
    if (!patientId) {
      return NextResponse.json({ error: "Paciente inválido" }, { status: 400 });
    }

    const therapist = await prisma.therapist.findUnique({
      where: { id: params.id },
      select: { profile: true }
    });
    if (!therapist) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const profile = fromJsonString(therapist.profile as string) ?? {};
    const patientIds = Array.isArray(profile?.patientIds) ? profile.patientIds : [];
    const nextPatientIds = patientIds.filter((id: string) => id !== patientId);

    await prisma.therapist.update({
      where: { id: params.id },
      data: { profile: toJsonString({ ...profile, patientIds: nextPatientIds }) }
    });

    const patients = await prisma.user.findMany({
      where: { id: { in: nextPatientIds } },
      select: { id: true, name: true, email: true, role: true }
    });

    return NextResponse.json({
      patients: patients
        .filter((u) => u.role !== "ADMIN")
        .map((u) => ({ id: u.id, name: u.name ?? u.email.split("@")[0], email: u.email }))
    });
  } catch {
    return NextResponse.json({ error: "Falha ao remover paciente" }, { status: 500 });
  }
}
