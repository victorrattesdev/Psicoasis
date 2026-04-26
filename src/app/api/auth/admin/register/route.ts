import { NextRequest, NextResponse } from 'next/server';
import { prisma, handlePrismaError } from '@/lib/db';
import { sanitizeEmail, sanitizeString } from '@/lib/validations';

function checkSecret(req: NextRequest): boolean {
  const secret = process.env.ADMIN_INIT_SECRET;
  if (!secret) return false;
  const provided = req.nextUrl.searchParams.get('secret');
  return provided === secret;
}

// Inicializa o admin padrão — protegido por ADMIN_INIT_SECRET
// Uso: GET /api/auth/admin/register?secret=SEU_SECRET
export async function GET(req: NextRequest) {
  if (!checkSecret(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminName = process.env.ADMIN_NAME ?? 'Administrador';

    if (!adminEmail) {
      return NextResponse.json({ error: 'ADMIN_EMAIL não configurado' }, { status: 500 });
    }

    const existing = await prisma.user.findFirst({
      where: { email: sanitizeEmail(adminEmail), role: 'ADMIN' }
    });

    if (existing) {
      return NextResponse.json({ exists: true, message: 'Administrador já existe' });
    }

    const admin = await prisma.user.create({
      data: {
        email: sanitizeEmail(adminEmail),
        name: sanitizeString(adminName) || 'Administrador',
        role: 'ADMIN',
        profile: { isAdmin: true, createdAt: new Date().toISOString() }
      }
    });

    return NextResponse.json({
      created: true,
      message: 'Administrador criado com sucesso',
      admin: { id: admin.id, email: admin.email, name: admin.name }
    }, { status: 201 });

  } catch (error: unknown) {
    const prismaError = handlePrismaError(error);
    console.error('Admin init error:', error);
    return NextResponse.json(
      { error: prismaError.message || 'Erro ao inicializar administrador' },
      { status: 500 }
    );
  }
}

// Cria admin adicional — protegido por ADMIN_INIT_SECRET
// Uso: POST /api/auth/admin/register?secret=SEU_SECRET
export async function POST(req: NextRequest) {
  if (!checkSecret(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, name } = body as { email: string; name?: string };

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    const sanitizedEmail = sanitizeEmail(email);

    const existing = await prisma.user.findFirst({ where: { email: sanitizedEmail } });
    if (existing) {
      return NextResponse.json({ error: 'Este email já está cadastrado' }, { status: 409 });
    }

    const admin = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        name: sanitizeString(name) || 'Administrador',
        role: 'ADMIN',
        profile: { isAdmin: true, createdAt: new Date().toISOString() }
      }
    });

    return NextResponse.json({
      id: admin.id,
      email: admin.email,
      name: admin.name ?? '',
      role: admin.role,
      message: 'Administrador criado com sucesso'
    }, { status: 201 });

  } catch (error: unknown) {
    const prismaError = handlePrismaError(error);
    console.error('Admin registration error:', error);
    return NextResponse.json(
      { error: prismaError.message || 'Erro ao criar administrador.' },
      { status: 500 }
    );
  }
}
