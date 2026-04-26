import { NextRequest, NextResponse } from 'next/server';
import { prisma, handlePrismaError } from '@/lib/db';
import { validateEmail, sanitizeEmail } from '@/lib/validations';
import { signUserToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('ADMIN_EMAIL or ADMIN_PASSWORD env vars not set');
      return NextResponse.json({ error: 'Servidor mal configurado' }, { status: 500 });
    }

    const body = await req.json();
    const { email, password } = body as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 });
    }

    const sanitizedEmail = sanitizeEmail(email);

    if (sanitizedEmail !== adminEmail || password !== adminPassword) {
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 });
    }

    const admin = await prisma.user.findFirst({
      where: { email: sanitizedEmail, role: 'ADMIN' }
    });

    if (!admin) {
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 });
    }

    const token = await signUserToken({
      sub: admin.id,
      email: admin.email,
      name: admin.name ?? 'Administrador',
      type: 'profissional',
      role: 'ADMIN'
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name ?? 'Administrador',
        type: 'profissional',
        role: 'ADMIN'
      }
    });

  } catch (error: unknown) {
    const prismaError = handlePrismaError(error);
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: prismaError.message || 'Erro ao fazer login. Tente novamente.' },
      { status: 500 }
    );
  }
}
